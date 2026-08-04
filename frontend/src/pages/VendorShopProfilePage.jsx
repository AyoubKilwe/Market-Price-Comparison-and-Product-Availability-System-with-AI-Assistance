import React, { useMemo, useState } from 'react';

const navItems = [
  { label: 'Overview', icon: '▦' },
  { label: 'Inventory', icon: '▣' },
  { label: 'Approvals', icon: '✓' },
  { label: 'Vendors', icon: '◫', active: true },
  { label: 'Settings', icon: '⚙' },
];

export default function VendorShopProfilePage() {
  const [formData, setFormData] = useState({
    shopName: 'Acme Analytics',
    phone: '(555) 123-4567',
    address: 'Street Address, City, State, ZIP',
  });
  const [status, setStatus] = useState('Pending Approval');
  const [notice, setNotice] = useState('');

  const profileSummary = useMemo(() => {
    return [
      { label: 'Shop Name', value: formData.shopName || '—' },
      { label: 'Business Phone', value: formData.phone || '—' },
      { label: 'Address', value: formData.address || '—' },
    ];
  }, [formData]);

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSaveDraft = () => {
    localStorage.setItem('marketeye_vendor_profile_draft', JSON.stringify(formData));
    setNotice('Draft saved locally.');
  };

  const handleSubmitReview = () => {
    setStatus('Pending Approval');
    setNotice('Profile sent for review.');
  };

  return (
    <div className="vendor-dashboard-shell">
      <aside className="vendor-sidebar">
        <div className="vendor-brand">MarketEye</div>

        <div className="vendor-user-card">
          <div className="vendor-avatar">A</div>
          <div>
            <div className="vendor-user-name">System Admin</div>
            <div className="vendor-user-role">Global Management</div>
          </div>
        </div>

        <nav className="vendor-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`vendor-nav-item ${item.active ? 'active' : ''}`}
            >
              <span className="vendor-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="vendor-add-product-btn">
          + Add Product
        </button>
      </aside>

      <section className="vendor-content">
        <header className="vendor-topbar">
          <h1>Shop Profile Setup</h1>
        </header>

        <div className="vendor-status-banner">
          <div className="vendor-status-icon">◌</div>
          <div>
            <div className="vendor-status-title">Status: {status}</div>
            <p>
              Your shop profile is currently under review. Please complete all required
              information below. Note: Shops must be approved by an administrator before
              appearing in public search results.
            </p>
          </div>
        </div>

        <div className="vendor-workspace-grid">
          <div className="vendor-main-card">
            <div className="vendor-card-header">
              <h2>Business Details</h2>
            </div>

            <div className="vendor-form-fields">
              <label className="vendor-field">
                <span>Shop Name *</span>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={updateField('shopName')}
                  placeholder="e.g. Acme Analytics"
                />
              </label>

              <label className="vendor-field">
                <span>Business Phone *</span>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={updateField('phone')}
                  placeholder="(555) 123-4567"
                />
              </label>

              <label className="vendor-field">
                <span>Physical Address *</span>
                <input
                  type="text"
                  value={formData.address}
                  onChange={updateField('address')}
                  placeholder="Street Address, City, State, ZIP"
                />
              </label>
            </div>

            <div className="vendor-action-row">
              <button type="button" className="vendor-btn secondary" onClick={handleSaveDraft}>
                Save Draft
              </button>
              <button type="button" className="vendor-btn primary" onClick={handleSubmitReview}>
                Submit for Review
              </button>
            </div>

            {notice && <div className="vendor-notice">{notice}</div>}
          </div>

          <div className="vendor-side-stack">
            <div className="vendor-tips-card">
              <div className="vendor-tips-title">Tips for Success</div>
              <ul>
                <li>Ensure your shop name matches your registered business entity to expedite approval.</li>
                <li>Provide a direct business phone number; automated systems may delay verification.</li>
                <li>The physical address will be used for geolocation in local market searches.</li>
              </ul>
            </div>

            <div className="vendor-preview-card">
              <div className="vendor-preview-icon">🏪</div>
              <div className="vendor-preview-label">Profile Preview</div>
              <div className="vendor-preview-list">
                {profileSummary.map((item) => (
                  <div key={item.label} className="vendor-preview-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
