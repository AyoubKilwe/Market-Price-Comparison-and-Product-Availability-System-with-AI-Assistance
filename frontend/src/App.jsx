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
import AdminApprovalPage from './pages/admin/AdminApprovalPage';
import AdminProductManagementPage from './pages/admin/AdminProductManagementPage';
import AdminShopManagementPage from './pages/admin/AdminShopManagementPage';
import AdminListingsOverviewPage from './pages/admin/AdminListingsOverviewPage';
import AdminReportingPage from './pages/admin/AdminReportingPage';

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
      setView('admin-product');
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

  const handleLandingSection = (sectionId) => {
    setView('landing');
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  // Admin and vendor pages have their own sidebar â€” hide global navbar/footer
  const isDashboardView = view.startsWith('admin-') || view.startsWith('vendor-');

  return (
    <div className="app-container">
      {/* Header / Navbar â€” hidden on dashboard views */}
      {!isDashboardView && (
        <Navbar
          user={user}
          onSignOut={handleSignOut}
          onViewChange={setView}
          onLandingSection={handleLandingSection}
        />
      )}

      {/* Pages Container */}
      <main style={{ flexGrow: 1 }}>
        {view === 'landing' && <LandingPage onViewChange={setView} />}

        {view === 'login' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} onViewChange={setView} />
        )}

        {view === 'register' && (
          <RegisterPage onRegisterSuccess={handleLoginSuccess} onViewChange={setView} />
        )}

        {view === 'vendor-profile' && (
          <VendorShopProfilePage user={user} onViewChange={setView} onSignOut={handleSignOut} />
        )}

        {view === 'vendor-listing' && (
          <VendorProductListingPage user={user} onViewChange={setView} onSignOut={handleSignOut} />
        )}

        {view === 'vendor-settings' && (
          <VendorPasswordPage user={user} onViewChange={setView} onSignOut={handleSignOut} />
        )}

        {view === 'admin-approval' && <AdminApprovalPage onViewChange={setView} onSignOut={handleSignOut} />}
        {view === 'admin-product' && <AdminProductManagementPage onViewChange={setView} onSignOut={handleSignOut} />}
        {view === 'admin-shop' && <AdminShopManagementPage onViewChange={setView} onSignOut={handleSignOut} />}
        {view === 'admin-listings' && <AdminListingsOverviewPage onViewChange={setView} onSignOut={handleSignOut} />}
        {view === 'admin-reporting' && <AdminReportingPage onViewChange={setView} onSignOut={handleSignOut} />}
        {view === 'shop-catalog' && <ShopCatalogPage />}
        {view === 'favorites' && <FavoritesPage onViewChange={setView} />}
      </main>

      {/* AI assistant is available only on customer/public pages. */}
      {!isDashboardView && <AiAssistant />}

      {/* Footer â€” hidden on dashboard views */}
      {!isDashboardView && (
        <Footer onViewChange={setView} onLandingSection={handleLandingSection} />
      )}
    </div>
  );
}




