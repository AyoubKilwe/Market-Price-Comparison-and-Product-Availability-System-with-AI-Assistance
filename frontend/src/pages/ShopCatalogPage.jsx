import React, { useMemo, useState } from 'react';

const shopProducts = [
  {
    name: 'Sony WH-1000XM5 Wireless Noise…',
    category: 'Electronics',
    price: 348,
    badge: 'In Stock',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Echo Studio - High-fidelity smart speak…',
    category: 'Smart Home',
    price: 159,
    badge: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1543512214-1265f6d7f9fa?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'YETI Rambler 20 oz Tumbler, Stainless…',
    category: 'Home Goods',
    price: 35,
    badge: 'In Stock',
    image: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Keychron K2 Wireless Mechanical Keyboard',
    category: 'Accessories',
    price: 79,
    badge: 'Out of Stock',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=500&q=80',
  },
];

export default function ShopCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products] = useState(shopProducts);

  const visibleProducts = useMemo(() => {
    if (selectedCategory === 'All Categories') return products;
    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="shop-catalog-layout">
      <aside className="shop-catalog-sidepanel">
        <div className="shop-catalog-shop-card">
          <div className="shop-catalog-shop-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=400&q=80"
              alt="Store"
              className="shop-catalog-shop-image"
            />
          </div>

          <h2>City Center Mart</h2>
          <div className="shop-catalog-rating">★ 4.8 (124 reviews)</div>

          <button type="button" className="shop-catalog-call-btn">
            Call Shop
          </button>

          <button type="button" className="shop-catalog-outline-btn">
            Get Directions
          </button>
        </div>

        <div className="shop-catalog-info-card">
          <h3>About this shop</h3>
          <div className="shop-catalog-meta-row">
            <span className="shop-catalog-meta-label">ADDRESS</span>
            <span>123 Market Street, Suite A Downtown District, 90210</span>
          </div>
          <div className="shop-catalog-meta-row">
            <span className="shop-catalog-meta-label">HOURS</span>
            <div>
              <div>Mon - Fri 9:00 AM - 8:00 PM</div>
              <div>Saturday 10:00 AM - 6:00 PM</div>
              <div>Sunday Closed</div>
            </div>
          </div>
        </div>

        <div className="shop-catalog-map-card">
          <div className="shop-catalog-map-placeholder">Map Preview</div>
        </div>
      </aside>

      <section className="shop-catalog-main-panel">
        <div className="shop-catalog-topbar">
          <div className="shop-catalog-title">Available Products (42)</div>
          <div className="shop-catalog-controls">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="shop-catalog-select"
            >
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Smart Home</option>
              <option>Home Goods</option>
              <option>Accessories</option>
            </select>
            <button type="button" className="shop-catalog-filter-btn">≡</button>
          </div>
        </div>

        <div className="shop-catalog-product-grid">
          {visibleProducts.map((product) => (
            <article key={product.name} className="shop-catalog-card">
              <div className="shop-catalog-badge">
                {product.badge}
              </div>
              <img src={product.image} alt={product.name} className="shop-catalog-product-image" />
              <h4>{product.name}</h4>
              <div className="shop-catalog-product-category">{product.category}</div>
              <div className="shop-catalog-footer">
                <div className="shop-catalog-price">${product.price.toFixed(2)}</div>
                <button type="button" className="shop-catalog-plus-btn">+</button>
              </div>
            </article>
          ))}
        </div>

        <div className="shop-catalog-load-more-row">
          <button type="button" className="shop-catalog-load-more-btn">
            Load More Products
          </button>
        </div>
      </section>
    </div>
  );
}
