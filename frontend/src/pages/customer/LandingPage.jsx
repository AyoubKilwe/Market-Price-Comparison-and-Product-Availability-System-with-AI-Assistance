import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';
import customerApi from './customerApi';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProductComparison, setSelectedProductComparison] = useState(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [featuredDeals, setFeaturedDeals] = useState([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [dealsError, setDealsError] = useState('');

  useEffect(() => {
    const loadFeaturedDeals = async () => {
      try {
        const data = await customerApi.getFeaturedListings();
        setFeaturedDeals((data.deals || []).map(({ product, listing, shopCount }) => ({
          id: product._id,
          name: product.name,
          unit: product.unit || product.category,
          category: product.category,
          image: product.image,
          price: listing.price,
          shopName: shopCount > 1 ? `${shopCount} shops` : listing.shop?.shopName,
          badge: 'Best Value',
        })));
      } catch (error) {
        setDealsError(error.message || 'Could not load current deals.');
      } finally {
        setIsLoadingDeals(false);
      }
    };

    loadFeaturedDeals();
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
      const data = await customerApi.getProducts(trimmed);
      if (data.products) {
        const comparisons = await Promise.all(
          data.products.map(async (product) => {
            try {
              return await customerApi.getProductListings(product._id);
            } catch {
              return null;
            }
          })
        );
        const formatted = data.products.map((p, index) => ({
          id: p._id,
          name: p.name,
          unit: p.unit || p.category,
          price: comparisons[index]?.summary?.lowest ?? null,
          shopName: comparisons[index]?.listings?.length
            ? `${comparisons[index].listings.length} shop${comparisons[index].listings.length === 1 ? '' : 's'}`
            : 'No active listings',
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
      <section id="comparison-search" className="hero-section">
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

          {featuredDeals.length > 0 && (
            <div className="trending-list">
              <span>AVAILABLE NOW:</span>
              {featuredDeals.slice(0, 3).map((deal) => (
                <button
                  key={deal.id}
                  type="button"
                  className="tag"
                  onClick={() => handleCompareProduct(deal)}
                >
                  {deal.name}
                </button>
              ))}
            </div>
          )}
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
                    ...product
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
      <section id="all-deals" className="deals-section">
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

        {isLoadingDeals ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <div className="spinner spinner-teal"></div>
          </div>
        ) : dealsError ? (
          <div className="no-results">{dealsError}</div>
        ) : featuredDeals.length > 0 ? (
          <div className="products-grid">
          {featuredDeals.map((deal) => (
            <ProductCard
              key={deal.id}
              product={deal}
              onCompare={handleCompareProduct}
            />
          ))}
          </div>
        ) : (
          <div className="no-results">
            No current deals are available. Deals appear here when approved shops publish active product listings.
          </div>
        )}
      </section>

      <section id="about" className="about-section">
        <div className="about-inner">
          <div className="about-copy">
            <span className="about-kicker">ABOUT MARKETEYE</span>
            <h2>Clear local prices. Better shopping decisions.</h2>
            <p>
              MarketEye is a market price comparison and product availability platform. We connect
              customers with current prices published by verified local shops, so finding an
              affordable, available product takes minutes instead of visiting store after store.
            </p>
            <p>
              Our work is to organize official products, verify participating shops, and display
              their live listings side by side. Customers can compare prices and stock status,
              while vendors can keep their own catalog accurate and up to date.
            </p>
          </div>
          <div className="about-values">
            <div className="about-value-card">
              <strong>Real shop data</strong>
              <span>Prices come from active listings posted by approved vendors.</span>
            </div>
            <div className="about-value-card">
              <strong>Simple comparison</strong>
              <span>See the cheapest, average, and highest price for one product.</span>
            </div>
            <div className="about-value-card">
              <strong>Local availability</strong>
              <span>Know which shop has an item in stock before you make the trip.</span>
            </div>
          </div>
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
