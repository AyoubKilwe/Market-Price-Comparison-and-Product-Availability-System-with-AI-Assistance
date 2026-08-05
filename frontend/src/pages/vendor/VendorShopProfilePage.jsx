import React, { useEffect, useState } from 'react';
import vendorApi from './vendorApi';

const navItems = [
  { label: 'Shop Profile', icon: '🏪', active: true },
  { label: 'Manage Listings', icon: '🧾' },
  { label: 'Approval Status', icon: '✓' },
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

  const fetchMyShop = async () => {
    setIsLoading(true);
    try {
      const data = await vendorApi.getMyShop();
      if (data.shop) {
        setHasShop(true);
        setFormData({
          shopName: data.shop.shopName || '',
          phone: data.shop.phone || '',
          address: data.shop.address || '',
        });
        setShopImage(data.shop.image || '');
        setStatus(data.shop.status || 'Pending');
      } else {
        setHasShop(false);
        if (user) {
          setFormData((prev) => ({
            ...prev,
            shopName: user.name ? `${user.name}'s Shop` : '',
            phone: user.phone || '',
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load shop details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyShop();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice('');

    try {
      const payload = {
        ...formData,
        image: shopImage,
      };

      let res;
      if (hasShop) {
        res = await vendorApi.updateShop(payload);
        setNotice('Shop profile updated successfully!');
      } else {
        res = await vendorApi.createShop(payload);
        setHasShop(true);
        setNotice('Shop registered successfully! Awaiting admin approval.');
      }

      if (res.shop) {
        setStatus(res.shop.status || 'Pending');
      }
    } catch (error) {
      setNotice(error.message || 'Failed to save shop details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigate = (label) => {
    if (label === 'Manage Listings') onViewChange?.('vendor-listing');
    if (label === 'Shop Profile' || label === 'Approval Status') onViewChange?.('vendor-profile');
  };

  return (
    <div className="admin-reporting-shell">
      <aside className="admin-reporting-sidebar">
        <div className="admin-reporting-brand">MarketEye Vendor</div>

        <div className="admin-reporting-user-card">
          <div className="admin-reporting-avatar">{user?.name ? user.name[0].toUpperCase() : 'V'}</div>
          <div>
            <div className="admin-reporting-user-name">{user?.name || 'Vendor User'}</div>
            <div className="admin-reporting-user-role">Merchant Account</div>
          </div>
        </div>

        <nav className="admin-reporting-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`admin-reporting-nav-item ${item.active ? 'active' : ''}`}
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
            <h1>Vendor Shop Profile</h1>
            <p>Manage your storefront information displayed to customers across MarketEye.</p>
          </div>

          <div>
            <span
              className={
                status === 'Approved'
                  ? 'vendor-status active'
                  : status === 'Pending'
                  ? 'vendor-status pending'
                  : 'vendor-status suspended'
              }
              style={{ fontSize: '14px', padding: '6px 14px' }}
            >
              Status: {status}
            </span>
          </div>
        </div>

        {notice && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: notice.includes('Failed') ? '#fef2f2' : '#f0fdf4',
              color: notice.includes('Failed') ? '#dc2626' : '#166534',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            {notice}
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner spinner-teal"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-product-card" style={{ maxWidth: '600px' }}>
            <div className="admin-product-card-title">
              {hasShop ? 'Edit Shop Information' : 'Register Your Shop'}
            </div>

            <label className="admin-product-field">
              <span>Shop Name *</span>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                placeholder="e.g. Hargeisa Central Grocery"
                required
              />
            </label>

            <label className="admin-product-field">
              <span>Contact Phone Number *</span>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +252 63 4000000"
                required
              />
            </label>

            <label className="admin-product-field">
              <span>Physical Address / Market Location *</span>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Suuq Bacadle, Hargeisa"
                required
              />
            </label>

            <label className="admin-product-field">
              <span>Shop Banner / Logo Image URL (Optional)</span>
              <input
                type="text"
                value={shopImage}
                onChange={(e) => setShopImage(e.target.value)}
                placeholder="https://..."
              />
            </label>

            <button type="submit" className="admin-product-save-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : hasShop ? 'Update Shop Profile' : 'Submit Shop for Approval'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
