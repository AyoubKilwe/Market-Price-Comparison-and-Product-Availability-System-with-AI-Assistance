import React, { useMemo, useState } from 'react';

const initialListings = [
  {
    productName: 'Basmati Rice 5kg',
    category: 'Staples & Grains',
    price: '$14.59',
    status: 'In Stock',
    updated: 'Today, 09:41',
  },
  {
    productName: 'Organic Brown Eggs (Dozen)',
    category: 'Dairy & Eggs',
    price: '$6.99',
    status: 'Low Stock',
    updated: 'Yesterday',
  },
  {
    productName: 'Extra Virgin Olive Oil 1L',
    category: 'Pantry',
    price: '$18.25',
    status: 'Out of Stock',
    updated: 'Oct 12, 2023',
  },
];

const navItems = [
  { label: 'Overview', icon: '▦' },
  { label: 'Inventory', icon: '▣', active: true },
  { label: 'Approvals', icon: '✓' },
  { label: 'Vendors', icon: '◫' },
  { label: 'Settings', icon: '⚙' },
];

const statusClassName = {
  'In Stock': 'listing-status in-stock',
  'Low Stock': 'listing-status low-stock',
  'Out of Stock': 'listing-status out-of-stock',
};

export default function VendorProductListingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [stockStatus, setStockStatus] = useState('In Stock');
  const [listings, setListings] = useState(initialListings);
  const [notice, setNotice] = useState('');

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return listing.productName.toLowerCase().includes(q) || listing.category.toLowerCase().includes(q);
    });
  }, [listings, searchTerm]);

  const handlePublishListing = () => {
    setListings((current) => [
      {
        productName: 'New Vendor Listing',
        category: 'Official Product List',
        price: `$${Number(currentPrice || 0).toFixed(2)}`,
        status: stockStatus,
        updated: 'Just now',
      },
      ...current,
    ]);
    setNotice('Listing published successfully.');
  };

  return (
    <div className="vendor-listing-shell">
      <aside className="vendor-listing-sidebar">
        <div className="vendor-listing-brand">MarketEye</div>

        <div className="vendor-listing-user-card">
          <div className="vendor-listing-avatar">A</div>
          <div>
            <div className="vendor-listing-user-name">System Admin</div>
            <div className="vendor-listing-user-role">Global Management</div>
          </div>
        </div>

        <nav className="vendor-listing-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`vendor-listing-nav-item ${item.active ? 'active' : ''}`}
            >
              <span className="vendor-listing-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="vendor-listing-add-btn">
          + Add Product
        </button>
      </aside>

      <section className="vendor-listing-content">
        <div className="vendor-listing-page-title-wrap">
          <h1>Vendor Product Listing</h1>
          <p>Add new items to your shop's inventory from the official MarketEye product catalog and manage your active pricing.</p>
        </div>

        <div className="vendor-listing-grid">
          <div className="vendor-listing-card">
            <div className="vendor-listing-card-title">Add Listing</div>

            <div className="vendor-listing-field-label">Official Product List</div>
            <div className="vendor-listing-searchbox">
              <span>⌕</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search official catalog"
              />
            </div>

            <div className="vendor-listing-hint">
              Select an exact match to sync with market trends.
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
              ⤴ Publish Listing
            </button>

            {notice && <div className="vendor-listing-notice">{notice}</div>}
          </div>

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
            </div>

            {filteredListings.map((listing, index) => (
              <div key={`${listing.productName}-${index}`} className="vendor-listing-row">
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
      </section>
    </div>
  );
}
