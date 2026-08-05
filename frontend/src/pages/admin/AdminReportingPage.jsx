import React, { useEffect, useMemo, useState } from 'react';
import adminApi from './adminApi';

const navItems = [
  { label: 'Products', icon: '▣' },
  { label: 'Approvals', icon: '✓' },
  { label: 'Shops', icon: '🏪' },
  { label: 'Listings', icon: '🧾' },
  { label: 'Reporting', icon: '📊', active: true },
];

export default function AdminReportingPage({ onViewChange, onSignOut }) {
  const [activeItem, setActiveItem] = useState('Reporting');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalShops: 0,
    approvedShops: 0,
    pendingShops: 0,
    totalVendors: 0,
    activeVendors: 0,
    suspendedVendors: 0,
    totalListings: 0,
    activeListings: 0,
  });
  const [performanceRows, setPerformanceRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');

  // Fetch live reporting statistics from MongoDB
  const fetchReporting = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getReporting();
      setStats(data.stats || {});
      setPerformanceRows(data.shops || []);
    } catch (error) {
      setNotice(error.message || 'Failed to load system metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReporting();
  }, []);

  const overviewCards = useMemo(() => {
    return [
      { title: 'Total Products', value: String(stats.totalProducts ?? 0), tone: 'blue' },
      { title: 'Registered Shops', value: String(stats.totalShops ?? 0), tone: 'teal' },
      { title: 'Approved Shops', value: String(stats.approvedShops ?? 0), tone: 'green' },
      { title: 'Pending Approvals', value: String(stats.pendingShops ?? 0), tone: 'amber' },
      { title: 'Total Vendors', value: String(stats.totalVendors ?? 0), tone: 'blue' },
      { title: 'Active Vendors', value: String(stats.activeVendors ?? 0), tone: 'green' },
      { title: 'Suspended Vendors', value: String(stats.suspendedVendors ?? 0), tone: 'amber' },
      { title: 'Active Listings', value: String(stats.activeListings ?? 0), tone: 'teal' },
    ];
  }, [stats]);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return performanceRows;

    return performanceRows.filter((row) => {
      const vName = row.vendor?.name || '';
      return [row.shopName, vName, row.status, row.address]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [performanceRows, searchTerm]);

  const toggleVisibility = async (shopId, shopName, currentStatus) => {
    const nextStatus = currentStatus === 'Approved' ? 'Suspended' : 'Approved';
    try {
      await api.patch(`/api/shops/${shopId}/status`, { status: nextStatus });
      setNotice(`Updated status for "${shopName}" to ${nextStatus}.`);
      setPerformanceRows((current) =>
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

        <button type="button" className="admin-reporting-add-btn" onClick={fetchReporting}>
          ↻ Refresh Metrics
        </button>
      </aside>

      <section className="admin-reporting-content">
        <div className="admin-reporting-header-row">
          <div>
            <h1>Admin Reporting & System Metrics</h1>
            <p>Real-time analytics and system metrics.</p>
          </div>

          <div className="admin-reporting-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search shops or metrics..."
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

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner spinner-teal"></div>
          </div>
        ) : (
          <>
            <div className="admin-reporting-stats-grid">
              {overviewCards.map((card) => (
                <div key={card.title} className={`admin-reporting-stat-card ${card.tone}`}>
                  <div className="admin-reporting-stat-label">{card.title}</div>
                  <div className="admin-reporting-stat-value">{card.value}</div>
                </div>
              ))}
            </div>

            <div className="admin-reporting-table-card">
              <div className="admin-shop-table-head">
                <span>Shop Name</span>
                <span>Vendor</span>
                <span>Approval Status</span>
                <span>Public Visibility</span>
                <span>Actions</span>
              </div>

              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <div key={row._id} className="admin-shop-row">
                    <div className="admin-reporting-name-cell">{row.shopName}</div>
                    <div>{row.vendor?.name || 'Vendor'}</div>
                    <div>
                      <span
                        className={
                          row.status === 'Approved'
                            ? 'vendor-status active'
                            : row.status === 'Pending'
                            ? 'vendor-status pending'
                            : 'vendor-status suspended'
                        }
                      >
                        {row.status}
                      </span>
                    </div>
                    <div>{row.status === 'Approved' ? 'Visible on Site' : 'Hidden from Site'}</div>
                    <div>
                      <button
                        type="button"
                        className="admin-reporting-toggle-btn"
                        onClick={() => toggleVisibility(row._id, row.shopName, row.status)}
                      >
                        {row.status === 'Approved' ? 'Suspend Shop' : 'Approve Shop'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No registered shops found.
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
