import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

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
  Rejected: 'vendor-status suspended',
  Suspended: 'vendor-status suspended',
};

export default function AdminShopManagementPage({ onViewChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState('Shops');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const fetchShops = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/admin/shops');
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

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) => {
      const vName = row.vendor?.name || '';
      const vEmail = row.vendor?.email || '';
      return [row.shopName, vName, vEmail, row.phone, row.status, row.address]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [rows, searchTerm]);

  const updateShopStatus = async (shopId, shopName, nextStatus) => {
    try {
      await api.patch(`/api/shops/${shopId}/status`, { status: nextStatus });
      setNotice(`Shop "${shopName}" status updated to ${nextStatus}.`);
      setRows((current) =>
        current.map((row) => (row._id === shopId ? { ...row, status: nextStatus } : row))
      );
    } catch (error) {
      setNotice(error.message || 'Failed to update shop status.');
    }
  };

  const handleNavigate = (label) => {
    setActiveItem(label);
    if (label === 'Products') return onViewChange?.('admin-product');
    if (label === 'Approvals') return onViewChange?.('admin-approval');
    if (label === 'Vendors') return onViewChange?.('admin-vendor');
    if (label === 'Shops') return onViewChange?.('admin-shop');
    if (label === 'Listings') return onViewChange?.('admin-listings');
    if (label === 'Overview' || label === 'Reporting' || label === 'Settings') return onViewChange?.('admin-reporting');
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
      </aside>

      <section className="admin-vendor-content">
        <div className="admin-vendor-header-row">
          <div>
            <h1>Shop Management</h1>
            <p>Review shop profiles, live database statuses, and public visibility across MarketEye.</p>
          </div>

          <div className="admin-vendor-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search shops..."
            />
          </div>
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

        <div className="admin-vendor-card">
          <div className="admin-vendor-table-head">
            <span>Shop Name</span>
            <span>Vendor</span>
            <span>Contact</span>
            <span>Status</span>
            <span>Visibility</span>
            <span>Actions</span>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner spinner-teal"></div>
            </div>
          ) : filteredRows.length > 0 ? (
            filteredRows.map((row) => (
              <div key={row._id} className="admin-vendor-row">
                <div>
                  <div className="admin-vendor-main-text">{row.shopName}</div>
                  <div className="admin-vendor-secondary-text">{row.address || 'Storefront'}</div>
                </div>

                <div>
                  <div className="admin-vendor-main-text">{row.vendor?.name || 'Vendor'}</div>
                  <div className="admin-vendor-secondary-text">{row.vendor?.email}</div>
                </div>

                <div>
                  <div className="admin-vendor-main-text">{row.phone}</div>
                  <div className="admin-vendor-secondary-text">Shop Phone</div>
                </div>

                <div>
                  <span className={statusClassName[row.status] || 'vendor-status pending'}>
                    {row.status}
                  </span>
                </div>

                <div>
                  <span className={row.status === 'Approved' ? 'vendor-status active' : 'vendor-status suspended'}>
                    {row.status === 'Approved' ? 'Visible' : 'Hidden'}
                  </span>
                </div>

                <div className="admin-vendor-actions">
                  <button
                    type="button"
                    className="admin-vendor-action-btn activate"
                    onClick={() => updateShopStatus(row._id, row.shopName, 'Approved')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="admin-vendor-action-btn pending"
                    onClick={() => updateShopStatus(row._id, row.shopName, 'Pending')}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    className="admin-vendor-action-btn suspend"
                    onClick={() => updateShopStatus(row._id, row.shopName, 'Suspended')}
                  >
                    Suspend
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No shop profiles found in MongoDB.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
