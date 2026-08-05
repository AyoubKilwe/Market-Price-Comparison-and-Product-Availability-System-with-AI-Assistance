import React, { useState } from 'react';
import ProductCard from '../../components/ProductCard';
import customerApi from './customerApi';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProductComparison, setSelectedProductComparison] = useState(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  // Mockup deals for landing display
  const mockDeals = [
    {
      id: 'mock1',
      name: 'Premium Basmati Rice',
      unit: '5kg',
      shopName: 'FreshMart',
      badge: '-15% Drop',
      originalPrice: 18.99,
      price: 16.14,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&auto=format&fit=crop&q=60'
    },
    {
      id: 'mock2',
      name: 'Organic Whole Milk',
      unit: '1 Gal',
      shopName: 'CityGrocer',
      badge: 'Best Value',
      originalPrice: 5.50,
      price: 4.99,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150&auto=format&fit=crop&q=60'
    },
    {
      id: 'mock3',
      name: 'Pure Cane Sugar',
      unit: '2kg',
      shopName: 'ValueStore',
      badge: '-10% Drop',
      originalPrice: 3.20,
      price: 2.88,
      image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=150&auto=format&fit=crop&q=60'
    },
    {
      id: 'mock4',
      name: 'Extra Virgin Olive Oil',
      unit: '500ml',
      shopName: 'FreshMart',
      badge: 'Trending',
      originalPrice: 12.50,
      price: 11.00,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&auto=format&fit=crop&q=60'
    }
  ];

  // Perform search on backend API
  const handleSearch = async (queryText) => {
    const trimmed = queryText.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await customerApi.getProducts(trimmed);
      if (data.products) {
        const formatted = data.products.map(p => ({
          id: p._id,
          name: p.name,
          unit: p.unit,
          price: p.price || 0,
          category: p.category,
          image: p.image || ''
        }));
        setSearchResults(formatted);
      }
    } catch (err) {
      console.error('Failed to search products:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Perform comparison on backend API
  const handleCompareProduct = async (product) => {
    if (product.id.startsWith('mock')) {
      setSelectedProductComparison({
        product: { name: product.name, unit: product.unit },
        summary: { lowest: product.price, highest: product.price + 2, average: product.price + 0.9 },
        listings: [
          { shop: { shopName: product.shopName, phone: '252-63-444555', address: 'Main Street' }, price: product.price, stockStatus: 'In Stock' },
          { shop: { shopName: 'Al-Baraka Store', phone: '252-63-123456', address: 'Jigjiga Yar' }, price: product.price + 1.2, stockStatus: 'Low Stock' },
          { shop: { shopName: 'SomMart', phone: '252-63-789012', address: 'Downtown' }, price: product.price + 2.0, stockStatus: 'Out of Stock' }
        ]
      });
      setTimeout(() => {
        document.getElementById('comparison-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    setIsLoadingComparison(true);
    try {
      const data = await customerApi.getProductListings(product.id);
      setSelectedProductComparison(data);
      setTimeout(() => {
        document.getElementById('comparison-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error fetching comparison:', err);
      setSelectedProductComparison({
        product: { name: product.name, unit: product.unit },
        summary: { lowest: null, highest: null, average: null },
        listings: []
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
            <span className="tag" onClick={() => { setSearchQuery('Rice'); handleSearch('Rice'); }}>Basmati Rice 5kg</span>
            <span className="tag" onClick={() => { setSearchQuery('Milk'); handleSearch('Milk'); }}>Whole Milk 1L</span>
            <span className="tag" onClick={() => { setSearchQuery('Sugar'); handleSearch('Sugar'); }}>Cane Sugar 2kg</span>
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
              <h2 className="comparison-title">{selectedProductComparison.product.name}</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Comparing prices per {selectedProductComparison.product.unit || 'unit'} across registered shops
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
                    ${selectedProductComparison.summary.lowest?.toFixed(2)}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-label">Average Price</div>
                  <div className="summary-card-value">
                    ${selectedProductComparison.summary.average?.toFixed(2)}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-label">Highest Price</div>
                  <div className="summary-card-value">
                    ${selectedProductComparison.summary.highest?.toFixed(2)}
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
                          <span className="price-cell">${item.price.toFixed(2)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="no-results">
              No active listings found for this product. Approved vendors have not posted stock yet.
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
              <p>Found {searchResults.length} matching official products</p>
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
                  product={{
                    ...product,
                    price: product.price || 4.5
                  }}
                  onCompare={handleCompareProduct}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">
              No products found. Try typing a generic word like "rice", "sugar", or "milk".
            </div>
          )}
        </section>
      )}

      {/* Top Deals Today Section */}
      <section className="deals-section">
        <div className="section-header">
          <div className="section-title-group">
            <h2>Top Deals Today</h2>
            <p>The biggest price drops on essentials in Hargeisa.</p>
          </div>
          <a href="#all-deals" className="view-all-link">
            <span>View All Deals</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="products-grid">
          {mockDeals.map((deal) => (
            <ProductCard
              key={deal.id}
              product={deal}
              onCompare={handleCompareProduct}
            />
          ))}
        </div>
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
                Type in any everyday essential. We scan thousands of local and online retailers instantly.
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
                View side-by-side price comparisons, historical trends, and availability metrics.
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
                Choose the best deal, build your shopping list, and stop overpaying for groceries.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
