import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const navItems = [
  { label: 'Shop Profile', icon: '🏪' },
  { label: 'Product Selection', icon: '▣' },
  { label: 'Manage Listings', icon: '🧾' },
  { label: 'Approval Status', icon: '✓' },
  { label: 'Settings', icon: '⚙' },
];

export default function VendorShopProfilePage({ user, onViewChange }) {
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    address: '',
  });
  const [shopImage, setShopImage] = useState('');
  const [status, setStatus] = useState('Pending');
  const [hasShop, setHasShop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [activeItem, setActiveItem] = useState('Shop Profile');

  const approvalStates = [
    { label: 'Pending', tone: 'pending' },
    { label: 'Approved', tone: 'approved' },
    { label: 'Rejected', tone: 'rejected' },
    { label: 'Suspended', tone: 'suspended' },
  ];

  const vendorName = user?.name || user?.email || 'Vendor';

  // Fetch live shop profile from MongoDB
  const fetchMyShop = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/shops/my-shop');
      if (data.shop) {
        setFormData({
          shopName: data.shop.shopName || '',
          phone: data.shop.phone || '',
          address: data.shop.address || '',
        });
        setStatus(data.shop.status || 'Pending');
        setHasShop(true);
      }
    } catch (error) {
      if (error.status === 404) {
        setHasShop(false);
        setStatus('Pending');
      } else {
        setNotice(error.message || 'Failed to load shop profile.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyShop();
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
      setNotice('Shop image selected.');
    };
    reader.readAsDataURL(file);
  };

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!formData.shopName || !formData.phone || !formData.address) {
      setNotice('Please fill out all required fields (Shop Name, Phone, Address).');
      return;
    }

    setIsSaving(true);
    setNotice('');

    try {
      let data;
      if (hasShop) {
        data = await api.put('/api/shops/my-shop', formData);
        setNotice('Shop profile updated successfully.');
      } else {
        data = await api.post('/api/shops', formData);
        setHasShop(true);
        setNotice('Shop profile created successfully and submitted for Admin approval.');
      }

      if (data.shop) {
        setFormData({
          shopName: data.shop.shopName,
          phone: data.shop.phone,
          address: data.shop.address,
        });
        setStatus(data.shop.status);
      }
    } catch (error) {
      setNotice(error.message || 'Failed to save shop profile.');
    } finally {
      setIsSaving(false);
    }
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
              vendorName.charAt(0).toUpperCase()
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
              {status === 'Approved'
                ? 'Your shop is fully approved and active! Your listings are visible in customer searches.'
                : status === 'Pending'
                ? 'Your shop profile is currently pending review by an administrator before listings can be published.'
                : status === 'Suspended'
                ? 'Your shop is currently suspended. Please contact admin support.'
                : 'Your shop request was rejected. Please update your profile details.'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner spinner-teal"></div>
          </div>
        ) : (
          <div className="vendor-workspace-grid">
            {activeItem === 'Approval Status' ? (
              <div className="vendor-main-card">
                <div className="vendor-card-header">
                  <h2>Approval Status</h2>
                </div>

                <div className="vendor-approval-grid">
                  {approvalStates.map((state) => (
                    <div
                      key={state.label}
                      className={`vendor-status-card ${state.tone} ${
                        state.label.toLowerCase() === status.toLowerCase() ? 'active-status' : ''
                      }`}
                    >
                      <div className="vendor-status-card-title">{state.label}</div>
                      <div className="vendor-status-card-body">
                        {state.label.toLowerCase() === status.toLowerCase()
                          ? 'Current database shop state'
                          : 'Review state'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="vendor-status-summary" style={{ marginTop: '20px' }}>
                  <strong>Current Status:</strong> <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
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
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="vendor-main-card">
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
                      placeholder="e.g. FreshMart Hargeisa"
                      required
                    />
                  </label>

                  <label className="vendor-field">
                    <span>Business Phone *</span>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={updateField('phone')}
                      placeholder="e.g. 252-63-444555"
                      required
                    />
                  </label>

                  <label className="vendor-field">
                    <span>Physical Address *</span>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={updateField('address')}
                      placeholder="e.g. Main Street, Downtown Hargeisa"
                      required
                    />
                  </label>

                  <label className="vendor-field">
                    <span>Shop Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
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
                  <button type="submit" className="vendor-btn primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : hasShop ? 'Update Shop Profile' : 'Submit for Review'}
                  </button>
                </div>

                {notice && (
                  <div
                    className="vendor-notice"
                    style={{
                      marginTop: '16px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: notice.includes('Failed') || notice.includes('Please') ? '#fef2f2' : '#f0fdf4',
                      color: notice.includes('Failed') || notice.includes('Please') ? '#dc2626' : '#166534',
                    }}
                  >
                    {notice}
                  </div>
                )}
              </form>
            )}

            <div className="vendor-side-stack">
              <div className="vendor-tips-card">
                <div className="vendor-tips-title">Vendor Workflow</div>
                <ul>
                  <li><strong>Shop Profile:</strong> create and update the shop name, phone number, and address in MongoDB.</li>
                  <li><strong>Product Selection:</strong> choose products from the official admin catalog.</li>
                  <li><strong>Product Listing:</strong> publish price and stock status.</li>
                  <li><strong>Manage Listings:</strong> edit and delete shop inventory.</li>
                  <li><strong>Approval Status:</strong> view real-time status (Pending, Approved, Rejected, Suspended).</li>
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
        )}
      </section>
    </div>
  );
}
