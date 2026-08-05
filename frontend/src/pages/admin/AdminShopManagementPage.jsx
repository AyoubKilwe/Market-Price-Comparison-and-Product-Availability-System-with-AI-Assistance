import React, { useEffect, useMemo, useState } from 'react';
import adminApi from './adminApi';

const navItems = [
  { label: 'Products', icon: '▣' },
  { label: 'Approvals', icon: '✓' },
  { label: 'Shops', icon: '🏪', active: true },
  { label: 'Listings', icon: '🧾' },
  { label: 'Reporting', icon: '📊' },
];

const statusClassName = {
  Approved: 'vendor-status active',
  Pending: 'vendor-status pending',
  Rejected: 'vendor-status suspended',
  Suspended: 'vendor-status suspended',
};

export default function AdminShopManagementPage({ onViewChange, onSignOut }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState('Shops');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const fetchShops = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getShops();
      setRows(data.shops || []);
    } catch (error) {
      setNotice(error.message || 'Failed to fetch shops.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const filteredShops = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((shop) => {
      const vName = shop.vendor?.name || '';
      const vEmail = shop.vendor?.email || '';
      return [shop.shopName, vName, vEmail, shop.phone, shop.address, shop.status]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [rows, searchTerm]);

  const updateStatus = async (shopId, shopName, nextStatus) => {
    try {
      await adminApi.updateShopStatus(shopId, nextStatus);
      setNotice(`Shop "${shopName}" status updated to ${nextStatus}.`);
      setRows((prev) =>
        prev.map((s) => (s._id === shopId ? { ...s, status: nextStatus } : s))
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

        <button type="button" className="admin-vendor-add-btn" onClick={fetchShops}>
          ↻ Refresh Shops
        </button>
      </aside>

      <section className="admin-reporting-content">
        <div className="admin-reporting-header-row">
          <div>
            <h1>Shop Management</h1>
            <p>View and manage all registered merchant shops.</p>
          </div>

          <div className="admin-reporting-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search shops..."
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

        <div className="admin-reporting-table-card">
          <div className="admin-shop-table-head">
            <span>Shop Details</span>
            <span>Vendor Owner</span>
            <span>Phone</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner spinner-teal"></div>
            </div>
          ) : filteredShops.length > 0 ? (
            filteredShops.map((shop) => (
              <div key={shop._id} className="admin-shop-row">
                <div className="admin-reporting-name-cell">
                  <div style={{ fontWeight: '600' }}>{shop.shopName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {shop.address || 'Hargeisa, Somaliland'}
                  </div>
                </div>
                <div>
                  <div>{shop.vendor?.name || 'Vendor'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {shop.vendor?.email}
                  </div>
                </div>
                <div>{shop.phone}</div>
                <div>
                  <span className={statusClassName[shop.status] || 'vendor-status pending'}>
                    {shop.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {shop.status !== 'Approved' && (
                    <button
                      type="button"
                      className="admin-approval-action-btn approve"
                      onClick={() => updateStatus(shop._id, shop.shopName, 'Approved')}
                    >
                      Approve
                    </button>
                  )}
                  {shop.status !== 'Suspended' && (
                    <button
                      type="button"
                      className="admin-approval-action-btn suspend"
                      onClick={() => updateStatus(shop._id, shop.shopName, 'Suspended')}
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No shops registered yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
