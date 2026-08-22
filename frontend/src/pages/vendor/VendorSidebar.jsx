const vendorNavItems = [
  { label: 'Shop Profile', icon: 'SP', view: 'vendor-profile' },
  { label: 'Market Insights', icon: 'MI', view: 'vendor-insights' },
  { label: 'Manage Listings', icon: 'ML', view: 'vendor-listing' },
  { label: 'Settings', icon: 'ST', view: 'vendor-settings' },
];

export default function VendorSidebar({ activeView, user, shopName, onViewChange }) {
  return (
    <aside className="admin-reporting-sidebar vendor-fixed-sidebar">
      <div className="admin-reporting-brand">MarketEye Vendor</div>
      <div className="admin-reporting-user-card">
        <div className="admin-reporting-avatar">{user?.name?.[0]?.toUpperCase() || 'V'}</div>
        <div>
          <div className="admin-reporting-user-name">{user?.name || 'Vendor'}</div>
          {shopName && <div className="admin-reporting-user-role">{shopName}</div>}
        </div>
      </div>
      <nav className="admin-reporting-nav" aria-label="Vendor navigation">
        {vendorNavItems.map((item) => (
          <button key={item.view} type="button" className={`admin-reporting-nav-item ${activeView === item.view ? 'active' : ''}`} onClick={() => onViewChange?.(item.view)}>
            <span className="admin-reporting-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
