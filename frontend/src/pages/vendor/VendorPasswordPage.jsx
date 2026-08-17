import { useState } from 'react';
import VendorSidebar from './VendorSidebar';
import vendorApi from './vendorApi';


export default function VendorPasswordPage({ user, onViewChange, onSignOut }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);


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
      <VendorSidebar activeView="vendor-settings" user={user} onViewChange={onViewChange} />

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
