import { useEffect, useMemo, useState } from 'react';
import customerApi from './customerApi';
import { toggleFavourite, useFavouriteIds } from '../../utils/favourites';

const toRadians = (value) => (value * Math.PI) / 180;
const distanceKm = (from, shop) => {
  const dLat = toRadians(shop.latitude - from.latitude);
  const dLng = toRadians(shop.longitude - from.longitude);
  const value = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(shop.latitude)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

export default function ShopCatalogPage() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopListings, setShopListings] = useState([]);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('requesting');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingShop, setIsLoadingShop] = useState(false);
  const favouriteShopIds = useFavouriteIds('shop');

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCustomerLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationStatus('ready');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      Promise.resolve().then(() => setLocationStatus('unsupported'));
    } else {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setCustomerLocation({ latitude: coords.latitude, longitude: coords.longitude });
          setLocationStatus('ready');
        },
        () => setLocationStatus('denied'),
        { enableHighAccuracy: true, timeout: 12000 }
      );
    }

    customerApi.getApprovedShops()
      .then((data) => {
        const loadedShops = data.shops || [];
        setShops(loadedShops);
        const selectedId = sessionStorage.getItem('marketeye_selected_shop');
        const chosenShop = loadedShops.find((shop) => shop._id === selectedId);
        if (chosenShop) {
          sessionStorage.removeItem('marketeye_selected_shop');
          setSelectedShop(chosenShop);
          setIsLoadingShop(true);
          customerApi.getShopDetails(chosenShop._id)
            .then((details) => {
              setSelectedShop(details.shop);
              setShopListings(details.listings || []);
            })
            .finally(() => setIsLoadingShop(false));
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const sortedShops = useMemo(() => shops
    .map((shop) => ({
      ...shop,
      distance: customerLocation && Number.isFinite(shop.latitude) && Number.isFinite(shop.longitude)
        ? distanceKm(customerLocation, shop)
        : null,
    }))
    .sort((a, b) => {
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    }), [shops, customerLocation]);

  const openShop = async (shop) => {
    setSelectedShop(shop);
    setIsLoadingShop(true);
    try {
      const data = await customerApi.getShopDetails(shop._id);
      setSelectedShop({ ...data.shop, distance: shop.distance });
      setShopListings(data.listings || []);
      window.setTimeout(() => document.getElementById('selected-shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    } finally {
      setIsLoadingShop(false);
    }
  };

  return (
    <main className="container customer-shops-page">
      <header className="customer-shops-header">
        <div><span>Verified local stores</span><h1>Shops near you</h1><p>Choose a shop to see its products and prices.</p></div>
        <div className={`customer-location-pill ${locationStatus}`}>
          <span>{locationStatus === 'ready' ? '✓' : locationStatus === 'requesting' ? '…' : '!'}</span>
          <div>
            <strong>{locationStatus === 'ready' ? 'Location on' : locationStatus === 'requesting' ? 'Allow location' : 'Location off'}</strong>
            <small>{locationStatus === 'ready' ? 'Nearest shops shown first' : locationStatus === 'requesting' ? 'Check the browser popup' : 'Distance cannot be calculated'}</small>
          </div>
          {(locationStatus === 'denied' || locationStatus === 'unsupported') && <button type="button" onClick={requestLocation}>Try again</button>}
        </div>
      </header>

      {isLoading ? <div className="customer-shop-empty">Loading shops...</div> : sortedShops.length === 0 ? <div className="customer-shop-empty"><strong>No shops available</strong><span>Approved shops with active products will appear here.</span></div> : (
        <section className="customer-shop-grid" aria-label="Available shops">
          {sortedShops.map((shop, index) => (
            <div className="shop-card-shell" key={shop._id}>
              <button type="button" className="customer-shop-card" onClick={() => openShop(shop)}>
              <div className="customer-shop-card-image">{shop.image ? <img src={shop.image} alt="" /> : <span>{shop.shopName?.[0] || 'S'}</span>}</div>
              <div className="customer-shop-card-body">
                <div className="customer-shop-card-top"><h2>{shop.shopName}</h2>{index === 0 && shop.distance != null && <span className="closest-label">Closest</span>}</div>
                <p>{shop.address}</p><span className="shop-card-phone"><b>☎</b> Phone: {shop.phone || 'Not provided'}</span>
                <div className="customer-shop-card-footer"><strong>{shop.distance != null ? `${shop.distance.toFixed(1)} km away` : 'Distance unavailable'}</strong><span>View products →</span></div>
              </div>
              </button>
              <button type="button" className={`shop-favourite-btn ${favouriteShopIds.includes(shop._id) ? 'active' : ''}`} onClick={() => toggleFavourite('shop', shop._id)} aria-label={favouriteShopIds.includes(shop._id) ? `Remove ${shop.shopName} from favourites` : `Add ${shop.shopName} to favourites`} aria-pressed={favouriteShopIds.includes(shop._id)}>♥</button>
            </div>
          ))}
        </section>
      )}

      {selectedShop && (
        <section id="selected-shop" className="selected-customer-shop">
          <div className="selected-shop-heading"><div><span>Shop products</span><h2>{selectedShop.shopName}</h2><p>{selectedShop.address}{selectedShop.distance != null ? ` · ${selectedShop.distance.toFixed(1)} km away` : ''}</p></div><button type="button" onClick={() => setSelectedShop(null)} aria-label="Close">×</button></div>
          {isLoadingShop ? <div className="customer-shop-empty">Loading products...</div> : shopListings.length === 0 ? <div className="customer-shop-empty">No products available.</div> : (
            <div className="customer-product-grid">
              {shopListings.map((item) => (
                <article className="customer-product-card" key={item._id}>
                  <div className="customer-product-image">{item.product?.image ? <img src={item.product.image} alt="" /> : <span>{item.product?.name?.[0] || 'P'}</span>}</div>
                  <div><span className="customer-product-category">{item.product?.category}</span><h3>{item.product?.name}</h3><p>{item.unit || '1 item'}</p></div>
                  <div className="customer-product-price"><strong>${item.price.toFixed(2)}</strong><span className={`listing-status ${item.stockStatus.toLowerCase().replaceAll(' ', '-')}`}>{item.stockStatus}</span></div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}







