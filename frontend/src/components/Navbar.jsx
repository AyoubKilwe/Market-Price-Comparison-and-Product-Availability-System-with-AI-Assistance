import React from 'react';

export default function Navbar({ user, onSignOut, onViewChange }) {
  const isVendor = user?.role?.toLowerCase() === 'vendor';
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => onViewChange('landing')}>
        <div className="nav-logo-box">
          {/* Custom eye icon matching logo */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </div>
        <span>MarketEye</span>
      </div>

      <nav className="nav-links">
        <span className="nav-link" onClick={() => onViewChange('landing')}>Comparison</span>
        <span className="nav-link" onClick={() => onViewChange('shop-catalog')}>Shops</span>
        {isVendor && (
          <span className="nav-link" onClick={() => onViewChange('vendor-profile')}>
            Vendor Dashboard
          </span>
        )}
        {isAdmin && (
          <span className="nav-link" onClick={() => onViewChange('admin-product')}>
            Admin Dashboard
          </span>
        )}
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            <span
              style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer' }}
              onClick={() => {
                if (isVendor) onViewChange('vendor-profile');
                if (isAdmin) onViewChange('admin-product');
              }}
            >
              {user.name} ({user.role})
            </span>
            <button className="btn btn-outline" onClick={onSignOut}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => onViewChange('login')}>
              Sign In
            </button>
            <button className="btn btn-black" onClick={() => onViewChange('register')}>
              Join as Vendor
            </button>
          </>
        )}
      </div>
    </header>
  );
}
