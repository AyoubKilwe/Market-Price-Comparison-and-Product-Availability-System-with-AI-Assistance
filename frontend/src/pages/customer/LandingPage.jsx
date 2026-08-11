import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../../components/ProductCard';
import customerApi from './customerApi';
import { toggleFavourite, useFavouriteIds } from '../../utils/favourites';
import { announcePriceAlertChange, priceAlertApi, usePriceAlertSummary } from '../../utils/priceAlerts';

const PRICE_ALERTS_KEY = 'marketeye_price_alerts';

const readSavedAlerts = () => {
  try {
    return JSON.parse(localStorage.getItem(PRICE_ALERTS_KEY) || '[]');
  } catch {
    return [];
  }
};

const radians = (value) => (value * Math.PI) / 180;
const getDistance = (from, shop) => {
  const lat = radians(shop.latitude - from.latitude);
  const lng = radians(shop.longitude - from.longitude);
  const value = Math.sin(lat / 2) ** 2 + Math.cos(radians(from.latitude)) * Math.cos(radians(shop.latitude)) * Math.sin(lng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

export default function LandingPage({ onViewChange }) {
  const [search, setSearch] = useState('');
  const [deals, setDeals] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [location, setLocation] = useState(null);
  const [priceAlerts, setPriceAlerts] = useState(readSavedAlerts);
  const [alertMessage, setAlertMessage] = useState('');
  const favouriteShopIds = useFavouriteIds('shop');
  const { alertIds } = usePriceAlertSummary();

  useEffect(() => {
    customerApi.getApprovedShops()
      .then((data) => setShops(data.shops || []))
      .catch(() => setShops([]));
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => setLocation({ latitude: coords.latitude, longitude: coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

  useEffect(() => {
    customerApi.getFeaturedListings()
      .then((data) => setDeals((data.deals || []).map(({ product, listing, shopCount }) => ({
        id: product._id,
        name: product.name,
        unit: listing.unit || product.unit,
        category: product.category,
        image: product.image,
        price: listing.price,
        shopName: `${shopCount} ${shopCount === 1 ? 'shop' : 'shops'}`,
      }))))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) {
      Promise.resolve().then(() => setResults([]));
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const data = await customerApi.getProducts(query);
        const formatted = await Promise.all((data.products || []).map(async (product) => {
          const comparison = await customerApi.getProductListings(product._id).catch(() => null);
          return {
            id: product._id, name: product.name, unit: product.unit || product.category,
            category: product.category, image: product.image,
            price: comparison?.summary?.lowest ?? null,
            shopName: comparison?.listings?.length ? `${comparison.listings.length} shops` : 'Not available',
          };
        }));
        setResults(formatted);
      } catch { setResults([]); }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const checkSavedAlerts = async () => {
      const savedAlerts = readSavedAlerts();
      if (!savedAlerts.length) return;

      const checkedAlerts = await Promise.all(savedAlerts.map(async (alert) => {
        try {
          const comparison = await customerApi.getProductListings(alert.productId);
          const currentPrice = comparison.summary?.lowest;
          const previousPrice = Number(alert.lastPrice);
          const priceChanged = Number.isFinite(currentPrice) && Number.isFinite(previousPrice) && currentPrice !== previousPrice;
          if (priceChanged) {
            const message = alert.productName + ' price changed from $' + previousPrice.toFixed(2) + ' to $' + currentPrice.toFixed(2) + '.';
            setAlertMessage(message);
            if ('Notification' in window && Notification.permission === 'granted') new Notification('MarketEye Price Alert', { body: message });
            return { ...alert, previousPrice, lastPrice: currentPrice };
          }
          return Number.isFinite(currentPrice) ? { ...alert, lastPrice: currentPrice } : alert;
        } catch {
          return alert;
        }
      }));
      localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(checkedAlerts));
      setPriceAlerts(checkedAlerts);
    };
    checkSavedAlerts();
    const intervalId = window.setInterval(checkSavedAlerts, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const nearbyShops = useMemo(() => shops.map((shop) => ({ ...shop, distance: location && Number.isFinite(shop.latitude) && Number.isFinite(shop.longitude) ? getDistance(location, shop) : null })).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)).slice(0, 6), [shops, location]);

  const openShop = (shopId) => {
    sessionStorage.setItem('marketeye_selected_shop', shopId);
    onViewChange?.('shop-catalog');
  };

  const shownProducts = useMemo(() => search.trim().length >= 2 ? results : deals.slice(0, 8), [search, results, deals]);

  const compare = async (product) => {
    const data = await customerApi.getProductListings(product.id).catch(() => null);
    setSelectedProduct(data || { product, listings: [] });
    window.setTimeout(() => document.getElementById('simple-comparison')?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  const savePriceAlert = async () => {
    const product = selectedProduct?.product;
    const currentPrice = selectedProduct?.summary?.lowest;
    if (!product?._id || !Number.isFinite(currentPrice)) return;
    const nextAlerts = [
      ...priceAlerts.filter((alert) => alert.productId !== product._id),
      { productId: product._id, productName: product.name, lastPrice: currentPrice },
    ];
    await priceAlertApi.addAlert(product._id);
    localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(nextAlerts));
    setPriceAlerts(nextAlerts);
    announcePriceAlertChange();
    setAlertMessage('MarketEye is tracking ' + product.name + ' from $' + currentPrice.toFixed(2) + '.');
    if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
  };

  const removePriceAlert = async (productId) => {
    await priceAlertApi.removeAlert(productId);
    const nextAlerts = priceAlerts.filter((alert) => alert.productId !== productId);
    localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(nextAlerts));
    setPriceAlerts(nextAlerts);
    setAlertMessage('Price alert removed.');
    announcePriceAlertChange();
  };

  return (
    <main className="simple-landing">
      {alertMessage && (
        <div className="price-alert-notice" role="status">
          <span>{alertMessage}</span>
          <button type="button" onClick={() => setAlertMessage('')} aria-label="Close notification">X</button>
        </div>
      )}
      <section className="simple-landing-hero fresh-hero">
        <div className="simple-hero-copy fresh-hero-copy">
          <span className="simple-hero-kicker"><i></i> Local prices, made simple</span>
          <h1>Everything you need, <em>closer than you think.</em></h1>
          <p>Discover verified shops near you, check what is available, and choose the best price before you go.</p>
          <div className="simple-hero-actions">
            <button type="button" className="simple-primary-action fresh-primary-action" onClick={() => onViewChange?.('shop-catalog')}><span>&#9906;</span> Explore nearby shops</button>
            <a href="#products">See today's products <span>&darr;</span></a>
          </div>
          <div className="fresh-hero-trust"><span>&#10003; Verified shops</span><span>&#10003; Current prices</span><span>&#9906; Private location</span></div>
        </div>
        <div className="fresh-hero-visual" aria-hidden="true">
          <div className="visual-orbit orbit-one"></div><div className="visual-orbit orbit-two"></div>
          <div className="visual-center-pin"><span>&#9906;</span><small>You</small></div>
          <div className="visual-shop-card visual-shop-one"><b>A</b><div><strong>Amal Market</strong><span>0.8 km away</span></div><em>Closest</em></div>
          <div className="visual-shop-card visual-shop-two"><b>B</b><div><strong>Barwaaqo Shop</strong><span>1.4 km away</span></div></div>
          <div className="visual-shop-card visual-shop-three"><b>S</b><div><strong>Sahal Store</strong><span>2.1 km away</span></div></div>
        </div>
      </section>

      <section className="landing-shops-section">
        <div className="simple-section-heading">
          <div><span>Closest first</span><h2>Nearby shops</h2></div>
          <button type="button" className="landing-view-all" onClick={() => onViewChange?.('shop-catalog')}>View all shops &rarr;</button>
        </div>
        {nearbyShops.length > 0 ? (
          <div className="customer-shop-grid landing-shop-grid">
            {nearbyShops.map((shop, index) => (
              <div className="shop-card-shell" key={shop._id}>
                <button type="button" className="customer-shop-card" onClick={() => openShop(shop._id)}>
                <div className="customer-shop-card-image">{shop.image ? <img src={shop.image} alt="" /> : <span>{shop.shopName?.[0] || 'S'}</span>}</div>
                <div className="customer-shop-card-body">
                  <div className="customer-shop-card-top"><h2>{shop.shopName}</h2>{index === 0 && shop.distance != null && <span className="closest-label">Closest</span>}</div>
                  <p>{shop.address}</p><span className="shop-card-phone"><b>Tel</b> Phone: {shop.phone || 'Not provided'}</span>
                  <div className="customer-shop-card-footer"><strong>{shop.distance != null ? `${shop.distance.toFixed(1)} km away` : 'Location needed'}</strong><span>View products &rarr;</span></div>
                </div>
                </button>
                <button type="button" className={`shop-favourite-btn ${favouriteShopIds.includes(shop._id) ? 'active' : ''}`} onClick={() => toggleFavourite('shop', shop._id)} aria-label={favouriteShopIds.includes(shop._id) ? `Remove ${shop.shopName} from favourites` : `Add ${shop.shopName} to favourites`} aria-pressed={favouriteShopIds.includes(shop._id)}>&#9829;</button>
              </div>
            ))}
          </div>
        ) : <div className="no-results">Loading nearby shops...</div>}
      </section>
      <section id="products" className="simple-products-section">
        <div className="simple-section-heading"><div><span>Available now</span><h2>Products and prices</h2></div><label className="simple-product-search"><span>Search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" /></label></div>
        {isLoading ? <div className="no-results">Loading products...</div> : shownProducts.length > 0 ? <div className="products-grid">{shownProducts.map((product) => <ProductCard key={product.id} product={product} onCompare={compare} alertIds={alertIds} />)}</div> : <div className="no-results">No matching products found.</div>}
      </section>

      {selectedProduct && <section id="simple-comparison" className="simple-comparison">
        <div className="simple-comparison-heading">
          <div><span>Price comparison</span><h2>{selectedProduct.product?.name}</h2></div>
          <div className="comparison-actions">
            <button type="button" className="price-alert-button" onClick={savePriceAlert} disabled={!Number.isFinite(selectedProduct.summary?.lowest)}>
              {priceAlerts.some((alert) => alert.productId === selectedProduct.product?._id) ? 'Price Alert On' : 'Track Price Drops'}
            </button>
            <button type="button" className="comparison-close-btn" onClick={() => setSelectedProduct(null)}>X</button>
          </div>
        </div>
        {selectedProduct.listings?.length > 0 ? <div className="simple-comparison-list">{selectedProduct.listings.map((item) => <div key={item._id}><strong>{item.shop?.shopName}</strong><span>{item.stockStatus}</span><b>${item.price.toFixed(2)}</b></div>)}</div> : <div className="no-results">This product is not available right now.</div>}
      </section>}

      {priceAlerts.length > 0 && (
        <section className="saved-alerts-section" aria-labelledby="saved-alerts-title">
          <div>
            <span className="simple-hero-kicker">Price alerts</span>
            <h2 id="saved-alerts-title">Your saved alerts</h2>
            <p>MarketEye checks saved products and notifies you whenever their price changes.</p>
          </div>
          <div className="saved-alerts-list">
            {priceAlerts.map((alert) => (
              <div className="saved-alert-item" key={alert.productId}>
                <div>
                  <strong>{alert.productName}</strong>
                  {Number.isFinite(Number(alert.previousPrice)) ? (
                    <span>Previous: ${Number(alert.previousPrice).toFixed(2)} - Current: ${Number(alert.lastPrice).toFixed(2)}</span>
                  ) : (
                    <span>Current price: ${Number.isFinite(Number(alert.lastPrice)) ? Number(alert.lastPrice).toFixed(2) : 'not recorded'}</span>
                  )}
                </div>
                <button type="button" onClick={() => removePriceAlert(alert.productId)}>Remove</button>
              </div>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}







