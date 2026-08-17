import { useEffect, useState } from 'react';
import vendorApi from './vendorApi';
import LocationMap from '../../components/LocationMap';

const navItems = [
  { label: 'Shop Profile', icon: 'ðŸª', active: true },
  { label: 'Market Insights', icon: 'MI' },
  { label: 'Manage Listings', icon: 'ðŸ§¾' },
  { label: 'Settings', icon: 'âš™' },
];

export default function VendorShopProfilePage({ user, onViewChange, onSignOut }) {
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    address: '',
    latitude: null,
    longitude: null,
  });
  const [shopImage, setShopImage] = useState('');
  const [hasShop, setHasShop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setNotice('Failed: Please upload a JPG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setNotice('Failed: Shop banner must be 2 MB or smaller.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setShopImage(String(reader.result || ''));
      setNotice('Banner selected. Save the shop profile to publish it.');
    };
    reader.onerror = () => setNotice('Failed to read the selected image.');
    reader.readAsDataURL(file);
  };

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
          latitude: data.shop.latitude ?? null,
          longitude: data.shop.longitude ?? null,
        });
        setShopImage(data.shop.image || '');
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

  const setLocation = ({ latitude, longitude }) => {
    setFormData((current) => ({ ...current, latitude, longitude }));
    setNotice('Shop location selected. Save the profile to publish it.');
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setNotice('Failed: Location is not supported by this browser. Select a point on the map.');
      return;
    }
    setNotice('Finding your current location...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ latitude: coords.latitude, longitude: coords.longitude }),
      () => setNotice('Failed: Location permission was denied. Select the shop location on the map instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice('');

    try {
      const payload = {
        ...formData,
        image: shopImage,
      };

      if (hasShop) {
        await vendorApi.updateShop(payload);
        setNotice('Shop profile updated successfully!');
      } else {
        await vendorApi.createShop(payload);
        setHasShop(true);
        setNotice('Shop registered successfully! Awaiting admin approval.');
      }

    } catch (error) {
      setNotice(error.message || 'Failed to save shop details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigate = (label) => {
    if (label === 'Market Insights') onViewChange?.('vendor-insights');
    if (label === 'Manage Listings') onViewChange?.('vendor-listing');
    if (label === 'Shop Profile') onViewChange?.('vendor-profile');
    if (label === 'Settings') onViewChange?.('vendor-settings');
  };

  return (
    <div className="admin-reporting-shell vendor-portal">
      <aside className="admin-reporting-sidebar">
        <div className="admin-reporting-brand">MarketEye Vendor</div>

        <div className="admin-reporting-user-card">
          <div className="admin-reporting-avatar">{user?.name ? user.name[0].toUpperCase() : 'V'}</div>
          <div>
            <div className="admin-reporting-user-name">{user?.name || 'Vendor User'}</div>
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

      <section className="admin-reporting-content vendor-portal-content">
        <div className="admin-reporting-header-row">
          <div>
            <h1>Vendor Shop Profile</h1>
            <p>Manage your storefront information displayed to customers across MarketEye.</p>
          </div>

          <button type="button" className="admin-signout-btn" onClick={onSignOut}>
            Sign out
          </button>

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
          <form onSubmit={handleSubmit} className="admin-product-card vendor-profile-card">
            <div className="vendor-profile-card-header">
              <div>
                <span className="vendor-profile-eyebrow">Storefront details</span>
                <h2>{hasShop ? 'Edit shop information' : 'Register your shop'}</h2>
                <p>Keep your public shop details accurate and easy for customers to understand.</p>
              </div>
            </div>

            <div className="vendor-profile-layout">
              <section className="vendor-profile-section" aria-labelledby="shop-details-title">
                <div className="vendor-profile-section-heading">
                  <span className="vendor-profile-step">1</span>
                  <div>
                    <h3 id="shop-details-title">Basic information</h3>
                    <p>The name and contact details customers will see.</p>
                  </div>
                </div>

                <div className="vendor-profile-fields-grid">
                  <label className="admin-product-field">
                    <span>Shop name *</span>
                    <input
                      type="text"
                      value={formData.shopName}
                      onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                      placeholder="e.g. Hargeisa Central Grocery"
                      required
                    />
                  </label>

                  <label className="admin-product-field">
                    <span>Phone number *</span>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +252 63 4000000"
                      required
                    />
                  </label>

                  <label className="admin-product-field vendor-profile-wide-field">
                    <span>Physical address *</span>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Suuq Bacadle, Hargeisa"
                      required
                    />
                  </label>

                  <label className="admin-product-field vendor-profile-wide-field">
                    <span>Shop banner <small>Optional · JPG, PNG or WebP · max 2 MB</small></span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {shopImage && (
                  <div className="vendor-profile-banner-preview">
                    <img src={shopImage} alt="Shop banner preview" />
                    <div>
                      <strong>Banner preview</strong>
                      <button type="button" onClick={() => setShopImage('')}>Remove</button>
                    </div>
                  </div>
                )}
              </section>

              <section className="vendor-profile-section vendor-profile-map-section" aria-labelledby="shop-location-title">
                <div className="vendor-profile-section-heading">
                  <span className="vendor-profile-step">2</span>
                  <div>
                    <h3 id="shop-location-title">Shop location</h3>
                    <p>Use your position or select the exact place on the map.</p>
                  </div>
                </div>

                <button type="button" className="location-button vendor-location-button" onClick={useCurrentLocation}>
                  Use current location
                </button>
                <LocationMap
                  center={formData.latitude != null ? [formData.latitude, formData.longitude] : null}
                  markers={formData.latitude != null ? [{ id: 'shop', label: formData.shopName || 'Your shop', latitude: formData.latitude, longitude: formData.longitude }] : []}
                  onSelect={setLocation}
                  height={250}
                />
                {formData.latitude != null && (
                  <small className="location-coordinates vendor-location-selected">
                    Location selected: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                  </small>
                )}
              </section>
            </div>

            <div className="vendor-profile-actions">
              <p>{hasShop ? 'Changes will update your public storefront.' : 'Your shop will be sent for admin approval.'}</p>
              <button type="submit" className="admin-product-save-btn" disabled={isSaving}>
                {isSaving ? 'Saving...' : hasShop ? 'Save changes' : 'Submit shop for approval'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
