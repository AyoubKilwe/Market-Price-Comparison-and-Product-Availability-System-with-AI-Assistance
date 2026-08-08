import React, { useEffect, useMemo, useState } from 'react';
import adminApi from './adminApi';

const navItems = [
  { label: 'Market Monitoring', icon: '📈' },
  { label: 'Products', icon: '▣', active: true },
  { label: 'Approvals', icon: '✓' },
  { label: 'Shops', icon: '🏪' },
  { label: 'Listings', icon: '🧾' },
  { label: 'Reporting', icon: '📊' },
];

const statusClassName = {
  Active: 'catalog-status active',
  Inactive: 'catalog-status archived',
  Archived: 'catalog-status archived',
};

const productCategories = [
  'Raashin',
  'Sharaab',
  'Khudaar iyo Miro',
  'Hilib iyo Kalluun',
  'Alaabta Guriga',
];

export default function AdminProductManagementPage({ onViewChange, onSignOut }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState('Products');
  const [formState, setFormState] = useState({
    name: '',
    category: 'Raashin',
    image: '',
  });
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');

  // Fetch official products from MongoDB
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getProducts();
      setItems(data.products || []);
    } catch (error) {
      setNotice(error.message || 'Failed to load products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) =>
      [item.name, item.category, item.status].join(' ').toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  const updateForm = (field) => (event) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormState({ name: '', category: 'Raashin', image: '' });
  };

  const saveCatalogItem = async (e) => {
    if (e) e.preventDefault();
    if (!formState.name.trim() || !formState.category.trim()) {
      setNotice('Please provide a Product Name and Category.');
      return;
    }

    setIsSaving(true);
    setNotice('');

    try {
      const payload = {
        name: formState.name.trim(),
        category: formState.category,
        image: formState.image.trim(),
      };

      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
        setNotice('Official product updated successfully.');
      } else {
        await adminApi.createProduct(payload);
        setNotice('Official product created successfully.');
      }

      resetForm();
      await fetchProducts();
    } catch (error) {
      setNotice(error.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditingProduct = (item) => {
    setEditingId(item._id);
    setFormState({
      name: item.name,
      category: item.category,
      image: item.image || '',
    });
    setNotice(`Editing "${item.name}".`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1000000) {
        setNotice('Error: Image must be less than 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteCatalogItem = async (product) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate "${product.name}"?`)) return;

    try {
      const res = await adminApi.deleteProduct(product._id);
      setNotice(res.message || 'Product deleted successfully.');
      if (editingId === product._id) resetForm();
      await fetchProducts();
    } catch (error) {
      setNotice(error.message || 'Failed to delete product.');
    }
  };

  const handleNavigate = (label) => {
    setActiveItem(label);
    if (label === 'Market Monitoring') onViewChange?.('admin-market-monitoring');
    if (label === 'Products') onViewChange?.('admin-product');
    if (label === 'Approvals') onViewChange?.('admin-approval');
    if (label === 'Shops') onViewChange?.('admin-shop');
    if (label === 'Listings') onViewChange?.('admin-listings');
    if (label === 'Reporting') onViewChange?.('admin-reporting');
  };

  return (
    <div className="admin-product-shell admin-product-clean">
      <aside className="admin-product-sidebar">
        <div className="admin-product-brand">MarketEye</div>

        <div className="admin-product-user-card">
          <div className="admin-product-avatar">A</div>
          <div>
            <div className="admin-product-user-name">System Admin</div>
            <div className="admin-product-user-role">Global Management</div>
          </div>
        </div>

        <nav className="admin-product-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`admin-product-nav-item ${activeItem === item.label ? 'active' : ''}`}
              onClick={() => handleNavigate(item.label)}
            >
              <span className="admin-product-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-product-content">
        <div className="admin-product-header-row">
          <div>
            <span className="admin-page-eyebrow">Catalog administration</span>
            <h1>Product Management</h1>
            <p>Add products and keep the official catalog organized.</p>
          </div>
          <button type="button" className="admin-signout-btn" onClick={onSignOut}>Sign out</button>
        </div>

        <div className="admin-product-grid">
          <form onSubmit={saveCatalogItem} className="admin-product-card">
            <div className="admin-product-form-heading">
              <span className="admin-product-form-step">+</span>
              <div>
                <h2>{editingId ? 'Edit product' : 'Add a product'}</h2>
                <p>{editingId ? 'Update the selected catalog item.' : 'Create an item vendors can list in their shops.'}</p>
              </div>
            </div>

            <label className="admin-product-field">
              <span>Product Name *</span>
              <input
                type="text"
                value={formState.name}
                onChange={updateForm('name')}
                placeholder="e.g. Flour 5kg"
                required
              />
            </label>

            <label className="admin-product-field">
              <span>Category *</span>
              <select value={formState.category} onChange={updateForm('category')}>
                {!productCategories.includes(formState.category) && formState.category && (
                  <option value={formState.category}>{formState.category} (hore)</option>
                )}
                {productCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className="admin-product-field">
              <span>Product Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {formState.image && formState.image.startsWith('data:image') && (
                <div style={{ marginTop: '8px' }}>
                  <img src={formState.image} alt="Preview" style={{ height: '60px', borderRadius: '4px' }} />
                </div>
              )}
            </label>

            <button type="submit" className="admin-product-save-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingId ? 'Update Product' : 'Save Official Product'}
            </button>

            {editingId && (
              <button
                type="button"
                className="admin-product-clear-btn"
                onClick={resetForm}
                style={{ marginTop: '8px' }}
              >
                Cancel Edit
              </button>
            )}

            {notice && (
              <div
                className="admin-product-notice"
                style={{
                  marginTop: '12px',
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: notice.includes('Failed') || notice.includes('Please') ? '#fef2f2' : '#f0fdf4',
                  color: notice.includes('Failed') || notice.includes('Please') ? '#dc2626' : '#166534',
                }}
              >
                {notice}
              </div>
            )}
          </form>

          <div className="admin-product-card admin-product-table-card">
            <div className="admin-product-catalog-toolbar">
              <div>
                <h2>Product Catalog</h2>
                <p>{filteredItems.length} of {items.length} products</p>
              </div>
              <label className="admin-product-searchbox">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products..."
                  aria-label="Search product catalog"
                />
              </label>
            </div>

            <div className="admin-product-table-head" style={{ gridTemplateColumns: '2fr 2fr 1fr 1.5fr' }}>
              <span>Product Name</span>
              <span>Category</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <div className="spinner spinner-teal"></div>
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item._id} className="admin-product-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 1.5fr' }}>
                  <div className="admin-product-name-cell">{item.name}</div>
                  <div>{item.category}</div>
                  <div>
                    <span className={statusClassName[item.status] || 'catalog-status active'}>
                      {item.status || 'Active'}
                    </span>
                  </div>
                  <div className="admin-product-actions">
                    <button
                      type="button"
                      className="admin-product-action-btn edit"
                      onClick={() => startEditingProduct(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-product-action-btn delete"
                      onClick={() => deleteCatalogItem(item)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No products found. Use the form on the left to add a new product.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
