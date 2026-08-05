import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProductComparison, setSelectedProductComparison] = useState(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  // Fetch initial active products from MongoDB for home display
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const data = await api.get('/api/products');
        if (data.products && data.products.length > 0) {
          const formatted = data.products.map((p) => ({
            id: p._id,
            name: p.name,
            unit: p.unit,
            category: p.category,
            image: p.image || '',
          }));
          setFeaturedProducts(formatted);
        }
      } catch (err) {
        console.error('Failed to load initial products:', err);
      }
    };
    fetchInitial();
  }, []);

  // Perform search on backend API
  const handleSearch = async (queryText) => {
    const trimmed = queryText.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await api.get(`/api/products?search=${encodeURIComponent(trimmed)}`);
      const formatted = (data.products || []).map((p) => ({
        id: p._id,
        name: p.name,
        unit: p.unit,
        category: p.category,
        image: p.image || '',
      }));
      setSearchResults(formatted);
    } catch (err) {
      console.error('Failed to search products:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Perform comparison on backend API
  const handleCompareProduct = async (product) => {
    setIsLoadingComparison(true);
    try {
      const data = await api.get(`/api/listings/product/${product.id}`);
      setSelectedProductComparison(data);
      setTimeout(() => {
        document.getElementById('comparison-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setSelectedProductComparison({
        product: { name: product.name, unit: product.unit },
        summary: { lowest: null, highest: null, average: null },
        listings: [],
      });
      setTimeout(() => {
        document.getElementById('comparison-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } finally {
      setIsLoadingComparison(false);
    }
  };

  return (
    <div className="main-content">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          Compare prices of everyday essentials. <span className="teal-highlight">Instantly.</span>
        </h1>
        <p className="hero-subtitle">
          Stop overpaying for basics. MarketEye tracks real-time prices for Rice, Sugar, Milk, and thousands of other items across local and national retailers.
        </p>

        {/* Search Input Box */}
        <form
          className="search-container"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
        >
          <div className="search-wrapper">
            <span className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search for Rice, Sugar, Milk..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length > 2) {
                  handleSearch(e.target.value);
                } else if (e.target.value.length === 0) {
                  setSearchResults([]);
                }
              }}
            />
            <button type="submit" className="btn btn-black" style={{ borderRadius: '8px' }}>
              Compare Now
            </button>
          </div>

          <div className="trending-list">
            <span>TRENDING:</span>
            <span
              className="tag"
              onClick={() => {
                setSearchQuery('Rice');
                handleSearch('Rice');
              }}
            >
              Basmati Rice
            </span>
            <span
              className="tag"
              onClick={() => {
                setSearchQuery('Milk');
                handleSearch('Milk');
              }}
            >
              Milk
            </span>
            <span
              className="tag"
              onClick={() => {
                setSearchQuery('Sugar');
                handleSearch('Sugar');
              }}
            >
              Sugar
            </span>
          </div>
        </form>
      </section>

      {/* Comparison Drawer / Detail Area */}
      {isLoadingComparison && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner spinner-teal"></div>
        </div>
      )}

      {selectedProductComparison && (
        <section id="comparison-view" className="comparison-section">
          <div className="comparison-header">
            <div>
              <h2 className="comparison-title">{selectedProductComparison.product?.name}</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Comparing prices per {selectedProductComparison.product?.unit || 'unit'} across registered shops
              </p>
            </div>
            <button
              type="button"
              className="comparison-close-btn"
              onClick={() => setSelectedProductComparison(null)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {selectedProductComparison.listings && selectedProductComparison.listings.length > 0 ? (
            <>
              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card cheapest-card">
                  <div className="summary-card-label">Cheapest Price</div>
                  <div className="summary-card-value">
                    ${selectedProductComparison.summary?.lowest?.toFixed(2)}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-label">Average Price</div>
                  <div className="summary-card-value">
                    ${selectedProductComparison.summary?.average?.toFixed(2)}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-label">Highest Price</div>
                  <div className="summary-card-value">
                    ${selectedProductComparison.summary?.highest?.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="comparison-table-wrapper">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Retailer / Shop</th>
                      <th>Availability</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProductComparison.listings.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="shop-info-cell">
                            <span className="shop-cell-name">{item.shop?.shopName}</span>
                            <span className="shop-cell-sub">
                              {item.shop?.address} • {item.shop?.phone}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`stock-badge ${
                              item.stockStatus === 'In Stock'
                                ? 'stock-instock'
                                : item.stockStatus === 'Low Stock'
                                ? 'stock-lowstock'
                                : 'stock-outstock'
                            }`}
                          >
                            {item.stockStatus}
                          </span>
                        </td>
                        <td>
                          <span className="price-cell">${item.price?.toFixed(2)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="no-results">
              No active shop listings found for this product. Approved vendors have not posted stock yet.
            </div>
          )}
        </section>
      )}

      {/* Search Results / Product list */}
      {searchQuery.trim() !== '' && (
        <section className="deals-section" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="section-header">
            <div className="section-title-group">
              <h2>Search Results for "{searchQuery}"</h2>
              <p>Found {searchResults.length} matching official products in database</p>
            </div>
          </div>

          {isSearching ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
              <div className="spinner spinner-teal"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="products-grid">
              {searchResults.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onCompare={handleCompareProduct}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">
              No products found in MongoDB matching "{searchQuery}". Try typing "rice", "milk", or "sugar".
            </div>
          )}
        </section>
      )}

      {/* Top Products Section */}
      <section className="deals-section">
        <div className="section-header">
          <div className="section-title-group">
            <h2>Official Market Products</h2>
            <p>Real-time tracked products across registered vendors in Hargeisa.</p>
          </div>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCompare={handleCompareProduct}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            No official products registered in database yet. Admin can create official products in the Admin Dashboard!
          </div>
        )}
      </section>

      {/* How it works Section */}
      <section className="how-it-works">
        <div className="how-it-works-inner">
          <h2 className="how-it-works-title">Smarter Shopping in 3 Steps</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3 className="step-title">1. Search</h3>
              <p className="step-description">
                Type in any everyday essential. We scan approved local retailers instantly.
              </p>
            </div>

            <div className="step-card">
              <div className="step-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"></path>
                </svg>
              </div>
              <h3 className="step-title">2. Compare</h3>
              <p className="step-description">
                View side-by-side price comparisons and stock availability.
              </p>
            </div>

            <div className="step-card">
              <div className="step-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m19 14-7 7-7-7M12 21V3"></path>
                </svg>
              </div>
              <h3 className="step-title">3. Save</h3>
              <p className="step-description">
                Choose the best deal, contact the shop, and stop overpaying for groceries.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
