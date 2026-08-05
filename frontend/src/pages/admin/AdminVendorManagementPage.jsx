import React, { useEffect, useMemo, useState } from 'react';
import adminApi from './adminApi';

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

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getVendors();
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

  const filteredVendors = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((v) =>
      [v.name, v.email, v.phone, v.status].join(' ').toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  const toggleVendorStatus = async (vendorId, name, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await adminApi.updateVendorStatus(vendorId, nextStatus);
      setNotice(`Vendor "${name}" status updated to ${nextStatus}.`);
      setRows((prev) =>
        prev.map((v) => (v._id === vendorId ? { ...v, status: nextStatus } : v))
      );
    } catch (error) {
      setNotice(error.message || 'Failed to update vendor status.');
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

        <button type="button" className="admin-vendor-add-btn" onClick={fetchVendors}>
          ↻ Refresh Vendors
        </button>
      </aside>

      <section className="admin-reporting-content">
        <div className="admin-reporting-header-row">
          <div>
            <h1>Vendor Management</h1>
            <p>Manage user accounts registered as vendors in MongoDB.</p>
          </div>

          <div className="admin-reporting-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

        <div className="admin-reporting-table-card">
          <div className="admin-vendor-table-head">
            <span>Vendor Name</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner spinner-teal"></div>
            </div>
          ) : filteredVendors.length > 0 ? (
            filteredVendors.map((vendor) => (
              <div key={vendor._id} className="admin-vendor-row">
                <div className="admin-reporting-name-cell" style={{ fontWeight: '600' }}>
                  {vendor.name}
                </div>
                <div>{vendor.email}</div>
                <div>{vendor.phone || 'N/A'}</div>
                <div>
                  <span className={statusClassName[vendor.status] || 'vendor-status active'}>
                    {vendor.status || 'Active'}
                  </span>
                </div>
                <div>
                  <button
                    type="button"
                    className="admin-reporting-toggle-btn"
                    onClick={() => toggleVendorStatus(vendor._id, vendor.name, vendor.status || 'Active')}
                  >
                    {vendor.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No vendor accounts found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
