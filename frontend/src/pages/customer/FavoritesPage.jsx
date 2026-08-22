import { useEffect, useState } from 'react';
import customerApi from './customerApi';
import { getFavouriteIds, setFavouriteIds, toggleFavourite } from '../../utils/favourites';

export default function FavoritesPage({ onViewChange }) {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const productIds = getFavouriteIds('product');
      const shopIds = getFavouriteIds('shop');
      const [productResults, shopResults] = await Promise.all([
        Promise.allSettled(productIds.map(async (id) => {
          const [{ product }, comparison] = await Promise.all([
            customerApi.getProduct(id),
            customerApi.getProductListings(id),
          ]);
          return { product, comparison };
        })),
        Promise.allSettled(shopIds.map((id) => customerApi.getShopDetails(id))),
      ]);

      const currentProducts = productResults.filter((result) => result.status === 'fulfilled').map((result) => result.value);
      const currentShops = shopResults.filter((result) => result.status === 'fulfilled').map((result) => result.value.shop);
      setProducts(currentProducts);
      setShops(currentShops);
      setFavouriteIds('product', currentProducts.map(({ product }) => product._id));
      setFavouriteIds('shop', currentShops.map((shop) => shop._id));
      setIsLoading(false);
    };
    load().catch(() => setIsLoading(false));
  }, []);

  const removeProduct = (id) => {
    toggleFavourite('product', id);
    setProducts((items) => items.filter(({ product }) => product._id !== id));
  };
  const removeShop = (id) => {
    toggleFavourite('shop', id);
    setShops((items) => items.filter((shop) => shop._id !== id));
  };
  const openShop = (id) => {
    sessionStorage.setItem('marketeye_selected_shop', id);
    onViewChange?.('shop-catalog');
  };

  return (
    <main className="container favourites-page">
      <header className="favourites-header"><span>Your saved items</span><h1>Favourites</h1><p>Always updated with the latest shop, product, price, and stock information.</p></header>
      <div className="favourites-tabs">
        <button type="button" className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products <span>{products.length}</span></button>
        <button type="button" className={tab === 'shops' ? 'active' : ''} onClick={() => setTab('shops')}>Shops <span>{shops.length}</span></button>
      </div>

      {isLoading ? <div className="favourites-empty">Loading your favourites...</div> : tab === 'products' ? (
        products.length ? <div className="favourite-product-grid">{products.map(({ product, comparison }) => (
          <article className="favourite-product-card" key={product._id}>
            <button type="button" className="favourite-remove" onClick={() => removeProduct(product._id)} aria-label={`Remove ${product.name}`}>♥</button>
            <div className="favourite-product-image">{product.image ? <img src={product.image} alt="" /> : <span>{product.name?.[0]}</span>}</div>
            <span className="customer-product-category">{product.category}</span><h2>{product.name}</h2><p>{product.unit}</p>
            <div className="favourite-price-summary"><div><small>Best price</small><strong>{comparison.summary?.lowest != null ? `$${comparison.summary.lowest.toFixed(2)}` : 'Unavailable'}</strong></div><div><small>Available at</small><strong>{comparison.listings?.length || 0} shops</strong></div></div>
            <div className="favourite-listings">{(comparison.listings || []).slice(0, 3).map((item) => <div key={item._id}><span>{item.shop?.shopName}</span><b>${item.price.toFixed(2)}</b><small>{item.stockStatus}</small></div>)}</div>
          </article>
        ))}</div> : <div className="favourites-empty"><strong>No favourite products yet</strong><span>Tap the heart on a product to save it here.</span></div>
      ) : shops.length ? <div className="customer-shop-grid">{shops.map((shop) => (
        <div className="shop-card-shell" key={shop._id}><button type="button" className="customer-shop-card" onClick={() => openShop(shop._id)}><div className="customer-shop-card-image">{shop.image ? <img src={shop.image} alt="" /> : <span>{shop.shopName?.[0]}</span>}</div><div className="customer-shop-card-body"><h2>{shop.shopName}</h2><p>{shop.address}</p><span className="shop-card-phone"><b>☎</b> Phone: {shop.phone || 'Not provided'}</span><div className="customer-shop-card-footer"><strong>Approved shop</strong><span>View products →</span></div></div></button><button type="button" className="shop-favourite-btn active" onClick={() => removeShop(shop._id)} aria-label={`Remove ${shop.shopName}`}>♥</button></div>
      ))}</div> : <div className="favourites-empty"><strong>No favourite shops yet</strong><span>Tap the heart on a shop to save it here.</span></div>}
    </main>
  );
}
