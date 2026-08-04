import React, { useMemo, useState } from 'react';

const shopProfiles = [
  {
    shop: 'FreshMart Retail',
    vendor: 'Amina Hassan',
    email: 'amina@freshmart.com',
    phone: '252-63-123456',
    status: 'Approved',
    visibility: 'Visible',
  },
  {
    shop: 'CityGrocer Hub',
    vendor: 'Yusuf Ali',
    email: 'yusuf@citygrocer.com',
    phone: '252-63-987654',
    status: 'Pending',
    visibility: 'Hidden',
  },
  {
    shop: 'SomMart Plus',
    vendor: 'Leyla Noor',
    email: 'leyla@sommart.com',
    phone: '252-63-456789',
    status: 'Suspended',
    visibility: 'Hidden',
  },
  {
    shop: 'Nile Essentials',
    vendor: 'Mohamed Jama',
    email: 'mohamed@nile.co',
    phone: '252-63-654321',
    status: 'Approved',
    visibility: 'Visible',
  },
];

const navItems = [
  { label: 'Overview', icon: '▦' },
  { label: 'Products', icon: '▣' },
  { label: 'Approvals', icon: '✓' },
  { label: 'Vendors', icon: '◫' },
  { label: 'Shops', icon: '🏪', active: true },
  { label: 'Listings', icon: '🧾' },
  { label: 'Reporting', icon: '📊' },
  { label: 'Settings', icon: '⚙' },
];

const statusClassName = {
  Approved: 'vendor-status active',
  Pending: 'vendor-status pending',
  Suspended: 'vendor-status suspended',
};

export default function AdminShopManagementPage({ onViewChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState('Shops');
  const [rows, setRows] = useState(shopProfiles);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) =>
      [row.shop, row.vendor, row.email, row.phone, row.status, row.visibility]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [rows, searchTerm]);

  const updateShopStatus = (shop, nextStatus) => {
    setRows((current) =>
      current.map((row) => (row.shop === shop ? { ...row, status: nextStatus } : row))
    );
  };

  const toggleVisibility = (shop) => {
    setRows((current) =>
      current.map((row) =>
        row.shop === shop
          ? { ...row, visibility: row.visibility === 'Visible' ? 'Hidden' : 'Visible' }
          : row
      )
    );
  };

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

  return (
    <div className="admin-vendor-shell">
      <aside className="admin-vendor-sidebar">
        <div className="admin-vendor-brand">MarketEye</div>

        <div className="admin-vendor-user-card">
          <div className="admin-vendor-avatar">A</div>
          <div>
            <div className="admin-vendor-user-name">System Admin</div>
            <div className="admin-vendor-user-role">Global Management</div>
          </div>
        </div>

        <nav className="admin-vendor-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`admin-vendor-nav-item ${activeItem === item.label ? 'active' : ''}`}
              onClick={() => handleNavigate(item.label)}
            >
              <span className="admin-vendor-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="admin-vendor-add-btn">
          + New Shop Review
        </button>
      </aside>

      <section className="admin-vendor-content">
        <div className="admin-vendor-header-row">
          <div>
            <h1>Shop Management</h1>
            <p>Review shop profiles, status, and public visibility across the marketplace.</p>
          </div>

          <div className="admin-vendor-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search shops"
            />
          </div>
        </div>

        <div className="admin-vendor-card">
          <div className="admin-vendor-table-head">
            <span>Shop</span>
            <span>Vendor</span>
            <span>Contact</span>
            <span>Status</span>
            <span>Visibility</span>
            <span>Actions</span>
          </div>

          {filteredRows.map((row) => (
            <div key={row.shop} className="admin-vendor-row">
              <div>
                <div className="admin-vendor-main-text">{row.shop}</div>
                <div className="admin-vendor-secondary-text">Linked storefront</div>
              </div>

              <div>
                <div className="admin-vendor-main-text">{row.vendor}</div>
                <div className="admin-vendor-secondary-text">{row.email}</div>
              </div>

              <div>
                <div className="admin-vendor-main-text">{row.phone}</div>
                <div className="admin-vendor-secondary-text">Primary contact</div>
              </div>

              <div>
                <span className={statusClassName[row.status]}>{row.status}</span>
              </div>

              <div>
                <span className={row.visibility === 'Visible' ? 'vendor-status active' : 'vendor-status suspended'}>
                  {row.visibility}
                </span>
              </div>

              <div className="admin-vendor-actions">
                <button type="button" className="admin-vendor-action-btn activate" onClick={() => updateShopStatus(row.shop, 'Approved')}>
                  Approve
                </button>
                <button type="button" className="admin-vendor-action-btn pending" onClick={() => updateShopStatus(row.shop, 'Pending')}>
                  Pending
                </button>
                <button type="button" className="admin-vendor-action-btn suspend" onClick={() => updateShopStatus(row.shop, 'Suspended')}>
                  Suspend
                </button>
                <button type="button" className="admin-vendor-action-btn activate" onClick={() => toggleVisibility(row.shop)}>
                  {row.visibility === 'Visible' ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
