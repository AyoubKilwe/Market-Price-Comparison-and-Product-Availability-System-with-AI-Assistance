import React, { useEffect, useMemo, useState } from 'react';
import adminApi from './adminApi';

const navItems = [
  { label: 'Products', icon: '▣' },
  { label: 'Approvals', icon: '✓', active: true },
  { label: 'Shops', icon: '🏪' },
  { label: 'Listings', icon: '🧾' },
  { label: 'Reporting', icon: '📊' },
];

const badgeClassMap = {
  Pending: 'status-badge pending',
  Approved: 'status-badge approved',
  Rejected: 'status-badge rejected',
  Suspended: 'status-badge suspended',
};

export default function AdminApprovalPage({ onViewChange, onSignOut }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState('Approvals');
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');

  // Fetch registered shops from MongoDB
  const fetchShops = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getShops();
      setRequests(data.shops || []);
    } catch (error) {
      setNotice(error.message || 'Failed to fetch shop registration requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const filteredRequests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return requests;

    return requests.filter((entry) => {
      const vName = entry.vendor?.name || '';
      const vEmail = entry.vendor?.email || '';
      return [entry.shopName, vName, vEmail, entry.phone, entry.status]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [requests, searchTerm]);

  const updateStatus = async (shopId, shopName, nextStatus) => {
    try {
      await adminApi.updateShopStatus(shopId, nextStatus);
      setNotice(`Status for "${shopName}" updated to ${nextStatus}.`);
      setRequests((current) =>
        current.map((entry) => (entry._id === shopId ? { ...entry, status: nextStatus } : entry))
      );
    } catch (error) {
      setNotice(error.message || 'Failed to update shop status.');
    }
  };

  const handleNavigate = (label) => {
    setActiveItem(label);
    if (label === 'Products') return onViewChange?.('admin-product');
    if (label === 'Approvals') return onViewChange?.('admin-approval');
    if (label === 'Shops') return onViewChange?.('admin-shop');
    if (label === 'Listings') return onViewChange?.('admin-listings');
    if (label === 'Reporting') return onViewChange?.('admin-reporting');
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
              className={`admin-approval-nav-item ${activeItem === item.label ? 'active' : ''}`}
              onClick={() => handleNavigate(item.label)}
            >
              <span className="admin-approval-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="admin-approval-add-btn" onClick={fetchShops}>
          ↻ Refresh List
        </button>
      </aside>

      <section className="admin-approval-content">
        <div className="admin-reporting-header-row">
          <div>
            <h1>Shop Approvals</h1>
            <p>Review vendor shop registration requests and manage live public visibility.</p>
          </div>

          <div className="admin-approval-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search shops or vendors..."
            />
          </div>
          <button type="button" className="admin-signout-btn" onClick={onSignOut}>
            Sign out
          </button>
        </div>

        {notice && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            {notice}
          </div>
        )}

        <div className="admin-approval-card">
          <div className="admin-approval-table-head">
            <span>Shop Name</span>
            <span>Vendor Info</span>
            <span>Contact</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner spinner-teal"></div>
            </div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((item) => (
              <div key={item._id} className="admin-approval-row">
                <div className="admin-approval-shop-cell">
                  <div className="admin-approval-shop-badge">🏪</div>
                  <div>
                    <div className="admin-approval-shop-name">{item.shopName}</div>
                    <div className="admin-approval-secondary-text">{item.address || 'Address registered'}</div>
                  </div>
                </div>

                <div>
                  <div className="admin-approval-main-text">{item.vendor?.name || 'Vendor'}</div>
                  <div className="admin-approval-secondary-text">{item.vendor?.email}</div>
                </div>

                <div>
                  <div className="admin-approval-main-text">{item.phone}</div>
                  <div className="admin-approval-secondary-text">Vendor phone</div>
                </div>

                <div>
                  <span className={badgeClassMap[item.status] || 'status-badge pending'}>
                    {item.status}
                  </span>
                </div>

                <div className="admin-approval-actions">
                  <button
                    type="button"
                    className="admin-approval-action-btn approve"
                    onClick={() => updateStatus(item._id, item.shopName, 'Approved')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="admin-approval-action-btn reject"
                    onClick={() => updateStatus(item._id, item.shopName, 'Rejected')}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="admin-approval-action-btn suspend"
                    onClick={() => updateStatus(item._id, item.shopName, 'Suspended')}
                  >
                    Suspend
                  </button>
                  <button
                    type="button"
                    className="admin-approval-action-btn restore"
                    onClick={() => updateStatus(item._id, item.shopName, 'Pending')}
                  >
                    Set Pending
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No shop registrations found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
