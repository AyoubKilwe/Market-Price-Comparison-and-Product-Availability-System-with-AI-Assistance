import React, { useMemo, useState } from 'react';

const shopRequests = [
  {
    shop: 'FreshMart Retail',
    vendor: 'Amina Hassan',
    email: 'amina@freshmart.com',
    phone: '252-63-123456',
    status: 'Pending',
  },
  {
    shop: 'CityGrocer Hub',
    vendor: 'Yusuf Ali',
    email: 'yusuf@citygrocer.com',
    phone: '252-63-987654',
    status: 'Approved',
  },
  {
    shop: 'SomMart Plus',
    vendor: 'Leyla Noor',
    email: 'leyla@sommart.com',
    phone: '252-63-456789',
    status: 'Rejected',
  },
  {
    shop: 'Nile Essentials',
    vendor: 'Mohamed Jama',
    email: 'mohamed@nile.co',
    phone: '252-63-654321',
    status: 'Suspended',
  },
];

const navItems = [
  { label: 'Overview', icon: '▦' },
  { label: 'Products', icon: '▣' },
  { label: 'Approvals', icon: '✓', active: true },
  { label: 'Vendors', icon: '◫' },
  { label: 'Settings', icon: '⚙' },
];

const badgeClassMap = {
  Pending: 'status-badge pending',
  Approved: 'status-badge approved',
  Rejected: 'status-badge rejected',
  Suspended: 'status-badge suspended',
};

export default function AdminApprovalPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState(shopRequests);

  const filteredRequests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return requests;

    return requests.filter((entry) => {
      return [entry.shop, entry.vendor, entry.email, entry.phone, entry.status]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [requests, searchTerm]);

  const updateStatus = (shop, nextStatus) => {
    setRequests((current) =>
      current.map((entry) => (entry.shop === shop ? { ...entry, status: nextStatus } : entry))
    );
  };

  return (
    <div className="admin-approval-shell">
      <aside className="admin-approval-sidebar">
        <div className="admin-approval-brand">MarketEye</div>

        <div className="admin-approval-user-card">
          <div className="admin-approval-avatar">A</div>
          <div>
            <div className="admin-approval-user-name">System Admin</div>
            <div className="admin-approval-user-role">Global Management</div>
          </div>
        </div>

        <nav className="admin-approval-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`admin-approval-nav-item ${item.active ? 'active' : ''}`}
            >
              <span className="admin-approval-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="admin-approval-add-btn">
          + New Catalog Item
        </button>
      </aside>

      <section className="admin-approval-content">
        <div className="admin-approval-header-row">
          <div>
            <h1>Shop Approval Dashboard</h1>
            <p>Review vendor registration requests and manage public visibility across registered shops.</p>
          </div>

          <div className="admin-approval-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search shops or vendors"
            />
          </div>
        </div>

        <div className="admin-approval-card">
          <div className="admin-approval-table-head">
            <span>Shop</span>
            <span>Vendor</span>
            <span>Contact</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filteredRequests.map((item) => (
            <div key={item.shop} className="admin-approval-row">
              <div className="admin-approval-shop-cell">
                <div className="admin-approval-shop-badge">🏪</div>
                <div>
                  <div className="admin-approval-shop-name">{item.shop}</div>
                  <div className="admin-approval-secondary-text">Market registration request</div>
                </div>
              </div>

              <div>
                <div className="admin-approval-main-text">{item.vendor}</div>
                <div className="admin-approval-secondary-text">{item.email}</div>
              </div>

              <div>
                <div className="admin-approval-main-text">{item.phone}</div>
                <div className="admin-approval-secondary-text">Call support</div>
              </div>

              <div>
                <span className={badgeClassMap[item.status]}>{item.status}</span>
              </div>

              <div className="admin-approval-actions">
                <button type="button" className="admin-approval-action-btn approve" onClick={() => updateStatus(item.shop, 'Approved')}>
                  Approve
                </button>
                <button type="button" className="admin-approval-action-btn reject" onClick={() => updateStatus(item.shop, 'Rejected')}>
                  Reject
                </button>
                <button type="button" className="admin-approval-action-btn suspend" onClick={() => updateStatus(item.shop, 'Suspended')}>
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
