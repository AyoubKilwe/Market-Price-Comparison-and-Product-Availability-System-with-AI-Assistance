import { useEffect, useMemo, useState } from 'react';
import customerApi from './customerApi';

export default function ShopCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch approved shops from MongoDB
  useEffect(() => {
    const fetchApprovedShops = async () => {
      setIsLoading(true);
      try {
        const data = await customerApi.getApprovedShops();
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

  const fetchShopDetails = async (shopId, shouldScroll = false) => {
    try {
      const data = await customerApi.getShopDetails(shopId);
      setSelectedShop(data.shop);
      setListings(data.listings || []);
      setSelectedCategory('All');
      if (shouldScroll) {
        window.setTimeout(() => {
          document.getElementById('shop-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
      }
    } catch (error) {
      console.error('Failed to fetch shop details:', error);
    }
  };

  const categories = useMemo(() => {
    const catSet = new Set(['All']);
    listings.forEach((item) => {
      if (item.product?.category) {
        catSet.add(item.product.category);
      }
    });
    return Array.from(catSet);
  }, [listings]);

  const filteredListings = useMemo(() => {
    if (selectedCategory === 'All') return listings;
    return listings.filter((item) => item.product?.category === selectedCategory);
  }, [listings, selectedCategory]);

  return (
    <div className="container shop-catalog-page" style={{ padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Storefront Directory</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Browse verified local retail shops and view their current inventory & price catalog.
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner spinner-teal"></div>
        </div>
      ) : shops.length > 0 ? (
        <div className="shop-directory-layout">
          {/* Left Sidebar: Shops list */}
          <div className="shop-selector-section">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Available Shops</h3>
            <div className="shop-card-grid">
              {shops.map((shop) => (
                <button
                  key={shop._id}
                  type="button"
                  onClick={() => fetchShopDetails(shop._id, true)}
                  className={`shop-selector-card ${selectedShop?._id === shop._id ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: selectedShop?._id === shop._id ? 'var(--color-primary)' : 'var(--border-color)',
                    backgroundColor: selectedShop?._id === shop._id ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <div className="shop-selector-image">
                    {shop.image ? <img src={shop.image} alt="" /> : <span>{shop.shopName?.[0] || 'S'}</span>}
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '15px' }}>{shop.shopName}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    📍 {shop.address || 'Hargeisa'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Main Content: Shop catalog */}
          <div id="shop-details" className="shop-catalog-detail">
            {selectedShop ? (
              <div>
                <div
                  className="shop-products-table"
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '24px',
                  }}
                >
                  {selectedShop.image && (
                    <img
                      className="customer-shop-banner"
                      src={selectedShop.image}
                      alt={`${selectedShop.shopName} banner`}
                    />
                  )}
                  <div className="customer-shop-heading">
                    <h2 style={{ fontSize: '22px', fontWeight: '800' }}>{selectedShop.shopName}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Phone: {selectedShop.phone} • Address: {selectedShop.address || 'Hargeisa, Somaliland'}
                    </p>
                  </div>
                </div>

                {/* Category Pills */}
                {categories.length > 1 && (
                  <div className="category-filter-bar shop-category-filter" aria-label="Filter shop products by category">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Products Table */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="shop-products-head"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr',
                      padding: '14px 20px',
                      backgroundColor: '#f8fafc',
                      fontWeight: '700',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <span>Product Name</span>
                    <span>Category</span>
                    <span>Stock Status</span>
                    <span>Price</span>
                  </div>

                  {filteredListings.length > 0 ? (
                    filteredListings.map((item) => (
                      <div
                        key={item._id}
                        className="shop-product-row"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr 1fr',
                          padding: '14px 20px',
                          alignItems: 'center',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        <div style={{ fontWeight: '600' }}>
                          {item.product?.name}
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                            ({item.unit || '1 item'})
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {item.product?.category}
                        </div>
                        <div>
                          <span
                            className={
                              item.stockStatus === 'In Stock'
                                ? 'listing-status in-stock'
                                : item.stockStatus === 'Low Stock'
                                ? 'listing-status low-stock'
                                : 'listing-status out-of-stock'
                            }
                          >
                            {item.stockStatus}
                          </span>
                        </div>
                        <div style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                          ${item.price?.toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No product listings available in this shop yet.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding: '32px', textAlign: 'center' }}>Select a shop to view its catalog.</div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No approved shops available yet.
        </div>
      )}
    </div>
  );
}
