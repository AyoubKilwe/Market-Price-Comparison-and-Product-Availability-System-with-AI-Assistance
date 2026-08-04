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
import AdminReportingPage from './pages/AdminReportingPage';
import ShopCatalogPage from './pages/ShopCatalogPage';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'login' | 'register' | 'vendor-profile' | 'vendor-listing' | 'admin-approval' | 'admin-product' | 'admin-vendor' | 'admin-reporting' | 'shop-catalog'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Restore session from localStorage if remembered
  useEffect(() => {
    const savedToken = localStorage.getItem('marketeye_token');
    const savedUser = localStorage.getItem('marketeye_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);

    const normalizedRole = userData?.role?.toLowerCase();

    if (normalizedRole === 'vendor') {
      setView('vendor-listing');
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
        {view === 'admin-approval' && <AdminApprovalPage onViewChange={setView} />}
        {view === 'admin-product' && <AdminProductManagementPage onViewChange={setView} />}
        {view === 'admin-vendor' && <AdminVendorManagementPage onViewChange={setView} />}
        {view === 'admin-reporting' && <AdminReportingPage onViewChange={setView} />}
        {view === 'shop-catalog' && <ShopCatalogPage />}
      </main>

      {/* Floating AI Chat Assistant */}
      <AiAssistant />

      {/* Footer */}
      <Footer onViewChange={setView} />
    </div>
  );
}
