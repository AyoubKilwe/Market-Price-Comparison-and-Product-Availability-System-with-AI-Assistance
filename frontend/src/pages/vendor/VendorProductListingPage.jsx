import { useEffect, useMemo, useState } from 'react';
import VendorSidebar from './VendorSidebar';
import vendorApi from './vendorApi';


const statusClassName = {
  'In Stock': 'listing-status in-stock',
  'Low Stock': 'listing-status low-stock',
  'Out of Stock': 'listing-status out-of-stock',
};

export default function VendorProductListingPage({ user, onViewChange, onSignOut }) {
  const [catalogSearchTerm, setCatalogSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [listingUnit, setListingUnit] = useState('');
  const [stockStatus, setStockStatus] = useState('In Stock');
  const [officialCatalog, setOfficialCatalog] = useState([]);
  const [listings, setListings] = useState([]);
  const [shop, setShop] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingListingId, setEditingListingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, shopRes] = await Promise.all([
        vendorApi.getOfficialProducts().catch(() => ({ products: [] })),
        vendorApi.getMyShop().catch(() => ({ shop: null })),
      ]);

      setOfficialCatalog(productsRes.products || []);
      setShop(shopRes.shop);

      if (shopRes.shop) {
        const listingsRes = await vendorApi.getMyListings().catch(() => ({ listings: [] }));
        setListings(listingsRes.listings || []);
      }
    } catch (error) {
      console.error('Error loading vendor listing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filteredCatalog = useMemo(() => {
    const q = catalogSearchTerm.trim().toLowerCase();
    if (!q) return officialCatalog;
    return officialCatalog.filter((item) =>
      [item.name, item.category, item.unit].join(' ').toLowerCase().includes(q)
    );
  }, [officialCatalog, catalogSearchTerm]);

  const filteredListings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter((l) => {
      const pName = l.product?.name || '';
      return [pName, String(l.price), l.stockStatus].join(' ').toLowerCase().includes(q);
    });
  }, [listings, searchTerm]);

  const listingsByProduct = useMemo(
    () => new Map(listings.map((listing) => [listing.product?._id, listing])),
    [listings]
  );

  const handleSelectProduct = (product) => {
    const existingListing = listingsByProduct.get(product._id);
    if (existingListing) {
      handleStartEdit(existingListing);
      return;
    }
    setSelectedProduct(product);
    setEditingListingId(null);
    setCurrentPrice('');
    setListingUnit('');
    setStockStatus('In Stock');
    setNotice(`Selected "${product.name}". Enter your price and stock availability.`);
  };

  const handleSaveListing = async (e) => {
    e.preventDefault();
    if (!selectedProduct && !editingListingId) {
      setNotice('Please select an official product from the catalog on the left.');
      return;
    }

    const priceNum = parseFloat(currentPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setNotice('Please enter a valid price greater than $0.');
      return;
    }

    setIsSaving(true);
    setNotice('');

    try {
      if (editingListingId) {
        await vendorApi.updateListing(editingListingId, { price: priceNum, unit: listingUnit.trim(), stockStatus });
        setNotice('Listing updated successfully!');
      } else {
        await vendorApi.createListing({ product: selectedProduct._id, price: priceNum, unit: listingUnit.trim(), stockStatus });
        setNotice('New product price listing added!');
      }

      setSelectedProduct(null);
      setEditingListingId(null);
      setCurrentPrice('');
      setListingUnit('');
      setStockStatus('In Stock');

      const listingsRes = await vendorApi.getMyListings();
      setListings(listingsRes.listings || []);
    } catch (error) {
      setNotice(error.message || 'Failed to save listing.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (listing) => {
    setEditingListingId(listing._id);
    setSelectedProduct(listing.product);
    setCurrentPrice(String(listing.price));
    setListingUnit(listing.unit || '1 item');
    setStockStatus(listing.stockStatus || 'In Stock');
    setNotice(`Editing listing for "${listing.product?.name}".`);
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Remove this product price listing?')) return;
    try {
      await vendorApi.deleteListing(listingId);
      setNotice('Listing removed.');
      setListings((prev) => prev.filter((l) => l._id !== listingId));
    } catch (error) {
      setNotice(error.message || 'Failed to delete listing.');
    }
  };


  return (
    <div className="admin-product-shell vendor-portal">
      <VendorSidebar activeView="vendor-listing" user={user} shopName={shop?.shopName} onViewChange={onViewChange} />

      <section className="admin-product-content vendor-portal-content">
        <div className="admin-product-header-row">
          <div>
            <h1>Vendor Product Price Listings</h1>
            <p>Select official products and set your shop's price and stock availability.</p>
          </div>

          <div className="admin-product-searchbox">
            <span>🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your listings..."
            />
          </div>
          <button type="button" className="admin-signout-btn" onClick={onSignOut}>
            Sign out
          </button>
        </div>

        {!shop && (
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#fffbe6',
              border: '1px solid #ffe58f',
              marginBottom: '20px',
            }}
          >
            <strong>Note:</strong> You must create and register your shop in the
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#1677ff', textDecoration: 'underline', cursor: 'pointer', marginLeft: '6px' }}
              onClick={() => onViewChange?.('vendor-profile')}
            >
              Shop Profile
            </button>
            section before publishing price listings.
          </div>
        )}

        {notice && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: notice.includes('Failed') || notice.includes('Please') ? '#fef2f2' : '#f0fdf4',
              color: notice.includes('Failed') || notice.includes('Please') ? '#dc2626' : '#166534',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            {notice}
          </div>
        )}

        <div className="vendor-listing-panes">
          {/* Left: Official Catalog Selector */}
          <div className="vendor-listing-card">
            <div className="vendor-listing-card-title">
              <span>1. Choose a Product</span>
              <small>{filteredCatalog.length} products</small>
            </div>

            <div className="vendor-catalog-search">
              <span>ÃƒÂ¢Ã…â€™Ã¢â‚¬Â¢</span>
              <input
                type="text"
                placeholder="Search products or categories..."
                value={catalogSearchTerm}
                onChange={(e) => setCatalogSearchTerm(e.target.value)}
              />
            </div>

            <div className="vendor-catalog-list">
              {isLoading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Loading products...</div>
              ) : filteredCatalog.length > 0 ? (
                filteredCatalog.map((prod) => (
                  <button
                    type="button"
                    key={prod._id}
                    onClick={() => handleSelectProduct(prod)}
                    className={`vendor-catalog-item ${selectedProduct?._id === prod._id ? 'selected' : ''}`}
                  >
                    <div className="vendor-catalog-item-name">{prod.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Category: {prod.category} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Unit: {prod.unit}
                    </div>
                    <span className={`vendor-catalog-action ${listingsByProduct.has(prod._id) ? 'listed' : ''}`}>
                      {listingsByProduct.has(prod._id) ? 'Edit' : 'Add'}
                    </span>
                  </button>
                ))
              ) : (
                <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>No matching products.</div>
              )}
            </div>
          </div>

          {/* Right: Price & Stock Entry Form */}
          <form onSubmit={handleSaveListing} className="vendor-listing-card vendor-price-card">
            <div className="vendor-listing-card-title">
              2. {editingListingId ? 'Edit Price Listing' : 'Set Your Price'}
            </div>

            {selectedProduct && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fafafa', borderRadius: '6px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Selected Item:</div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{selectedProduct.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {selectedProduct.category} ({selectedProduct.unit})
                </div>
              </div>
            )}

            <label className="admin-product-field">
              <span>Selling Unit / Quantity *</span>
              <input
                type="text"
                value={listingUnit}
                onChange={(e) => setListingUnit(e.target.value)}
                placeholder="Example: 1 sack, half sack, 1 carton"
                maxLength="50"
                required
              />
            </label>

            <label className="admin-product-field">
              <span>Your Selling Price ($ USD) *</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder="e.g. 4.50"
                required
              />
            </label>

            <label className="admin-product-field">
              <span>Stock Status *</span>
              <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)}>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </label>

            <button
              type="submit"
              className="admin-product-save-btn"
              disabled={isSaving || !shop}
            >
              {isSaving ? 'Saving...' : editingListingId ? 'Update Listing' : 'Publish Price Listing'}
            </button>
          </form>
        </div>

        {/* Existing Listings Table */}
        <div className="admin-product-card admin-product-table-card vendor-listings-table" style={{ marginTop: '24px' }}>
          <div className="admin-product-card-title">Your Active Price Listings ({listings.length})</div>

          <div className="admin-product-table-head">
            <span>Product</span>
            <span>Category</span>
            <span>Price ($)</span>
            <span>Stock Status</span>
            <span>Actions</span>
          </div>

          {filteredListings.length > 0 ? (
            filteredListings.map((item) => (
              <div key={item._id} className="admin-product-row">
                <div className="admin-product-name-cell">
                  <div>{item.product?.name || 'Item'}</div>
                  <small style={{ color: '#64748b', fontWeight: 500 }}>{item.unit || '1 item'}</small>
                </div>
                <div>{item.product?.category}</div>
                <div style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                  ${item.price?.toFixed(2)}
                </div>
                <div>
                  <span className={statusClassName[item.stockStatus] || 'listing-status'}>
                    {item.stockStatus}
                  </span>
                </div>
                <div className="admin-product-actions">
                  <button
                    type="button"
                    className="admin-product-action-btn edit"
                    onClick={() => handleStartEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-product-action-btn delete"
                    onClick={() => handleDeleteListing(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              You have not created any price listings yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
