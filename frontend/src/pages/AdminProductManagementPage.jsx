import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const navItems = [
  { label: 'Overview', icon: '▦' },
  { label: 'Products', icon: '▣', active: true },
  { label: 'Approvals', icon: '✓' },
  { label: 'Vendors', icon: '◫' },
  { label: 'Shops', icon: '🏪' },
  { label: 'Listings', icon: '🧾' },
  { label: 'Reporting', icon: '📊' },
  { label: 'Settings', icon: '⚙' },
];

const statusClassName = {
  Active: 'catalog-status active',
  Inactive: 'catalog-status archived',
  Archived: 'catalog-status archived',
};

export default function AdminProductManagementPage({ onViewChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState('Products');
  const [formState, setFormState] = useState({
    name: '',
    category: 'Staples & Grains',
    unit: '5kg',
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
      const data = await api.get('/api/products');
      setItems(data.products || []);
    } catch (error) {
      setNotice(error.message || 'Failed to load products from database.');
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
      [item.name, item.category, item.unit, item.status].join(' ').toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  const updateForm = (field) => (event) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormState({ name: '', category: 'Staples & Grains', unit: '5kg', image: '' });
  };

  const saveCatalogItem = async (e) => {
    if (e) e.preventDefault();
    if (!formState.name.trim() || !formState.category.trim() || !formState.unit.trim()) {
      setNotice('Please provide a Product Name, Category, and Unit.');
      return;
    }

    setIsSaving(true);
    setNotice('');

    try {
      const payload = {
        name: formState.name.trim(),
        category: formState.category,
        unit: formState.unit.trim(),
        image: formState.image.trim(),
      };

      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload);
        setNotice('Official product updated in MongoDB.');
      } else {
        await api.post('/api/products', payload);
        setNotice('Official product created in MongoDB.');
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
      unit: item.unit,
      image: item.image || '',
    });
    setNotice(`Editing "${item.name}". Update the fields and click Update Product.`);
  };

  const deleteCatalogItem = async (product) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate "${product.name}"?`)) return;

    try {
      const res = await api.delete(`/api/products/${product._id}`);
      setNotice(res.message || 'Product deleted from MongoDB.');
      if (editingId === product._id) resetForm();
      await fetchProducts();
    } catch (error) {
      setNotice(error.message || 'Failed to delete product.');
    }
  };

  const handleNavigate = (label) => {
    setActiveItem(label);
    if (label === 'Products') onViewChange?.('admin-product');
    if (label === 'Approvals') onViewChange?.('admin-approval');
    if (label === 'Vendors') onViewChange?.('admin-vendor');
    if (label === 'Shops') onViewChange?.('admin-shop');
    if (label === 'Listings') onViewChange?.('admin-listings');
    if (label === 'Overview' || label === 'Reporting' || label === 'Settings') onViewChange?.('admin-reporting');
  };

  return (
    <div className="admin-product-shell">
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

        <button
          type="button"
          className="admin-product-add-btn"
          onClick={() => {
            resetForm();
            setNotice('Fill out product details to create a new official product.');
          }}
        >
          + New Catalog Item
        </button>
      </aside>

      <section className="admin-product-content">
        <div className="admin-product-header-row">
          <div>
            <h1>Official Product Management</h1>
            <p>Create, update, and maintain the official product catalog in MongoDB.</p>
          </div>

          <div className="admin-product-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search catalog..."
            />
          </div>
        </div>

        <div className="admin-product-grid">
          <form onSubmit={saveCatalogItem} className="admin-product-card">
            <div className="admin-product-card-title">{editingId ? 'Edit Product' : 'Create Official Product'}</div>

            <label className="admin-product-field">
              <span>Product Name *</span>
              <input
                type="text"
                value={formState.name}
                onChange={updateForm('name')}
                placeholder="e.g. Premium Basmati Rice 5kg"
                required
              />
            </label>

            <label className="admin-product-field">
              <span>Category *</span>
              <select value={formState.category} onChange={updateForm('category')}>
                <option>Staples & Grains</option>
                <option>Dairy & Eggs</option>
                <option>Pantry</option>
                <option>Beverages</option>
                <option>Electronics</option>
                <option>Fresh Produce</option>
              </select>
            </label>

            <label className="admin-product-field">
              <span>Unit / Package *</span>
              <input
                type="text"
                value={formState.unit}
                onChange={updateForm('unit')}
                placeholder="e.g. 5kg, 1L, Dozen"
                required
              />
            </label>

            <label className="admin-product-field">
              <span>Image URL (Optional)</span>
              <input
                type="text"
                value={formState.image}
                onChange={updateForm('image')}
                placeholder="https://..."
              />
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
            <div className="admin-product-card-title">Database Catalog ({items.length})</div>

            <div className="admin-product-table-head">
              <span>Product Name</span>
              <span>Category</span>
              <span>Unit</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <div className="spinner spinner-teal"></div>
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item._id} className="admin-product-row">
                  <div className="admin-product-name-cell">{item.name}</div>
                  <div>{item.category}</div>
                  <div>{item.unit}</div>
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
                No products found in MongoDB. Use the form on the left to add the first official product!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
