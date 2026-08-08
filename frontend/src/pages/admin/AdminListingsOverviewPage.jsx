import React, { useEffect, useMemo, useState } from 'react';
import adminApi from './adminApi';

const navItems = [
  { label: 'Market Monitoring', icon: '📈' },
  { label: 'Products', icon: '▣' },
  { label: 'Approvals', icon: '✓' },
  { label: 'Shops', icon: '🏪' },
  { label: 'Listings', icon: '🧾', active: true },
  { label: 'Reporting', icon: '📊' },
];

const statusClassName = {
  'In Stock': 'listing-status in-stock',
  'Low Stock': 'listing-status low-stock',
  'Out of Stock': 'listing-status out-of-stock',
};

export default function AdminListingsOverviewPage({ onViewChange, onSignOut }) {
  const [activeItem, setActiveItem] = useState('Listings');
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');

  // Fetch all product listings across all shops from MongoDB
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getListings();
      setRows(data.listings || []);
    } catch (error) {
      setNotice(error.message || 'Failed to load listings overview.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) => {
      const pName = row.product?.name || '';
      const sName = row.shop?.shopName || '';
      return [pName, sName, String(row.price), row.stockStatus]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [rows, searchTerm]);

  const handleNavigate = (label) => {
    setActiveItem(label);
    if (label === 'Market Monitoring') return onViewChange?.('admin-market-monitoring');
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
      </aside>

      <section className="admin-reporting-content">
        <div className="admin-reporting-header-row">
          <div>
            <h1>Market Listings & Prices</h1>
            <p>Monitor all product prices, stock status, and shop listings.</p>
          </div>

          <div className="admin-reporting-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search listings..."
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
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            {notice}
          </div>
        )}

        <div className="admin-reporting-table-card">
          <div className="admin-listing-table-head">
            <span>Official Product</span>
            <span>Retailer / Shop</span>
            <span>Price</span>
            <span>Availability</span>
            <span>Shop Status</span>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner spinner-teal"></div>
            </div>
          ) : filteredRows.length > 0 ? (
            filteredRows.map((row) => (
              <div key={row._id} className="admin-listing-row">
                <div className="admin-reporting-name-cell">
                  {row.product?.name || 'Deleted Product'}
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {row.product?.category} • {row.product?.unit}
                  </div>
                </div>
                <div>{row.shop?.shopName || 'Unknown Shop'}</div>
                <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  ${row.price?.toFixed(2)}
                </div>
                <div>
                  <span className={statusClassName[row.stockStatus] || 'listing-status'}>
                    {row.stockStatus}
                  </span>
                </div>
                <div>
                  <span
                    className={
                      row.shop?.status === 'Approved'
                        ? 'vendor-status active'
                        : 'vendor-status suspended'
                    }
                  >
                    {row.shop?.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No product listings submitted yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
