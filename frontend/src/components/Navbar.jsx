import { useState } from 'react';
import { useFavouriteIds } from '../utils/favourites';
import { usePriceAlertSummary } from '../utils/priceAlerts';
export default function Navbar({ user, onSignOut, onViewChange }) {
  const productFavourites = useFavouriteIds('product');
  const shopFavourites = useFavouriteIds('shop');
  const favouriteCount = productFavourites.length + shopFavourites.length;
  const { unreadCount } = usePriceAlertSummary();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const goTo = (view) => { onViewChange(view); setIsMenuOpen(false); };
  return (
    <header className={`navbar ${isMenuOpen ? 'mobile-open' : ''}`}>
      <div className="nav-brand" onClick={() => goTo('landing')}>
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

      <button type="button" className="customer-menu-toggle" onClick={() => setIsMenuOpen((open) => !open)} aria-expanded={isMenuOpen} aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}>
        <span></span><span></span><span></span>
      </button>

      <nav className="nav-links">
        <button type="button" className="nav-link" onClick={() => goTo('landing')}>Home</button>
        <button type="button" className="nav-link" onClick={() => goTo('shop-catalog')}>Shops</button>
        <button type="button" className="nav-link favourites-nav-link" onClick={() => goTo('favorites')}>♥ Favorites <span>{favouriteCount}</span></button>
        <button type="button" className="nav-link price-alerts-nav-link" onClick={() => goTo('price-alerts')}>♢ Price Alerts {unreadCount > 0 && <span>{unreadCount}</span>}</button>
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            {user.role?.toLowerCase() === 'admin' ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => goTo('admin-product')}
              >
                Admin Dashboard
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => goTo('vendor-profile')}
              >
                Vendor Dashboard
              </button>
            )}
            <button className="btn btn-outline" onClick={onSignOut}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => goTo('login')}>
              Sign In
            </button>
            <button className="btn btn-black" onClick={() => goTo('register')}>
              Join as Vendor
            </button>
          </>
        )}
      </div>
    </header>
  );
}



