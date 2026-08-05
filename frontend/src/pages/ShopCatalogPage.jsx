import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

export default function ShopCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch approved shops from MongoDB
  useEffect(() => {
    const fetchApprovedShops = async () => {
      setIsLoading(true);
      try {
        const data = await api.get('/api/shops');
        const list = data.shops || [];
        setShops(list);
        if (list.length > 0) {
          fetchShopDetails(list[0]._id);
        }
      } catch (error) {
        console.error('Failed to load approved shops:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApprovedShops();
  }, []);

  const fetchShopDetails = async (shopId) => {
    try {
      const data = await api.get(`/api/shops/${shopId}`);
      setSelectedShop(data.shop);
      setListings(data.listings || []);
    } catch (error) {
      console.error('Failed to load shop details:', error);
    }
  };

  const categories = useMemo(() => {
    const set = new Set(['All Categories']);
    listings.forEach((item) => {
      if (item.product?.category) set.add(item.product.category);
    });
    return Array.from(set);
  }, [listings]);

  const visibleListings = useMemo(() => {
    if (selectedCategory === 'All Categories') return listings;
    return listings.filter((item) => item.product?.category === selectedCategory);
  }, [listings, selectedCategory]);

  return (
    <div className="shop-catalog-layout">
      <aside className="shop-catalog-sidepanel">
        {shops.length > 1 && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Select Approved Shop
            </label>
            <select
              style={{ width: '100%', padding: '8px', borderRadius: '6px', marginTop: '6px', border: '1px solid var(--color-border)' }}
              onChange={(e) => fetchShopDetails(e.target.value)}
              value={selectedShop?._id || ''}
            >
              {shops.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.shopName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="shop-catalog-shop-card">
          <div className="shop-catalog-shop-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=400&q=80"
              alt="Store"
              className="shop-catalog-shop-image"
            />
          </div>

          <h2>{selectedShop?.shopName || 'Market Store'}</h2>
          <div className="shop-catalog-rating">Approved Market Retailer</div>

          <a href={`tel:${selectedShop?.phone || ''}`} style={{ textDecoration: 'none' }}>
            <button type="button" className="shop-catalog-call-btn">
              Call Shop ({selectedShop?.phone || 'Contact'})
            </button>
          </a>
        </div>

        <div className="shop-catalog-info-card">
          <h3>About this shop</h3>
          <div className="shop-catalog-meta-row">
            <span className="shop-catalog-meta-label">ADDRESS</span>
            <span>{selectedShop?.address || 'Hargeisa Main Market'}</span>
          </div>
          <div className="shop-catalog-meta-row">
            <span className="shop-catalog-meta-label">STATUS</span>
            <span>{selectedShop?.status || 'Approved'}</span>
          </div>
        </div>
      </aside>

      <section className="shop-catalog-main-panel">
        <div className="shop-catalog-topbar">
          <div className="shop-catalog-title">
            Available Products ({visibleListings.length})
          </div>
          <div className="shop-catalog-controls">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="shop-catalog-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner spinner-teal"></div>
          </div>
        ) : visibleListings.length > 0 ? (
          <div className="shop-catalog-product-grid">
            {visibleListings.map((item) => (
              <article key={item._id} className="shop-catalog-card">
                <div className="shop-catalog-badge">{item.stockStatus}</div>
                <img
                  src={
                    item.product?.image ||
                    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80'
                  }
                  alt={item.product?.name}
                  className="shop-catalog-product-image"
                />
                <h4>{item.product?.name}</h4>
                <div className="shop-catalog-product-category">
                  {item.product?.category} • {item.product?.unit}
                </div>
                <div className="shop-catalog-footer">
                  <div className="shop-catalog-price">${item.price?.toFixed(2)}</div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No products listed for this shop yet.
          </div>
        )}
      </section>
    </div>
  );
}
