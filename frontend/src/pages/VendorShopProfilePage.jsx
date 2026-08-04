import React, { useEffect, useMemo, useState } from 'react';

const navItems = [
  { label: 'Shop Profile', icon: '🏪' },
  { label: 'Product Selection', icon: '▣' },
  { label: 'Manage Listings', icon: '🧾' },
  { label: 'Approval Status', icon: '✓' },
  { label: 'Settings', icon: '⚙' },
];

export default function VendorShopProfilePage({ user, onViewChange }) {
  const [formData, setFormData] = useState({
    shopName: 'Acme Analytics',
    phone: '(555) 123-4567',
    address: 'Street Address, City, State, ZIP',
  });
  const [shopImage, setShopImage] = useState('');
  const [status, setStatus] = useState('Pending Approval');
  const [notice, setNotice] = useState('');
  const [activeItem, setActiveItem] = useState('Shop Profile');
  const approvalStates = [
    { label: 'Pending', tone: 'pending' },
    { label: 'Approved', tone: 'approved' },
    { label: 'Rejected', tone: 'rejected' },
    { label: 'Suspended', tone: 'suspended' },
  ];

  const vendorName = user?.name || user?.fullName || user?.email || 'Vendor';

  useEffect(() => {
    const draft = localStorage.getItem('marketeye_vendor_profile_draft');
    if (!draft) return;

    try {
      const parsedDraft = JSON.parse(draft);
      if (parsedDraft.shopName) setFormData((current) => ({ ...current, ...parsedDraft }));
      if (parsedDraft.shopImage) setShopImage(parsedDraft.shopImage);
    } catch (error) {
      console.error('Could not restore vendor profile draft', error);
    }
  }, []);

  const profileSummary = useMemo(() => {
    return [
      { label: 'Shop Name', value: formData.shopName || '—' },
      { label: 'Business Phone', value: formData.phone || '—' },
      { label: 'Address', value: formData.address || '—' },
    ];
  }, [formData]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setShopImage(reader.result);
      setNotice('Shop image uploaded successfully.');
    };
    reader.readAsDataURL(file);
  };

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSaveDraft = () => {
    localStorage.setItem(
      'marketeye_vendor_profile_draft',
      JSON.stringify({ ...formData, shopImage })
    );
    setNotice('Draft saved locally.');
  };

  const handleSubmitReview = () => {
    setStatus('Pending Approval');
    setNotice('Profile sent for review.');
  };

  const shopPreviewImage = shopImage || 'https://placehold.co/600x400/0f172a/ffffff?text=Shop+Preview';

  return (
    <div className="vendor-dashboard-shell">
      <aside className="vendor-sidebar">
        <div className="vendor-brand">MarketEye</div>

        <div className="vendor-user-card">
          <div className="vendor-avatar">
            {shopImage ? (
              <img
                src={shopImage}
                alt="Shop logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              'V'
            )}
          </div>
          <div>
            <div className="vendor-user-name">{vendorName}</div>
            <div className="vendor-user-role">Shop Management</div>
          </div>
        </div>

        <nav className="vendor-nav">
          {navItems.map((item) => {
            const targetView =
              item.label === 'Shop Profile' || item.label === 'Approval Status' || item.label === 'Settings'
                ? 'vendor-profile'
                : 'vendor-listing';

            return (
              <button
                key={item.label}
                type="button"
                className={`vendor-nav-item ${activeItem === item.label ? 'active' : ''}`}
                onClick={() => {
                  setActiveItem(item.label);
                  onViewChange?.(targetView);

                  if (item.label === 'Approval Status') {
                    setNotice('Approval status is visible from your shop management workspace.');
                  } else if (item.label === 'Settings') {
                    setNotice('Shop settings are ready for future vendor preferences.');
                  } else if (item.label === 'Manage Listings') {
                    setNotice('Manage listings is available from the listing workspace.');
                  }
                }}
              >
                <span className="vendor-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button type="button" className="vendor-add-product-btn" onClick={() => onViewChange?.('vendor-listing')}>
          + Add Product
        </button>
      </aside>

      <section className="vendor-content">
        <header className="vendor-topbar">
          <h1>{activeItem === 'Shop Profile' ? 'Shop Profile Setup' : activeItem}</h1>
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
          {activeItem === 'Approval Status' ? (
            <div className="vendor-main-card">
              <div className="vendor-card-header">
                <h2>Approval Status</h2>
              </div>

              <div className="vendor-approval-grid">
                {approvalStates.map((state) => (
                  <div key={state.label} className={`vendor-status-card ${state.tone}`}>
                    <div className="vendor-status-card-title">{state.label}</div>
                    <div className="vendor-status-card-body">
                      {state.label === status ? 'Current vendor shop state' : 'Available review state'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="vendor-status-summary">
                <strong>Current Status:</strong> {status}
              </div>
            </div>
          ) : activeItem === 'Settings' ? (
            <div className="vendor-main-card">
              <div className="vendor-card-header">
                <h2>Vendor Settings</h2>
              </div>

              <div className="vendor-settings-grid">
                <div className="vendor-settings-card">
                  <div className="vendor-settings-title">Store Notifications</div>
                  <div className="vendor-settings-row">
                    <span>Email alerts</span>
                    <button type="button" className="vendor-mini-toggle on">On</button>
                  </div>
                  <div className="vendor-settings-row">
                    <span>Market updates</span>
                    <button type="button" className="vendor-mini-toggle on">On</button>
                  </div>
                </div>

                <div className="vendor-settings-card">
                  <div className="vendor-settings-title">Security</div>
                  <div className="vendor-settings-row">
                    <span>Two-factor authentication</span>
                    <button type="button" className="vendor-mini-toggle on">Enabled</button>
                  </div>
                  <div className="vendor-settings-row">
                    <span>Session timeout</span>
                    <button type="button" className="vendor-mini-toggle">12 min</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
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

                <label className="vendor-field">
                  <span>Shop Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>

                {shopImage && (
                  <div className="vendor-field">
                    <span>Preview</span>
                    <img
                      src={shopImage}
                      alt="Shop preview"
                      style={{
                        width: '100%',
                        maxHeight: '220px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        marginTop: '10px',
                      }}
                    />
                  </div>
                )}
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
          )}

          <div className="vendor-side-stack">
            <div className="vendor-tips-card">
              <div className="vendor-tips-title">Vendor Workflow</div>
              <ul>
                <li><strong>Shop Profile:</strong> create and update the shop name, phone number, address, and image.</li>
                <li><strong>Product Selection:</strong> choose products from the admin-created official catalog.</li>
                <li><strong>Product Listing:</strong> add your shop price and stock status.</li>
                <li><strong>Manage Listings:</strong> review, edit, and remove your saved listings.</li>
                <li><strong>Approval Status:</strong> track whether your shop is pending, approved, rejected, or suspended.</li>
              </ul>
            </div>

            <div className="vendor-preview-card">
              <div className="vendor-preview-icon">🏪</div>
              <div className="vendor-preview-label">Profile Preview</div>
              <img
                src={shopPreviewImage}
                alt="Shop preview"
                style={{
                  width: '100%',
                  height: '140px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  marginBottom: '12px',
                }}
              />
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
