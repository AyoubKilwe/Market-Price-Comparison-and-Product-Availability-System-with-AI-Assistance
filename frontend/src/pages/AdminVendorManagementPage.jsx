import React, { useMemo, useState } from 'react';

const vendorRows = [
  {
    vendor: 'Amina Hassan',
    email: 'amina@freshmart.com',
    phone: '252-63-123456',
    shop: 'FreshMart Retail',
    status: 'Active',
  },
  {
    vendor: 'Yusuf Ali',
    email: 'yusuf@citygrocer.com',
    phone: '252-63-987654',
    shop: 'CityGrocer Hub',
    status: 'Pending',
  },
  {
    vendor: 'Leyla Noor',
    email: 'leyla@sommart.com',
    phone: '252-63-456789',
    shop: 'SomMart Plus',
    status: 'Suspended',
  },
];

const navItems = [
  { label: 'Overview', icon: '▦' },
  { label: 'Products', icon: '▣' },
  { label: 'Approvals', icon: '✓' },
  { label: 'Vendors', icon: '◫', active: true },
  { label: 'Settings', icon: '⚙' },
];

const statusClassName = {
  Active: 'vendor-status active',
  Pending: 'vendor-status pending',
  Suspended: 'vendor-status suspended',
};

export default function AdminVendorManagementPage({ onViewChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState('Vendors');
  const [rows, setRows] = useState(vendorRows);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) =>
      [row.vendor, row.email, row.phone, row.shop, row.status].join(' ').toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  const toggleStatus = (vendor, nextStatus) => {
    setRows((current) =>
      current.map((row) => (row.vendor === vendor ? { ...row, status: nextStatus } : row))
    );
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
              onClick={() => {
                setActiveItem(item.label);
                if (item.label === 'Products') onViewChange?.('admin-product');
                if (item.label === 'Approvals') onViewChange?.('admin-approval');
                if (item.label === 'Vendors') onViewChange?.('admin-vendor');
                if (item.label === 'Overview' || item.label === 'Settings') onViewChange?.('admin-reporting');
              }}
            >
              <span className="admin-vendor-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="admin-vendor-add-btn">
          + New Vendor
        </button>
      </aside>

      <section className="admin-vendor-content">
        <div className="admin-vendor-header-row">
          <div>
            <h1>Vendor Management</h1>
            <p>Track vendor accounts, monitor linked shops, and manage account statuses across the marketplace.</p>
          </div>

          <div className="admin-vendor-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search vendors"
            />
          </div>
        </div>

        <div className="admin-vendor-card">
          <div className="admin-vendor-table-head">
            <span>Vendor</span>
            <span>Shop</span>
            <span>Contact</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filteredRows.map((row) => (
            <div key={row.vendor} className="admin-vendor-row">
              <div>
                <div className="admin-vendor-main-text">{row.vendor}</div>
                <div className="admin-vendor-secondary-text">{row.email}</div>
              </div>

              <div>
                <div className="admin-vendor-main-text">{row.shop}</div>
                <div className="admin-vendor-secondary-text">Linked storefront</div>
              </div>

              <div>
                <div className="admin-vendor-main-text">{row.phone}</div>
                <div className="admin-vendor-secondary-text">Primary contact</div>
              </div>

              <div>
                <span className={statusClassName[row.status]}>{row.status}</span>
              </div>

              <div className="admin-vendor-actions">
                <button type="button" className="admin-vendor-action-btn activate" onClick={() => toggleStatus(row.vendor, 'Active')}>
                  Activate
                </button>
                <button type="button" className="admin-vendor-action-btn pending" onClick={() => toggleStatus(row.vendor, 'Pending')}>
                  Pending
                </button>
                <button type="button" className="admin-vendor-action-btn suspend" onClick={() => toggleStatus(row.vendor, 'Suspended')}>
                  Suspend
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
