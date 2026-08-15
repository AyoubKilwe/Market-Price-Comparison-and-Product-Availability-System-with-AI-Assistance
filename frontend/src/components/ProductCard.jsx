import { toggleFavourite, useFavouriteIds } from '../utils/favourites';
import { announcePriceAlertChange, priceAlertApi } from '../utils/priceAlerts';

export default function ProductCard({ product, onCompare, alertIds = [] }) {
  const favouriteIds = useFavouriteIds('product');
  const isFavorite = favouriteIds.includes(product.id);
  const isAlertOn = alertIds.includes(product.id);

  const togglePriceAlert = async (event) => {
    event.stopPropagation();
    if (isAlertOn) await priceAlertApi.removeAlert(product.id);
    else await priceAlertApi.addAlert(product.id);
    announcePriceAlertChange();
  };

  // Helper to get matching badge classes
  const getBadgeClass = (badgeType) => {
    switch (badgeType) {
      case '-15% Drop':
      case '-10% Drop':
        return 'card-badge badge-drop';
      case 'Best Value':
        return 'card-badge badge-value';
      case 'Trending':
        return 'card-badge badge-trending';
      default:
        return 'card-badge badge-trending';
    }
  };

  return (
    <div className="product-card group">
      {product.badge && (
        <span className={getBadgeClass(product.badge)}>
          {product.badge}
        </span>
      )}

      {/* Favorite Floating Button */}
      <button
        type="button"
        className={`card-favorite-btn ${isFavorite ? 'is-fav' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavourite('product', product.id);
        }}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
        title={isFavorite ? 'Remove from favourites' : 'Save to favourites'}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill={isFavorite ? '#ef4444' : 'none'}
          stroke={isFavorite ? '#ef4444' : 'currentColor'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </button>

      {/* Image Showcase Container */}
      <div className="card-image-wrapper" onClick={() => onCompare(product)}>
        <img
          src={product.image || '/assets/hero.png'}
          alt={product.name}
          className="card-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
          }}
        />
        {product.category && (
          <span className="card-category-pill">
            <span className="category-dot"></span>
            {product.category}
          </span>
        )}
      </div>

      {/* Product Content Details */}
      <div className="card-body-content">
        <h3 className="card-title" onClick={() => onCompare(product)}>
          {product.name}
        </h3>

        <div className="card-meta-tags">
          {product.unit && (
            <span className="meta-pill unit-pill">
              📦 {product.unit}
            </span>
          )}
          <span className="meta-pill shop-pill">
            🏪 {product.shopName || 'Available in shops'}
          </span>
        </div>
      </div>

      {/* Price Alert Action Button */}
      <button
        type="button"
        className={`product-alert-action ${isAlertOn ? 'active' : ''}`}
        onClick={togglePriceAlert}
        disabled={!Number.isFinite(product.price)}
        aria-pressed={isAlertOn}
      >
        <span className="alert-icon">{isAlertOn ? '🔔' : '🔔'}</span>
        <span>{isAlertOn ? 'Price Alert On' : 'Set Price Alert'}</span>
      </button>

      {/* Card Footer with Price & Quick Compare */}
      <div className="card-footer">
        <div className="price-box">
          <span className="price-label">Best Price</span>
          <div className="price-row">
            {product.originalPrice && (
              <span className="price-original">${product.originalPrice}</span>
            )}
            <span className="price-current">
              {Number.isFinite(product.price) ? `$${product.price.toFixed(2)}` : 'No price'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="card-add-btn"
          onClick={() => onCompare(product)}
          title="Compare shop prices"
        >
          <span>Compare</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
