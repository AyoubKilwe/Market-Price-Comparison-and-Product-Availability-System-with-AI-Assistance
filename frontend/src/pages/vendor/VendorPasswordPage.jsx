import { useState } from 'react';
import vendorApi from './vendorApi';

const navItems = [
  { label: 'Shop Profile', icon: '🏪' },
  { label: 'Manage Listings', icon: '🧾' },
  { label: 'Settings', icon: '⚙' },
];

export default function VendorPasswordPage({ user, onViewChange, onSignOut }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleNavigate = (label) => {
    if (label === 'Shop Profile') onViewChange?.('vendor-profile');
    if (label === 'Manage Listings') onViewChange?.('vendor-listing');
    if (label === 'Settings') onViewChange?.('vendor-settings');
  };

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice('');

    if (form.newPassword.length < 8) {
      setNotice('The new password must be at least 8 characters.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setNotice('The new password and confirmation do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const data = await vendorApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setNotice(data.message || 'Password changed successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setNotice(error.message || 'The password could not be changed.');
    } finally {
      setIsSaving(false);
    }
  };

  const isError = notice && !notice.toLowerCase().includes('successfully');

  return (
    <div className="admin-reporting-shell vendor-portal">
      <aside className="admin-reporting-sidebar">
        <div className="admin-reporting-brand">MarketEye Vendor</div>
        <div className="admin-reporting-user-card">
          <div className="admin-reporting-avatar">{user?.name?.[0]?.toUpperCase() || 'V'}</div>
          <div>
            <div className="admin-reporting-user-name">{user?.name || 'Vendor'}</div>
          </div>
        </div>
        <nav className="admin-reporting-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`admin-reporting-nav-item ${item.label === 'Settings' ? 'active' : ''}`}
              onClick={() => handleNavigate(item.label)}
            >
              <span className="admin-reporting-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-reporting-content vendor-portal-content">
        <div className="admin-reporting-header-row">
          <div>
            <h1>Account Settings</h1>
            <p>Create a new secure password for your shop account.</p>
          </div>
          <button type="button" className="admin-signout-btn" onClick={onSignOut}>Sign out</button>
        </div>

        <form className="admin-product-card vendor-password-card" onSubmit={handleSubmit}>
          <div className="admin-product-card-title">Change Password</div>

          {notice && <div className={`admin-notice ${isError ? 'error' : 'success'}`}>{notice}</div>}

          <label className="admin-product-field">
            <span>Current Password *</span>
            <input type="password" value={form.currentPassword} onChange={updateField('currentPassword')} autoComplete="current-password" required />
          </label>
          <label className="admin-product-field">
            <span>New Password *</span>
            <input type="password" value={form.newPassword} onChange={updateField('newPassword')} autoComplete="new-password" minLength="8" required />
          </label>
          <label className="admin-product-field">
            <span>Confirm New Password *</span>
            <input type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')} autoComplete="new-password" minLength="8" required />
          </label>
          <button type="submit" className="admin-product-save-btn" disabled={isSaving}>
            {isSaving ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </section>
    </div>
  );
}
