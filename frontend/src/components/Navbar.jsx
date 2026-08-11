import { useFavouriteIds } from '../utils/favourites';
import { usePriceAlertSummary } from '../utils/priceAlerts';
export default function Navbar({ user, onSignOut, onViewChange }) {
  const productFavourites = useFavouriteIds('product');
  const shopFavourites = useFavouriteIds('shop');
  const favouriteCount = productFavourites.length + shopFavourites.length;
  const { unreadCount } = usePriceAlertSummary();
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
        <button type="button" className="nav-link" onClick={() => onViewChange('landing')}>Home</button>
        <button type="button" className="nav-link" onClick={() => onViewChange('shop-catalog')}>Shops</button>
        <button type="button" className="nav-link favourites-nav-link" onClick={() => onViewChange('favorites')}>♥ Favorites <span>{favouriteCount}</span></button>
        <button type="button" className="nav-link price-alerts-nav-link" onClick={() => onViewChange('price-alerts')}>♢ Price Alerts {unreadCount > 0 && <span>{unreadCount}</span>}</button>
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            {user.role?.toLowerCase() === 'admin' ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => onViewChange('admin-product')}
              >
                Admin Dashboard
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => onViewChange('vendor-profile')}
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



