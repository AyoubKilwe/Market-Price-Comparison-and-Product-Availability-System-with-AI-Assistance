<<<<<<< Updated upstream
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AiAssistant from './components/AiAssistant';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VendorShopProfilePage from './pages/VendorShopProfilePage';
import VendorProductListingPage from './pages/VendorProductListingPage';
import AdminApprovalPage from './pages/AdminApprovalPage';
import AdminProductManagementPage from './pages/AdminProductManagementPage';
import AdminVendorManagementPage from './pages/AdminVendorManagementPage';
import AdminShopManagementPage from './pages/AdminShopManagementPage';
import AdminListingsOverviewPage from './pages/AdminListingsOverviewPage';
import AdminReportingPage from './pages/AdminReportingPage';
import ShopCatalogPage from './pages/ShopCatalogPage';
=======
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AiAssistant from './components/AiAssistant';
// Customer / Public Pages
import LandingPage from './pages/customer/LandingPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import ShopCatalogPage from './pages/customer/ShopCatalogPage';
import FavoritesPage from './pages/customer/FavoritesPage';

// Vendor Pages
import VendorShopProfilePage from './pages/vendor/VendorShopProfilePage';
import VendorProductListingPage from './pages/vendor/VendorProductListingPage';
import VendorPasswordPage from './pages/vendor/VendorPasswordPage';

// Admin Pages
import AdminMarketMonitoringPage from './pages/admin/AdminMarketMonitoringPage';
import AdminApprovalPage from './pages/admin/AdminApprovalPage';
import AdminProductManagementPage from './pages/admin/AdminProductManagementPage';
import AdminShopManagementPage from './pages/admin/AdminShopManagementPage';
import AdminListingsOverviewPage from './pages/admin/AdminListingsOverviewPage';
import AdminReportingPage from './pages/admin/AdminReportingPage';
>>>>>>> Stashed changes

export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('marketeye_token');
    const savedUser = localStorage.getItem('marketeye_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('marketeye_token');
        localStorage.removeItem('marketeye_user');
      }
    }
  }, []);

  const handleLoginSuccess = (userData, userToken) => {
    localStorage.setItem('marketeye_token', userToken);
    localStorage.setItem('marketeye_user', JSON.stringify(userData));
    setUser(userData);
    setToken(userToken);

    const normalizedRole = userData?.role?.toLowerCase();

    if (normalizedRole === 'vendor') {
      setView('vendor-profile');
    } else if (normalizedRole === 'admin') {
      setView('admin-market-monitoring');
    } else {
      setView('landing');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('marketeye_token');
    localStorage.removeItem('marketeye_user');
    setUser(null);
    setToken(null);
    setView('landing');
  };

  return (
    <div className="app-container">
      {/* Header / Navbar */}
      <Navbar user={user} onSignOut={handleSignOut} onViewChange={setView} />

      {/* Pages Container */}
      <main style={{ flexGrow: 1 }}>
        {view === 'landing' && <LandingPage />}

        {view === 'login' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} onViewChange={setView} />
        )}

        {view === 'register' && (
          <RegisterPage onRegisterSuccess={handleLoginSuccess} onViewChange={setView} />
        )}

        {view === 'vendor-profile' && (
          <VendorShopProfilePage user={user} onViewChange={setView} />
        )}

        {view === 'vendor-listing' && (
          <VendorProductListingPage user={user} onViewChange={setView} />
        )}

<<<<<<< Updated upstream
        {view === 'admin-approval' && <AdminApprovalPage onViewChange={setView} />}
        {view === 'admin-product' && <AdminProductManagementPage onViewChange={setView} />}
        {view === 'admin-vendor' && <AdminVendorManagementPage onViewChange={setView} />}
        {view === 'admin-shop' && <AdminShopManagementPage onViewChange={setView} />}
        {view === 'admin-listings' && <AdminListingsOverviewPage onViewChange={setView} />}
        {view === 'admin-reporting' && <AdminReportingPage onViewChange={setView} />}
=======
        {view === 'vendor-settings' && (
          <VendorPasswordPage user={user} onViewChange={setView} onSignOut={handleSignOut} />
        )}

        {view === 'admin-market-monitoring' && <AdminMarketMonitoringPage onViewChange={setView} onSignOut={handleSignOut} />}
        {view === 'admin-approval' && <AdminApprovalPage onViewChange={setView} onSignOut={handleSignOut} />}
        {view === 'admin-product' && <AdminProductManagementPage onViewChange={setView} onSignOut={handleSignOut} />}
        {view === 'admin-shop' && <AdminShopManagementPage onViewChange={setView} onSignOut={handleSignOut} />}
        {view === 'admin-listings' && <AdminListingsOverviewPage onViewChange={setView} onSignOut={handleSignOut} />}
        {view === 'admin-reporting' && <AdminReportingPage onViewChange={setView} onSignOut={handleSignOut} />}
>>>>>>> Stashed changes
        {view === 'shop-catalog' && <ShopCatalogPage />}
      </main>

      {/* Floating AI Chat Assistant */}
      <AiAssistant />

      {/* Footer */}
      <Footer onViewChange={setView} />
    </div>
  );
}
