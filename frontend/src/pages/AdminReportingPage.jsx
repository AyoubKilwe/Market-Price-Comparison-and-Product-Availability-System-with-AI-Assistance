import React, { useMemo, useState } from 'react';

const navItems = [
  { label: 'Overview', icon: '▦', active: true },
  { label: 'Products', icon: '▣' },
  { label: 'Approvals', icon: '✓' },
  { label: 'Vendors', icon: '◫' },
  { label: 'Reporting', icon: '📊' },
  { label: 'Settings', icon: '⚙' },
];

const overviewCards = [
  { title: 'Registered Shops', value: '128', tone: 'blue' },
  { title: 'Approved Shops', value: '94', tone: 'green' },
  { title: 'Active Listings', value: '1,260', tone: 'amber' },
  { title: 'Publicly Visible', value: '842', tone: 'teal' },
];

const initialPerformanceRows = [
  { name: 'FreshMart Retail', visibility: 'Visible', listings: 24, change: '+8%' },
  { name: 'CityGrocer Hub', visibility: 'Visible', listings: 18, change: '+3%' },
  { name: 'SomMart Plus', visibility: 'Hidden', listings: 9, change: '-2%' },
  { name: 'Nile Essentials', visibility: 'Visible', listings: 31, change: '+12%' },
];

export default function AdminReportingPage({ onViewChange }) {
  const [activeItem, setActiveItem] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [performanceRows, setPerformanceRows] = useState(initialPerformanceRows);

  const visibleCount = useMemo(() => {
    return performanceRows.filter((row) => row.visibility === 'Visible').length;
  }, [performanceRows]);

  const totalListings = useMemo(() => {
    return performanceRows.reduce((sum, row) => sum + row.listings, 0);
  }, [performanceRows]);

  const overviewCards = useMemo(() => {
    return [
      { title: 'Registered Shops', value: String(performanceRows.length), tone: 'blue' },
      { title: 'Approved Shops', value: String(visibleCount), tone: 'green' },
      { title: 'Active Listings', value: String(totalListings), tone: 'amber' },
      { title: 'Publicly Visible', value: String(visibleCount), tone: 'teal' },
    ];
  }, [performanceRows.length, totalListings, visibleCount]);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return performanceRows;

    return performanceRows.filter((row) =>
      [row.name, row.visibility, row.listings, row.change].join(' ').toLowerCase().includes(query)
    );
  }, [performanceRows, searchTerm]);

  const handleNavigate = (label) => {
    setActiveItem(label);

    if (label === 'Products') return onViewChange?.('admin-product');
    if (label === 'Approvals') return onViewChange?.('admin-approval');
    if (label === 'Vendors') return onViewChange?.('admin-vendor');
    if (label === 'Overview' || label === 'Reporting' || label === 'Settings') return onViewChange?.('admin-reporting');
  };

  const toggleVisibility = (shopName) => {
    setPerformanceRows((current) =>
      current.map((row) =>
        row.name === shopName
          ? { ...row, visibility: row.visibility === 'Visible' ? 'Hidden' : 'Visible' }
          : row
      )
    );
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

        <button type="button" className="admin-reporting-add-btn">
          + Generate Report
        </button>
      </aside>

      <section className="admin-reporting-content">
        <div className="admin-reporting-header-row">
          <div>
            <h1>Admin Reporting & System Control</h1>
            <p>Review marketplace health, approved storefront visibility, and high-level shop activity in one place.</p>
          </div>

          <div className="admin-reporting-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search shops or metrics"
            />
          </div>
        </div>

        <div className="admin-reporting-summary-grid">
          {overviewCards.map((card) => (
            <div key={card.title} className={`admin-reporting-card ${card.tone}`}>
              <div className="admin-reporting-card-title">{card.title}</div>
              <div className="admin-reporting-card-value">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="admin-reporting-table-card">
          <div className="admin-reporting-table-head">
            <span>Shop</span>
            <span>Visibility</span>
            <span>Listings</span>
            <span>Change</span>
          </div>

          {filteredRows.map((row) => (
            <div key={row.name} className="admin-reporting-row">
              <div className="admin-reporting-name-cell">{row.name}</div>
              <div>{row.visibility}</div>
              <div>{row.listings}</div>
              <div className="admin-reporting-change">{row.change}</div>
              <div>
                <button type="button" className="admin-reporting-toggle-btn" onClick={() => toggleVisibility(row.name)}>
                  {row.visibility === 'Visible' ? 'Hide on Site' : 'Show on Site'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
