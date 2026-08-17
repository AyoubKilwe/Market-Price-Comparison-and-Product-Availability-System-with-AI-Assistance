import { useEffect, useMemo, useState } from 'react';
import VendorSidebar from './VendorSidebar';
import vendorApi from './vendorApi';


const shortDate = (date) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00Z`));

export default function VendorInsightsPage({ user, onViewChange, onSignOut }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    vendorApi.getInsights(days)
      .then((result) => active && setData(result))
      .catch((err) => active && setError(err.message || 'Insights could not be loaded.'))
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, [days]);

  const changePeriod = (period) => {
    setIsLoading(true);
    setError('');
    setDays(period);
  };

  const chart = useMemo(() => {
    const rows = data?.daily || [];
    const max = Math.max(1, ...rows.map((row) => Math.max(row.shopVisits, row.productViews)));
    return rows.map((row) => ({ ...row, visitHeight: (row.shopVisits / max) * 100, productHeight: (row.productViews / max) * 100 }));
  }, [data]);

  const summary = data?.summary || { shopVisits: 0, productViews: 0, uniqueVisitors: 0 };
  const engagement = summary.shopVisits ? Math.round((summary.productViews / summary.shopVisits) * 100) : 0;

  return (
    <div className="admin-reporting-shell vendor-portal vendor-insights-shell">
      <VendorSidebar activeView="vendor-insights" user={user} shopName={data?.shop?.shopName} onViewChange={onViewChange} />

      <section className="admin-reporting-content vendor-portal-content">
        <div className="admin-reporting-header-row insights-header">
          <div><span className="insights-eyebrow">Store traffic</span><h1>Market Insights</h1><p>See how customers discover your shop and which products attract the most attention.</p></div>
          <div className="insights-header-actions"><div className="insights-period" aria-label="Insight period">{[7, 30, 90].map((option) => <button type="button" key={option} className={days === option ? 'active' : ''} onClick={() => changePeriod(option)}>{option} days</button>)}</div><button type="button" className="admin-signout-btn" onClick={onSignOut}>Sign out</button></div>
        </div>

        {error && <div className="admin-notice error">{error}</div>}
        {isLoading ? <div className="insights-loading"><div className="spinner spinner-teal" /> Loading market insights...</div> : data && <>
          <div className="insights-stat-grid">
            <article className="insights-stat-card teal"><span>Shop visits</span><strong>{summary.shopVisits.toLocaleString()}</strong><small>Storefront opens in the last {days} days</small><b>?</b></article>
            <article className="insights-stat-card blue"><span>Unique visitors</span><strong>{summary.uniqueVisitors.toLocaleString()}</strong><small>Different customer devices</small><b>?</b></article>
            <article className="insights-stat-card violet"><span>Product views</span><strong>{summary.productViews.toLocaleString()}</strong><small>Products customers opened</small><b>?</b></article>
            <article className="insights-stat-card amber"><span>Views per visit</span><strong>{engagement}%</strong><small>Product interest compared with visits</small><b>?</b></article>
          </div>

          <div className="insights-layout">
            <section className="insights-card traffic-card">
              <div className="insights-card-heading"><div><h2>Traffic trend</h2><p>Daily shop visits and product views</p></div><div className="chart-legend"><span className="visits">Shop visits</span><span className="products">Product views</span></div></div>
              <div className="traffic-chart" role="img" aria-label={`Traffic during the last ${days} days`}>
                {chart.map((row, index) => <div className="traffic-day" key={row.date} title={`${shortDate(row.date)}: ${row.shopVisits} visits, ${row.productViews} product views`}><div className="traffic-bars"><i className="visit-bar" style={{ height: `${Math.max(row.visitHeight, row.shopVisits ? 5 : 0)}%` }} /><i className="product-bar" style={{ height: `${Math.max(row.productHeight, row.productViews ? 5 : 0)}%` }} /></div>{(days === 7 || index % Math.ceil(days / 6) === 0 || index === days - 1) && <span>{shortDate(row.date)}</span>}</div>)}
              </div>
            </section>

            <aside className="insights-card top-product-card">
              <span className="insights-rank-label">Top performer</span>
              {data.products[0] ? <><div className="top-product-image">{data.products[0].image ? <img src={data.products[0].image} alt="" /> : data.products[0].name?.[0]}</div><h2>{data.products[0].name}</h2><p>{data.products[0].category || 'Product'}</p><strong>{data.products[0].views.toLocaleString()} views</strong><small>{data.products[0].uniqueVisitors.toLocaleString()} unique visitors</small></> : <div className="insights-empty-small"><b>No product views yet</b><span>Customer interest will appear here.</span></div>}
            </aside>
          </div>

          <section className="insights-card product-performance">
            <div className="insights-card-heading"><div><h2>Product performance</h2><p>Every product is ranked by customer interest</p></div><span className="insights-count">{data.products.length} viewed products</span></div>
            {data.products.length ? <div className="insights-product-table"><div className="insights-product-head"><span>Product</span><span>Views</span><span>Visitors</span><span>Share</span><span>Last viewed</span></div>{data.products.map((product, index) => { const share = summary.productViews ? Math.round((product.views / summary.productViews) * 100) : 0; return <div className="insights-product-row" key={product.productId}><div className="insights-product-name"><b>{index + 1}</b><span className="insights-product-thumb">{product.image ? <img src={product.image} alt="" /> : product.name?.[0]}</span><div><strong>{product.name}</strong><small>{product.category || 'Uncategorized'}</small></div></div><strong>{product.views.toLocaleString()}</strong><span>{product.uniqueVisitors.toLocaleString()}</span><div className="insights-share"><i><b style={{ width: `${share}%` }} /></i><span>{share}%</span></div><span>{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(product.lastViewedAt))}</span></div>; })}</div> : <div className="insights-empty"><span>??</span><h3>No traffic recorded yet</h3><p>When customers open products from your shop, their views will appear here.</p></div>}
          </section>
        </>}
      </section>
    </div>
  );
}

