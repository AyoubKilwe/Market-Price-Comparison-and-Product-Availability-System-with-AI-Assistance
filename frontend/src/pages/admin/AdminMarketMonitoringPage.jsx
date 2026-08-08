import React, { useEffect, useMemo, useState } from 'react';
import adminApi from './adminApi';

const navItems = [
  { label: 'Market Monitoring', icon: '📈', active: true },
  { label: 'Products', icon: '▣' },
  { label: 'Approvals', icon: '✓' },
  { label: 'Shops', icon: '🏪' },
  { label: 'Listings', icon: '🧾' },
  { label: 'Reporting', icon: '📊' },
];

export default function AdminMarketMonitoringPage({ onViewChange, onSignOut }) {
  const [activeItem, setActiveItem] = useState('Market Monitoring');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    city: 'all',
    market: 'all',
    category: 'all',
    product: 'all',
  });
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getMarketMonitoring(filters);
      setData(res);
    } catch (err) {
      setNotice(err.message || 'Failed to load market monitoring data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const handleFilterChange = (key) => (e) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: 'all',
      city: 'all',
      market: 'all',
      category: 'all',
      product: 'all',
    });
  };

  const handleNavigate = (label) => {
    setActiveItem(label);
    if (label === 'Market Monitoring') return onViewChange?.('admin-market-monitoring');
    if (label === 'Products') return onViewChange?.('admin-product');
    if (label === 'Approvals') return onViewChange?.('admin-approval');
    if (label === 'Shops') return onViewChange?.('admin-shop');
    if (label === 'Listings') return onViewChange?.('admin-listings');
    if (label === 'Reporting') return onViewChange?.('admin-reporting');
  };

  const widgets = data?.widgets || {
    totalProductsMonitored: 0,
    activeMarkets: 0,
    citiesCovered: 0,
    avgPriceChangePct: 0,
    productsInShortage: 0,
    marketAlerts: 0,
    lastDataSync: new Date().toISOString(),
  };

  const filtersOptions = data?.filtersOptions || {
    cities: [],
    markets: [],
    categories: [],
    products: [],
  };

  const priceTrendTimeline = data?.priceTrendTimeline || [];
  const cityComparison = data?.cityComparison || [];
  const categoryDistribution = data?.categoryDistribution || [];
  const productShortages = data?.productShortages || [];
  const alerts = data?.alerts || [];
  const recentActivity = data?.recentActivity || [];

  // Price Trend Chart Calculation (SVG rendering)
  const chartPoints = useMemo(() => {
    if (!priceTrendTimeline.length) return [];
    const prices = priceTrendTimeline.map((d) => d.avgPrice);
    const minP = Math.min(...prices) * 0.9;
    const maxP = Math.max(...prices) * 1.1 || minP + 10;
    const width = 600;
    const height = 220;

    return priceTrendTimeline.map((item, idx) => {
      const x = priceTrendTimeline.length === 1 ? width / 2 : (idx / (priceTrendTimeline.length - 1)) * (width - 40) + 20;
      const y = height - 30 - ((item.avgPrice - minP) / (maxP - minP || 1)) * (height - 60);
      return { ...item, x, y };
    });
  }, [priceTrendTimeline]);

  const svgPathD = useMemo(() => {
    if (chartPoints.length < 2) return '';
    return chartPoints.reduce((acc, point, idx) => {
      return idx === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
    }, '');
  }, [chartPoints]);

  const svgAreaD = useMemo(() => {
    if (chartPoints.length < 2) return '';
    const firstX = chartPoints[0].x;
    const lastX = chartPoints[chartPoints.length - 1].x;
    return `${svgPathD} L ${lastX} 190 L ${firstX} 190 Z`;
  }, [chartPoints, svgPathD]);

  const formatSyncTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="admin-market-shell">
      {/* Sidebar */}
      <aside className="admin-market-sidebar">
        <div className="admin-market-brand">MarketEye</div>

        <div className="admin-market-user-card">
          <div className="admin-market-avatar">A</div>
          <div>
            <div className="admin-market-user-name">System Admin</div>
            <div className="admin-market-user-role">Global Management</div>
          </div>
        </div>

        <nav className="admin-market-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`admin-market-nav-item ${activeItem === item.label ? 'active' : ''}`}
              onClick={() => handleNavigate(item.label)}
            >
              <span className="admin-market-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <section className="admin-market-content">
        {/* Header */}
        <div className="admin-market-header-row">
          <div>
            <span className="admin-market-eyebrow">Real-Time Market Analytics</span>
            <h1>Market Monitoring Dashboard</h1>
            <p>Monitor prices, supply shortages, city comparisons, and unusual market fluctuations.</p>
          </div>
          <div className="admin-market-header-actions">
            <button type="button" className="admin-signout-btn" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </div>

        {notice && (
          <div className="admin-market-notice-banner">
            <span>⚠️</span>
            <span>{notice}</span>
          </div>
        )}

        {/* Filters Bar */}
        <div className="admin-market-filter-card">
          <div className="admin-market-filter-heading">
            <span className="filter-icon">🔍</span>
            <h3>Market Data Filters</h3>
          </div>
          <div className="admin-market-filter-grid">
            <label className="admin-market-filter-field">
              <span>Date Range</span>
              <select value={filters.dateRange} onChange={handleFilterChange('dateRange')}>
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </label>

            <label className="admin-market-filter-field">
              <span>City</span>
              <select value={filters.city} onChange={handleFilterChange('city')}>
                <option value="all">All Cities</option>
                {filtersOptions.cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="admin-market-filter-field">
              <span>Market / Shop</span>
              <select value={filters.market} onChange={handleFilterChange('market')}>
                <option value="all">All Markets</option>
                {filtersOptions.markets.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.city})</option>
                ))}
              </select>
            </label>

            <label className="admin-market-filter-field">
              <span>Product Category</span>
              <select value={filters.category} onChange={handleFilterChange('category')}>
                <option value="all">All Categories</option>
                {filtersOptions.categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>

            <label className="admin-market-filter-field">
              <span>Product Name</span>
              <select value={filters.product} onChange={handleFilterChange('product')}>
                <option value="all">All Products</option>
                {filtersOptions.products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-market-filter-footer">
            <span className="admin-market-filter-summary">
              Showing filtered metrics for <strong>{data?.totalListings ?? 0}</strong> active market listings.
            </span>
            <button type="button" className="admin-market-reset-btn" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        </div>

        {/* 7 Attractive Key Metric Widgets */}
        <div className="admin-market-widgets-grid">
          {/* Widget 1 */}
          <div className="admin-market-widget-card gradient-teal">
            <div className="widget-icon-box">📦</div>
            <div className="widget-content">
              <div className="widget-label">Total Products Monitored</div>
              <div className="widget-value">{widgets.totalProductsMonitored}</div>
              <div className="widget-subtext">Active official catalog items</div>
            </div>
          </div>

          {/* Widget 2 */}
          <div className="admin-market-widget-card gradient-blue">
            <div className="widget-icon-box">🏪</div>
            <div className="widget-content">
              <div className="widget-label">Active Markets</div>
              <div className="widget-value">{widgets.activeMarkets}</div>
              <div className="widget-subtext">Verified vendor shops</div>
            </div>
          </div>

          {/* Widget 3 */}
          <div className="admin-market-widget-card gradient-purple">
            <div className="widget-icon-box">📍</div>
            <div className="widget-content">
              <div className="widget-label">Cities Covered</div>
              <div className="widget-value">{widgets.citiesCovered}</div>
              <div className="widget-subtext">Municipalities tracked</div>
            </div>
          </div>

          {/* Widget 4 */}
          <div className="admin-market-widget-card gradient-emerald">
            <div className="widget-icon-box">📈</div>
            <div className="widget-content">
              <div className="widget-label">Average Price Change</div>
              <div className="widget-value">
                {widgets.avgPriceChangePct > 0 ? `+${widgets.avgPriceChangePct}%` : `${widgets.avgPriceChangePct}%`}
              </div>
              <div className="widget-subtext">Cross-market price variance</div>
            </div>
          </div>

          {/* Widget 5 */}
          <div className="admin-market-widget-card gradient-amber">
            <div className="widget-icon-box">⚠️</div>
            <div className="widget-content">
              <div className="widget-label">Products in Shortage</div>
              <div className="widget-value">{widgets.productsInShortage}</div>
              <div className="widget-subtext">Low or out-of-stock items</div>
            </div>
          </div>

          {/* Widget 6 */}
          <div className="admin-market-widget-card gradient-rose">
            <div className="widget-icon-box">🔔</div>
            <div className="widget-content">
              <div className="widget-label">Market Alerts</div>
              <div className="widget-value">{widgets.marketAlerts}</div>
              <div className="widget-subtext">Spikes, drops & warnings</div>
            </div>
          </div>

          {/* Widget 7 */}
          <div className="admin-market-widget-card gradient-indigo">
            <div className="widget-icon-box">🕒</div>
            <div className="widget-content">
              <div className="widget-label">Last Data Synchronization</div>
              <div className="widget-value-sm">{formatSyncTime(widgets.lastDataSync)}</div>
              <div className="widget-subtext">Verified MarketEye DB</div>
            </div>
          </div>
        </div>

        {/* Charts & Analytical Section */}
        <div className="admin-market-charts-grid">
          {/* Chart 1: Price Trends Line Chart */}
          <div className="admin-market-chart-card">
            <div className="chart-card-header">
              <div>
                <h2>Product Price Trends Over Time</h2>
                <p>Average price trajectory based on verified vendor listing updates.</p>
              </div>
              <span className="chart-badge">Live Trend</span>
            </div>

            {isLoading ? (
              <div className="chart-loading-box">
                <div className="spinner spinner-teal"></div>
              </div>
            ) : priceTrendTimeline.length > 0 ? (
              <div className="svg-chart-wrapper">
                <svg viewBox="0 0 600 220" className="interactive-svg-chart">
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="20" y1="30" x2="580" y2="30" stroke="#e2e8f0" strokeDasharray="4 4" />
                  <line x1="20" y1="80" x2="580" y2="80" stroke="#e2e8f0" strokeDasharray="4 4" />
                  <line x1="20" y1="130" x2="580" y2="130" stroke="#e2e8f0" strokeDasharray="4 4" />
                  <line x1="20" y1="180" x2="580" y2="180" stroke="#cbd5e1" />

                  {/* Area Fill */}
                  {svgAreaD && <path d={svgAreaD} fill="url(#priceGradient)" />}

                  {/* Trend Line */}
                  {svgPathD && <path d={svgPathD} fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />}

                  {/* Data Points */}
                  {chartPoints.map((pt, i) => (
                    <g
                      key={i}
                      onMouseEnter={() => setHoveredTrendPoint(pt)}
                      onMouseLeave={() => setHoveredTrendPoint(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#0d9488" strokeWidth="3" />
                      {hoveredTrendPoint?.date === pt.date && (
                        <circle cx={pt.x} cy={pt.y} r="8" fill="#0d9488" opacity="0.3" />
                      )}
                    </g>
                  ))}
                </svg>

                {/* Hover Tooltip */}
                {hoveredTrendPoint && (
                  <div className="chart-tooltip-box" style={{ left: `${(hoveredTrendPoint.x / 600) * 100}%` }}>
                    <div className="tooltip-date">{hoveredTrendPoint.date}</div>
                    <div className="tooltip-price">${hoveredTrendPoint.avgPrice} avg</div>
                    <div className="tooltip-count">{hoveredTrendPoint.listingCount} listings</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="chart-empty-state">
                <span>📉</span>
                <p>No price trend history found for the selected filter criteria.</p>
              </div>
            )}
          </div>

          {/* Chart 2: Product Category Distribution */}
          <div className="admin-market-chart-card">
            <div className="chart-card-header">
              <div>
                <h2>Category Distribution</h2>
                <p>Product coverage and listing volume by category.</p>
              </div>
              <span className="chart-badge purple">Categories</span>
            </div>

            {isLoading ? (
              <div className="chart-loading-box">
                <div className="spinner spinner-teal"></div>
              </div>
            ) : categoryDistribution.length > 0 ? (
              <div className="category-distribution-list">
                {categoryDistribution.map((cat) => (
                  <div key={cat.category} className="category-item-row">
                    <div className="category-item-header">
                      <span className="cat-name">{cat.category}</span>
                      <span className="cat-stats">
                        {cat.productCount} products • {cat.listingsCount} listings (${cat.avgPrice} avg)
                      </span>
                    </div>
                    <div className="category-progress-track">
                      <div
                        className="category-progress-bar"
                        style={{
                          width: `${Math.min(100, (cat.listingsCount / (data?.totalListings || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="chart-empty-state">
                <span>📊</span>
                <p>No category data available.</p>
              </div>
            )}
          </div>
        </div>

        {/* City Price Comparison Section */}
        <div className="admin-market-section-card">
          <div className="section-header">
            <div>
              <h2>City Price Comparison</h2>
              <p>Compare product prices across different cities (Average, Min, Max prices).</p>
            </div>
            <span className="section-badge teal">Regional Analysis</span>
          </div>

          {isLoading ? (
            <div className="chart-loading-box">
              <div className="spinner spinner-teal"></div>
            </div>
          ) : cityComparison.length > 0 ? (
            <div className="city-comparison-grid">
              {/* Visual Bars */}
              <div className="city-bars-container">
                {cityComparison.map((item) => (
                  <div key={item.city} className="city-bar-group">
                    <div className="city-bar-label">{item.city}</div>
                    <div className="city-bar-track">
                      <div
                        className="city-bar-fill min"
                        style={{ width: `${Math.min(100, (item.minPrice / (item.maxPrice || 1)) * 100)}%` }}
                        title={`Min Price: $${item.minPrice}`}
                      />
                      <div
                        className="city-bar-fill avg"
                        style={{ width: `${Math.min(100, (item.avgPrice / (item.maxPrice || 1)) * 100)}%` }}
                        title={`Avg Price: $${item.avgPrice}`}
                      />
                    </div>
                    <div className="city-bar-values">
                      <span>Avg: <strong>${item.avgPrice}</strong></span>
                      <span>Range: ${item.minPrice} - ${item.maxPrice}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Table */}
              <div className="admin-market-table-card">
                <div className="admin-market-table-head grid-city">
                  <span>City</span>
                  <span>Active Markets</span>
                  <span>Average Price</span>
                  <span>Price Range (Min - Max)</span>
                  <span>Monitored Listings</span>
                </div>
                {cityComparison.map((row) => (
                  <div key={row.city} className="admin-market-row grid-city">
                    <div className="cell-city-name">📍 {row.city}</div>
                    <div>{row.activeMarkets} markets</div>
                    <div className="cell-price-highlight">${row.avgPrice}</div>
                    <div>${row.minPrice} — ${row.maxPrice}</div>
                    <div>{row.listingsCount} listings</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="chart-empty-state">
              <span>🏙️</span>
              <p>No city comparison data available for the current filter criteria.</p>
            </div>
          )}
        </div>

        {/* Product Shortages Section */}
        <div className="admin-market-section-card">
          <div className="section-header">
            <div>
              <h2>Product Shortages & Stock Warnings</h2>
              <p>Products experiencing low availability or completely out of stock across markets.</p>
            </div>
            <span className="section-badge warning">Supply Risk</span>
          </div>

          {isLoading ? (
            <div className="chart-loading-box">
              <div className="spinner spinner-teal"></div>
            </div>
          ) : productShortages.length > 0 ? (
            <div className="admin-market-table-card">
              <div className="admin-market-table-head grid-shortage">
                <span>Product</span>
                <span>Category</span>
                <span>Affected Market</span>
                <span>City</span>
                <span>Shortage Status</span>
                <span>Price</span>
                <span>Last Updated</span>
              </div>

              {productShortages.map((item) => (
                <div key={item.id} className="admin-market-row grid-shortage">
                  <div className="cell-product-name">{item.productName}</div>
                  <div>{item.category}</div>
                  <div>🏪 {item.shopName}</div>
                  <div>📍 {item.city}</div>
                  <div>
                    <span
                      className={`shortage-badge ${
                        item.shortageLevel === 'Critical' ? 'critical' : 'moderate'
                      }`}
                    >
                      {item.stockStatus}
                    </span>
                  </div>
                  <div className="cell-price">${item.price} / {item.unit}</div>
                  <div className="cell-timestamp">{formatSyncTime(item.lastUpdated)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="chart-empty-state green">
              <span>✅</span>
              <p>All products are currently well-stocked with no active shortage warnings.</p>
            </div>
          )}
        </div>

        {/* Unusual Market Changes & Market Alerts Section */}
        <div className="admin-market-section-card">
          <div className="section-header">
            <div>
              <h2>Unusual Market Changes & Alerts</h2>
              <p>Detected abnormal price increases, sudden price drops, and critical supply alerts.</p>
            </div>
            <span className="section-badge alert">System Alerts</span>
          </div>

          {isLoading ? (
            <div className="chart-loading-box">
              <div className="spinner spinner-teal"></div>
            </div>
          ) : alerts.length > 0 ? (
            <div className="admin-market-table-card">
              <div className="admin-market-table-head grid-alert">
                <span>Alert Type</span>
                <span>Product Name</span>
                <span>Category</span>
                <span>City & Market</span>
                <span>Current vs Avg Price</span>
                <span>Variance (%)</span>
                <span>Timestamp</span>
              </div>

              {alerts.map((item) => (
                <div key={item.id} className="admin-market-row grid-alert">
                  <div>
                    <span
                      className={`market-alert-badge ${
                        item.type === 'spike' ? 'spike' : item.type === 'drop' ? 'drop' : 'shortage'
                      }`}
                    >
                      {item.type === 'spike' ? '🔴 Spiking' : item.type === 'drop' ? '🟢 Dropping' : '⚡ Shortage'}
                    </span>
                  </div>
                  <div className="cell-product-name">{item.productName}</div>
                  <div>{item.category}</div>
                  <div>📍 {item.city} ({item.shopName})</div>
                  <div>
                    ${item.price} {item.avgPrice ? `(avg $${item.avgPrice})` : ''}
                  </div>
                  <div>
                    <span className={`percent-change-tag ${item.percentChange > 0 ? 'pos' : item.percentChange < 0 ? 'neg' : 'neutral'}`}>
                      {item.percentChange > 0 ? `+${item.percentChange}%` : item.percentChange < 0 ? `${item.percentChange}%` : 'Shortage'}
                    </span>
                  </div>
                  <div className="cell-timestamp">{formatSyncTime(item.timestamp)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="chart-empty-state green">
              <span>🛡️</span>
              <p>No unusual market changes or abnormal price fluctuations detected.</p>
            </div>
          )}
        </div>

        {/* Recent Market Activity Timeline */}
        <div className="admin-market-section-card">
          <div className="section-header">
            <div>
              <h2>Recent Market Activity Timeline</h2>
              <p>Chronological feed of latest vendor price updates and market entries.</p>
            </div>
            <span className="section-badge indigo">Live Feed</span>
          </div>

          {isLoading ? (
            <div className="chart-loading-box">
              <div className="spinner spinner-teal"></div>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="activity-timeline-list">
              {recentActivity.map((act) => (
                <div key={act.id} className="activity-timeline-item">
                  <div className="activity-icon">📝</div>
                  <div className="activity-details">
                    <div className="activity-title">
                      <strong>{act.productName}</strong> updated at <strong>{act.shopName}</strong> ({act.city})
                    </div>
                    <div className="activity-sub">
                      Price set to <strong>${act.price}</strong> per {act.unit} • Status: <span className="activity-status">{act.stockStatus}</span>
                    </div>
                  </div>
                  <div className="activity-time">{formatSyncTime(act.timestamp)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="chart-empty-state">
              <span>🕒</span>
              <p>No recent activity recorded.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
