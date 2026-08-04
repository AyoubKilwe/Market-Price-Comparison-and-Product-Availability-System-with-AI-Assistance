import React, { useEffect, useMemo, useState } from 'react';

const initialListings = [
  {
    id: 1,
    productName: 'Basmati Rice 5kg',
    category: 'Staples & Grains',
    price: '$14.59',
    status: 'In Stock',
    updated: 'Today, 09:41',
  },
  {
    id: 2,
    productName: 'Organic Brown Eggs (Dozen)',
    category: 'Dairy & Eggs',
    price: '$6.99',
    status: 'Low Stock',
    updated: 'Yesterday',
  },
  {
    id: 3,
    productName: 'Extra Virgin Olive Oil 1L',
    category: 'Pantry',
    price: '$18.25',
    status: 'Out of Stock',
    updated: 'Oct 12, 2023',
  },
];

const officialCatalog = [
  {
    name: 'Premium Basmati Rice 5kg',
    category: 'Staples & Grains',
    unit: '5kg',
  },
  {
    name: 'Organic Brown Eggs (Dozen)',
    category: 'Dairy & Eggs',
    unit: 'Dozen',
  },
  {
    name: 'Extra Virgin Olive Oil 1L',
    category: 'Pantry',
    unit: '1L',
  },
  {
    name: 'Fresh Aloe Vera Drink 500ml',
    category: 'Beverages',
    unit: '500ml',
  },
];

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
  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [stockStatus, setStockStatus] = useState('In Stock');
  const [listings, setListings] = useState(initialListings);
  const [notice, setNotice] = useState('');
  const [activeItem, setActiveItem] = useState('Product Selection');
  const [shopImage, setShopImage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(officialCatalog[0]);
  const [editingListingId, setEditingListingId] = useState(null);
  const statusSummary = [
    { label: 'Pending', tone: 'pending' },
    { label: 'Approved', tone: 'approved' },
    { label: 'Rejected', tone: 'rejected' },
    { label: 'Suspended', tone: 'suspended' },
  ];

  const vendorName = user?.name || user?.fullName || user?.email || 'Vendor';

  useEffect(() => {
    const draft = localStorage.getItem('marketeye_vendor_profile_draft');
    if (!draft) return;

    try {
      const parsedDraft = JSON.parse(draft);
      if (parsedDraft.shopImage) setShopImage(parsedDraft.shopImage);
    } catch (error) {
      console.error('Could not restore vendor profile image', error);
    }
  }, []);

  const filteredCatalog = useMemo(() => {
    const q = catalogSearchTerm.trim().toLowerCase();
    if (!q) return officialCatalog;

    return officialCatalog.filter((product) =>
      [product.name, product.category, product.unit].join(' ').toLowerCase().includes(q)
    );
  }, [catalogSearchTerm]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return listing.productName.toLowerCase().includes(q) || listing.category.toLowerCase().includes(q);
    });
  }, [listings, searchTerm]);

  const handlePublishListing = () => {
    if (!selectedProduct) {
      setNotice('Please select a product from the official catalog first.');
      return;
    }

    const publishedListing = {
      id: editingListingId ?? Date.now(),
      productName: selectedProduct.name,
      category: selectedProduct.category,
      price: `$${Number(currentPrice || 0).toFixed(2)}`,
      status: stockStatus,
      updated: editingListingId ? 'Edited just now' : 'Just now',
    };

    setListings((current) => {
      if (editingListingId) {
        return current.map((entry) => (entry.id === editingListingId ? publishedListing : entry));
      }

      return [publishedListing, ...current];
    });

    setNotice(editingListingId ? 'Listing updated successfully.' : 'Listing published successfully.');
    setEditingListingId(null);
    setCurrentPrice('0.00');
    setStockStatus('In Stock');
  };

  const handleEditListing = (listing) => {
    setActiveItem('Product Selection');
    setEditingListingId(listing.id);
    setSelectedProduct({
      name: listing.productName,
      category: listing.category,
      unit: listing.productName.split(' ').slice(-1)[0],
    });
    setCurrentPrice(listing.price.replace('$', ''));
    setStockStatus(listing.status);
    setNotice(`Editing ${listing.productName}. Update the price or stock and publish again.`);
  };

  const handleDeleteListing = (id) => {
    setListings((current) => current.filter((listing) => listing.id !== id));
    setNotice('Listing removed from your shop inventory.');
  };

  return (
    <div className="vendor-listing-shell">
      <aside className="vendor-listing-sidebar">
        <div className="vendor-listing-brand">MarketEye</div>

        <div className="vendor-listing-user-card">
          <div className="vendor-listing-avatar">
            {shopImage ? (
              <img
                src={shopImage}
                alt="Shop logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              'V'
            )}
          </div>
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

                  if (item.label === 'Approval Status') {
                    setNotice('Approval status is visible from your shop management workspace.');
                  } else if (item.label === 'Settings') {
                    setNotice('Shop settings are ready for future vendor preferences.');
                  } else if (item.label === 'Shop Profile') {
                    setNotice('Shop profile is available for vendor details and image updates.');
                  }
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
            setNotice('Select an official product, set price and stock, then publish the listing.');
            onViewChange?.('vendor-listing');
          }}
        >
          + Add Product
        </button>
      </aside>

      <section className="vendor-listing-content">
        <div className="vendor-listing-page-title-wrap">
          <h1>{activeItem === 'Product Selection' ? 'Vendor Product Selection' : activeItem === 'Manage Listings' ? 'Manage Vendor Listings' : activeItem}</h1>
          <p>
            {activeItem === 'Product Selection'
              ? 'Select products from the official MarketEye catalog, configure the price, and publish your shop inventory.'
              : activeItem === 'Manage Listings'
                ? 'Review every personal listing, update pricing, and remove outdated inventory from the shop view.'
                : 'Your shop dashboard keeps every vendor workflow visible in one streamlined workspace.'}
          </p>
        </div>

        {activeItem === 'Manage Listings' ? (
          <div className="vendor-listing-grid single-mode">
            <div className="vendor-listing-card vendor-listing-table-card">
              <div className="vendor-listing-card-title-row">
                <div className="vendor-listing-card-title">Manage My Listings</div>
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
                <span>Updated</span>
                <span>Actions</span>
              </div>

              {filteredListings.map((listing, index) => (
                <div key={`${listing.productName}-${index}`} className="vendor-listing-row vendor-listing-action-row">
                  <div className="vendor-listing-product-cell">
                    <div className="vendor-listing-product-thumb">⦿</div>
                    <div>
                      <div className="vendor-listing-product-name">{listing.productName}</div>
                      <div className="vendor-listing-product-category">{listing.category}</div>
                    </div>
                  </div>
                  <div className="vendor-listing-price-cell">{listing.price}</div>
                  <div className="vendor-listing-status-cell">
                    <span className={statusClassName[listing.status]}>{listing.status}</span>
                  </div>
                  <div className="vendor-listing-updated-cell">{listing.updated}</div>
                  <div className="vendor-listing-actions-cell">
                    <button type="button" className="vendor-listing-action-btn edit" onClick={() => handleEditListing(listing)}>
                      Edit
                    </button>
                    <button type="button" className="vendor-listing-action-btn delete" onClick={() => handleDeleteListing(listing.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              <div className="vendor-listing-pagination-row">
                <span>Showing 1-3 of 42 listings</span>
                <div className="vendor-listing-pagination-icons">
                  <span>‹</span>
                  <span>›</span>
                </div>
              </div>
            </div>
          </div>
        ) : activeItem === 'Approval Status' ? (
          <div className="vendor-listing-grid single-mode">
            <div className="vendor-listing-card">
              <div className="vendor-listing-card-title">Approval Status</div>
              <div className="vendor-status-grid">
                {statusSummary.map((state) => (
                  <div key={state.label} className={`vendor-status-chip ${state.tone}`}>
                    <strong>{state.label}</strong>
                    <span>Review state</span>
                  </div>
                ))}
              </div>
              <div className="vendor-listing-notice">Current shop review status: Pending Approval</div>
            </div>
          </div>
        ) : activeItem === 'Settings' ? (
          <div className="vendor-listing-grid single-mode">
            <div className="vendor-listing-card">
              <div className="vendor-listing-card-title">Vendor Settings</div>
              <div className="vendor-settings-rows">
                <div className="vendor-setting-item">
                  <span>Auto-sync with catalog</span>
                  <button type="button" className="vendor-mini-toggle on">Enabled</button>
                </div>
                <div className="vendor-setting-item">
                  <span>Price alert notifications</span>
                  <button type="button" className="vendor-mini-toggle on">On</button>
                </div>
                <div className="vendor-setting-item">
                  <span>Stock freshness reminders</span>
                  <button type="button" className="vendor-mini-toggle">Weekly</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="vendor-listing-grid single-mode">
            <div className="vendor-listing-card">
              <div className="vendor-listing-card-title">Product Selection</div>

              <div className="vendor-listing-field-label">Official Product List</div>
              <div className="vendor-listing-searchbox">
                <span>⌕</span>
                <input
                  type="text"
                  value={catalogSearchTerm}
                  onChange={(event) => setCatalogSearchTerm(event.target.value)}
                  placeholder="Search official catalog"
                />
              </div>

              <div className="vendor-listing-catalog-list">
                {filteredCatalog.map((product) => (
                  <button
                    key={product.name}
                    type="button"
                    className={`vendor-listing-catalog-item ${selectedProduct?.name === product.name ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedProduct(product);
                      setNotice(`Selected ${product.name} from the official catalog.`);
                    }}
                  >
                    <div>
                      <div className="vendor-listing-product-name">{product.name}</div>
                      <div className="vendor-listing-product-category">{product.category} • {product.unit}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="vendor-listing-selected-product">
                <div className="vendor-listing-field-label">Selected Product</div>
                <div className="vendor-listing-selected-box">
                  <div className="vendor-listing-product-name">{selectedProduct?.name}</div>
                  <div className="vendor-listing-product-category">{selectedProduct?.category} • {selectedProduct?.unit}</div>
                </div>
              </div>

              <label className="vendor-listing-form-label">Your Current Price</label>
              <div className="vendor-listing-price-input">
                <span>$</span>
                <input
                  type="text"
                  value={currentPrice}
                  onChange={(event) => setCurrentPrice(event.target.value)}
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

              <button type="button" className="vendor-listing-publish-btn" onClick={handlePublishListing}>
                {editingListingId ? 'Update Listing' : '⤴ Publish Listing'}
              </button>

              {notice && <div className="vendor-listing-notice">{notice}</div>}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
