import React, { useMemo, useState } from 'react';

const listingRows = [
  {
    product: 'Premium Basmati Rice 5kg',
    shop: 'FreshMart Retail',
    price: '$16.14',
    stock: '42 units',
    status: 'Active',
  },
  {
    product: 'Organic Brown Eggs (Dozen)',
    shop: 'CityGrocer Hub',
    price: '$7.49',
    stock: '9 units',
    status: 'Active',
  },
  {
    product: 'Extra Virgin Olive Oil 1L',
    shop: 'SomMart Plus',
    price: '$18.92',
    stock: '0 units',
    status: 'Archived',
  },
  {
    product: 'Fresh Aloe Vera Drink 500ml',
    shop: 'Nile Essentials',
    price: '$4.35',
    stock: '31 units',
    status: 'Active',
  },
];

const navItems = [
  { label: 'Overview', icon: '▦' },
  { label: 'Products', icon: '▣' },
  { label: 'Approvals', icon: '✓' },
  { label: 'Vendors', icon: '◫' },
  { label: 'Shops', icon: '🏪' },
  { label: 'Listings', icon: '🧾', active: true },
  { label: 'Reporting', icon: '📊' },
  { label: 'Settings', icon: '⚙' },
];

const statusClassName = {
  Active: 'listing-status in-stock',
  Archived: 'listing-status out-of-stock',
};

export default function AdminListingsOverviewPage({ onViewChange }) {
  const [activeItem, setActiveItem] = useState('Listings');
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState(listingRows);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) =>
      [row.product, row.shop, row.price, row.stock, row.status].join(' ').toLowerCase().includes(query)
    );
  }, [rows, searchTerm]);

  const handleNavigate = (label) => {
    setActiveItem(label);

    if (label === 'Products') return onViewChange?.('admin-product');
    if (label === 'Approvals') return onViewChange?.('admin-approval');
    if (label === 'Vendors') return onViewChange?.('admin-vendor');
    if (label === 'Shops') return onViewChange?.('admin-shop');
    if (label === 'Listings') return onViewChange?.('admin-listings');
    if (label === 'Reporting') return onViewChange?.('admin-reporting');
    if (label === 'Overview' || label === 'Settings') return onViewChange?.('admin-reporting');
  };

  const toggleListingStatus = (product) => {
    setRows((current) =>
      current.map((row) =>
        row.product === product
          ? { ...row, status: row.status === 'Active' ? 'Archived' : 'Active' }
          : row
      )
    );
  };

  return (
    <div className="admin-reporting-shell">
      <aside className="admin-reporting-sidebar">
        <div className="admin-reporting-brand">MarketEye</div>

        <div className="admin-reporting-user-card">
          <div className="admin-reporting-avatar">A</div>
          <div>
            <div className="admin-reporting-user-name">System Admin</div>
            <div className="admin-reporting-user-role">Global Management</div>
          </div>
        </div>

        <nav className="admin-reporting-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`admin-reporting-nav-item ${activeItem === item.label ? 'active' : ''}`}
              onClick={() => handleNavigate(item.label)}
            >
              <span className="admin-reporting-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="admin-reporting-add-btn">
          + Refresh Overview
        </button>
      </aside>

      <section className="admin-reporting-content">
        <div className="admin-reporting-header-row">
          <div>
            <h1>Listings Overview</h1>
            <p>Monitor all catalog submissions, pricing, and shop stock visibility for the public marketplace.</p>
          </div>

          <div className="admin-reporting-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search listings"
            />
          </div>
        </div>

        <div className="admin-reporting-table-card">
          <div className="admin-reporting-table-head">
            <span>Product</span>
            <span>Shop</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filteredRows.map((row) => (
            <div key={`${row.product}-${row.shop}`} className="admin-reporting-row">
              <div className="admin-reporting-name-cell">{row.product}</div>
              <div>{row.shop}</div>
              <div>{row.price}</div>
              <div>{row.stock}</div>
              <div>
                <span className={statusClassName[row.status]}>{row.status}</span>
              </div>
              <div>
                <button type="button" className="admin-reporting-toggle-btn" onClick={() => toggleListingStatus(row.product)}>
                  {row.status === 'Active' ? 'Archive' : 'Restore'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
