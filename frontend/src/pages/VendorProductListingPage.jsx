import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const navItems = [
  { label: 'Shop Profile', icon: '🏪' },
  { label: 'Product Selection', icon: '▣' },
  { label: 'Manage Listings', icon: '🧾' },
  { label: 'Approval Status', icon: '✓' },
  { label: 'Settings', icon: '⚙' },
];

const statusClassName = {
  'In Stock': 'listing-status in-stock',
  'Low Stock': 'listing-status low-stock',
  'Out of Stock': 'listing-status out-of-stock',
};

export default function VendorProductListingPage({ user, onViewChange }) {
  const [catalogSearchTerm, setCatalogSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [stockStatus, setStockStatus] = useState('In Stock');
  const [officialCatalog, setOfficialCatalog] = useState([]);
  const [listings, setListings] = useState([]);
  const [shop, setShop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [activeItem, setActiveItem] = useState('Product Selection');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingListingId, setEditingListingId] = useState(null);

  const vendorName = user?.name || user?.email || 'Vendor';

  // Fetch official catalog, vendor shop, and vendor listings from MongoDB
  const loadData = async () => {
    setIsLoading(true);
    setNotice('');
    try {
      const [productsRes, shopRes] = await Promise.all([
        api.get('/api/products').catch(() => ({ products: [] })),
        api.get('/api/shops/my-shop').catch(() => ({ shop: null })),
      ]);

      setOfficialCatalog(productsRes.products || []);
      setShop(shopRes.shop || null);

      if (productsRes.products && productsRes.products.length > 0) {
        setSelectedProduct(productsRes.products[0]);
      }

      if (shopRes.shop) {
        const listingsRes = await api.get('/api/listings/my-listings').catch(() => ({ listings: [] }));
        setListings(listingsRes.listings || []);
      }
    } catch (error) {
      setNotice('Failed to load data from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCatalog = useMemo(() => {
    const q = catalogSearchTerm.trim().toLowerCase();
    if (!q) return officialCatalog;

    return officialCatalog.filter((product) =>
      [product.name, product.category, product.unit].join(' ').toLowerCase().includes(q)
    );
  }, [catalogSearchTerm, officialCatalog]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      const pName = listing.product?.name || '';
      const cat = listing.product?.category || '';
      return pName.toLowerCase().includes(q) || cat.toLowerCase().includes(q);
    });
  }, [listings, searchTerm]);

  const handlePublishListing = async () => {
    if (!shop) {
      setNotice('Please create a Shop Profile first before adding listings.');
      return;
    }

    if (shop.status !== 'Approved') {
      setNotice(`Your shop status is "${shop.status}". Listings can only be published once Admin approves your shop.`);
      return;
    }

    if (!selectedProduct) {
      setNotice('Please select an official product from the catalog.');
      return;
    }

    const priceNum = parseFloat(currentPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setNotice('Please enter a valid price greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setNotice('');

    try {
      if (editingListingId) {
        await api.put(`/api/listings/${editingListingId}`, {
          price: priceNum,
          stockStatus,
        });
        setNotice('Listing updated successfully!');
      } else {
        await api.post('/api/listings', {
          product: selectedProduct._id,
          price: priceNum,
          stockStatus,
        });
        setNotice('Listing published successfully to your shop!');
      }

      setEditingListingId(null);
      setCurrentPrice('');
      setStockStatus('In Stock');

      // Reload listings from DB
      const listingsRes = await api.get('/api/listings/my-listings');
      setListings(listingsRes.listings || []);
    } catch (error) {
      setNotice(error.message || 'Failed to publish listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditListing = (listing) => {
    setActiveItem('Product Selection');
    setEditingListingId(listing._id);
    if (listing.product) {
      setSelectedProduct(listing.product);
    }
    setCurrentPrice(String(listing.price));
    setStockStatus(listing.stockStatus || 'In Stock');
    setNotice(`Editing listing for ${listing.product?.name}. Modify price or stock and click Update.`);
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this product listing?')) return;

    try {
      await api.delete(`/api/listings/${listingId}`);
      setNotice('Listing deleted from database.');
      setListings((current) => current.filter((item) => item._id !== listingId));
    } catch (error) {
      setNotice(error.message || 'Failed to delete listing.');
    }
  };

  return (
    <div className="vendor-listing-shell">
      <aside className="vendor-listing-sidebar">
        <div className="vendor-listing-brand">MarketEye</div>

        <div className="vendor-listing-user-card">
          <div className="vendor-listing-avatar">{vendorName.charAt(0).toUpperCase()}</div>
          <div>
            <div className="vendor-listing-user-name">{vendorName}</div>
            <div className="vendor-listing-user-role">Shop Management</div>
          </div>
        </div>

        <nav className="vendor-listing-nav">
          {navItems.map((item) => {
            const targetView =
              item.label === 'Shop Profile' || item.label === 'Approval Status' || item.label === 'Settings'
                ? 'vendor-profile'
                : 'vendor-listing';

            return (
              <button
                key={item.label}
                type="button"
                className={`vendor-listing-nav-item ${activeItem === item.label ? 'active' : ''}`}
                onClick={() => {
                  setActiveItem(item.label);
                  onViewChange?.(targetView);
                }}
              >
                <span className="vendor-listing-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="vendor-listing-add-btn"
          onClick={() => {
            setActiveItem('Product Selection');
            setEditingListingId(null);
            setCurrentPrice('');
            setNotice('Select an official product from MongoDB catalog, set price and stock, then publish.');
          }}
        >
          + Add Product
        </button>
      </aside>

      <section className="vendor-listing-content">
        <div className="vendor-listing-page-title-wrap">
          <h1>
            {activeItem === 'Product Selection'
              ? 'Vendor Product Selection'
              : activeItem === 'Manage Listings'
              ? 'Manage Vendor Listings'
              : activeItem}
          </h1>
          <p>
            {activeItem === 'Product Selection'
              ? 'Select official products created by Admin, set your shop price & stock, and publish directly to MongoDB.'
              : activeItem === 'Manage Listings'
              ? 'Review all your live listings, edit pricing, or remove items.'
              : 'Your vendor workspace is synced with live database data.'}
          </p>
        </div>

        {/* Shop status check banner */}
        {shop && shop.status !== 'Approved' && (
          <div
            style={{
              backgroundColor: '#fffbe6',
              border: '1px solid #ffe58f',
              padding: '14px 18px',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#873800',
              fontSize: '14px',
            }}
          >
            ⚠️ Your shop status is <strong>{shop.status}</strong>. Only approved shops can publish active listings to customers.
          </div>
        )}

        {!shop && (
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '14px 18px',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#1e40af',
              fontSize: '14px',
            }}
          >
            ℹ️ You have not created a shop profile yet.{' '}
            <span
              style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => onViewChange?.('vendor-profile')}
            >
              Click here to create your shop profile.
            </span>
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner spinner-teal"></div>
          </div>
        ) : activeItem === 'Manage Listings' ? (
          <div className="vendor-listing-grid single-mode">
            <div className="vendor-listing-card vendor-listing-table-card">
              <div className="vendor-listing-card-title-row">
                <div className="vendor-listing-card-title">My Live Listings ({listings.length})</div>
                <div className="vendor-listing-search-filter">
                  <span>⌕</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Filter listings..."
                  />
                </div>
              </div>

              <div className="vendor-listing-table-head">
                <span>Product Name</span>
                <span>Price</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {filteredListings.length > 0 ? (
                filteredListings.map((listing) => (
                  <div key={listing._id} className="vendor-listing-row vendor-listing-action-row">
                    <div className="vendor-listing-product-cell">
                      <div className="vendor-listing-product-thumb">⦿</div>
                      <div>
                        <div className="vendor-listing-product-name">{listing.product?.name || 'Product'}</div>
                        <div className="vendor-listing-product-category">
                          {listing.product?.category} • {listing.product?.unit}
                        </div>
                      </div>
                    </div>
                    <div className="vendor-listing-price-cell">${listing.price?.toFixed(2)}</div>
                    <div className="vendor-listing-status-cell">
                      <span className={statusClassName[listing.stockStatus] || 'listing-status'}>
                        {listing.stockStatus}
                      </span>
                    </div>
                    <div className="vendor-listing-actions-cell">
                      <button
                        type="button"
                        className="vendor-listing-action-btn edit"
                        onClick={() => handleEditListing(listing)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="vendor-listing-action-btn delete"
                        onClick={() => handleDeleteListing(listing._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No listings found. Go to "Product Selection" to create your first listing.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="vendor-listing-grid single-mode">
            <div className="vendor-listing-card">
              <div className="vendor-listing-card-title">Product Selection (Official Catalog)</div>

              <div className="vendor-listing-field-label">Select Official Product from Database</div>
              <div className="vendor-listing-searchbox">
                <span>⌕</span>
                <input
                  type="text"
                  value={catalogSearchTerm}
                  onChange={(event) => setCatalogSearchTerm(event.target.value)}
                  placeholder="Search official catalog..."
                />
              </div>

              <div className="vendor-listing-catalog-list">
                {filteredCatalog.length > 0 ? (
                  filteredCatalog.map((product) => (
                    <button
                      key={product._id}
                      type="button"
                      className={`vendor-listing-catalog-item ${
                        selectedProduct?._id === product._id ? 'selected' : ''
                      }`}
                      onClick={() => {
                        setSelectedProduct(product);
                        setNotice(`Selected: ${product.name}`);
                      }}
                    >
                      <div>
                        <div className="vendor-listing-product-name">{product.name}</div>
                        <div className="vendor-listing-product-category">
                          {product.category} • {product.unit}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div style={{ padding: '20px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    No active products found in official catalog. Admin must add official products first.
                  </div>
                )}
              </div>

              {selectedProduct && (
                <div className="vendor-listing-selected-product">
                  <div className="vendor-listing-field-label">Selected Product</div>
                  <div className="vendor-listing-selected-box">
                    <div className="vendor-listing-product-name">{selectedProduct.name}</div>
                    <div className="vendor-listing-product-category">
                      {selectedProduct.category} • {selectedProduct.unit}
                    </div>
                  </div>
                </div>
              )}

              <label className="vendor-listing-form-label">Your Current Price ($)</label>
              <div className="vendor-listing-price-input">
                <span>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={currentPrice}
                  onChange={(event) => setCurrentPrice(event.target.value)}
                  placeholder="0.00"
                />
              </div>

              <label className="vendor-listing-form-label">Stock Status</label>
              <div className="vendor-listing-status-selector">
                {['In Stock', 'Low Stock', 'Out of Stock'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`vendor-listing-chip ${stockStatus === option ? 'selected' : ''}`}
                    onClick={() => setStockStatus(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="vendor-listing-publish-btn"
                onClick={handlePublishListing}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving...'
                  : editingListingId
                  ? 'Update Listing'
                  : '⤴ Publish Listing'}
              </button>

              {notice && (
                <div
                  className="vendor-listing-notice"
                  style={{
                    marginTop: '14px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: notice.includes('Failed') || notice.includes('Please') || notice.includes('status') ? '#fef2f2' : '#f0fdf4',
                    color: notice.includes('Failed') || notice.includes('Please') || notice.includes('status') ? '#dc2626' : '#166534',
                  }}
                >
                  {notice}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
