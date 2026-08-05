import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const navItems = [
  { label: 'Overview', icon: '▦' },
  { label: 'Products', icon: '▣' },
  { label: 'Approvals', icon: '✓' },
  { label: 'Vendors', icon: '◫', active: true },
  { label: 'Shops', icon: '🏪' },
  { label: 'Listings', icon: '🧾' },
  { label: 'Reporting', icon: '📊' },
  { label: 'Settings', icon: '⚙' },
];

const statusClassName = {
  Active: 'vendor-status active',
  Suspended: 'vendor-status suspended',
};

export default function AdminVendorManagementPage({ onViewChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState('Vendors');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');

  // Fetch vendors from MongoDB
  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/admin/vendors');
      setRows(data.vendors || []);
    } catch (error) {
      setNotice(error.message || 'Failed to fetch vendor accounts from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) => {
      const shopName = row.shop?.shopName || '';
      return [row.name, row.email, row.phone, shopName, row.status]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [rows, searchTerm]);

  const toggleVendorStatus = async (vendorId, vendorName, nextStatus) => {
    try {
      await api.patch(`/api/admin/vendors/${vendorId}/status`, { status: nextStatus });
      setNotice(`Vendor account "${vendorName}" status changed to ${nextStatus}.`);
      setRows((current) =>
        current.map((row) => (row._id === vendorId ? { ...row, status: nextStatus } : row))
      );
    } catch (error) {
      setNotice(error.message || 'Failed to update vendor account status.');
    }
  };

  const handleNavigate = (label) => {
    setActiveItem(label);
    if (label === 'Products') onViewChange?.('admin-product');
    if (label === 'Approvals') onViewChange?.('admin-approval');
    if (label === 'Vendors') onViewChange?.('admin-vendor');
    if (label === 'Shops') onViewChange?.('admin-shop');
    if (label === 'Listings') onViewChange?.('admin-listings');
    if (label === 'Overview' || label === 'Reporting' || label === 'Settings') onViewChange?.('admin-reporting');
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

        <button type="button" className="admin-vendor-add-btn" onClick={fetchVendors}>
          ↻ Refresh Vendors
        </button>
      </aside>

      <section className="admin-vendor-content">
        <div className="admin-vendor-header-row">
          <div>
            <h1>Vendor Account Management</h1>
            <p>Track vendor accounts in MongoDB, monitor linked storefronts, and manage status.</p>
          </div>

          <div className="admin-vendor-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search vendors..."
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
            <span>Vendor Name & Email</span>
            <span>Linked Shop</span>
            <span>Phone</span>
            <span>Account Status</span>
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
                  <div className="admin-vendor-main-text">{row.name}</div>
                  <div className="admin-vendor-secondary-text">{row.email}</div>
                </div>

                <div>
                  <div className="admin-vendor-main-text">
                    {row.shop?.shopName || 'No shop created yet'}
                  </div>
                  <div className="admin-vendor-secondary-text">
                    {row.shop ? `Shop Status: ${row.shop.status}` : 'Pending Profile'}
                  </div>
                </div>

                <div>
                  <div className="admin-vendor-main-text">{row.phone}</div>
                  <div className="admin-vendor-secondary-text">Vendor contact</div>
                </div>

                <div>
                  <span className={statusClassName[row.status] || 'vendor-status active'}>
                    {row.status}
                  </span>
                </div>

                <div className="admin-vendor-actions">
                  <button
                    type="button"
                    className="admin-vendor-action-btn activate"
                    onClick={() => toggleVendorStatus(row._id, row.name, 'Active')}
                    disabled={row.status === 'Active'}
                  >
                    Activate
                  </button>
                  <button
                    type="button"
                    className="admin-vendor-action-btn suspend"
                    onClick={() => toggleVendorStatus(row._id, row.name, 'Suspended')}
                    disabled={row.status === 'Suspended'}
                  >
                    Suspend
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No vendor accounts registered in MongoDB yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
