import React, { useMemo, useState } from 'react';

const catalogItems = [
  {
    name: 'Premium Basmati Rice 5kg',
    category: 'Staples & Grains',
    unit: '5kg',
    price: '$16.14',
    status: 'Active',
  },
  {
    name: 'Organic Whole Milk 1L',
    category: 'Dairy & Eggs',
    unit: '1L',
    price: '$4.99',
    status: 'Active',
  },
  {
    name: 'Pure Cane Sugar 2kg',
    category: 'Pantry',
    unit: '2kg',
    price: '$2.88',
    status: 'Archived',
  },
  {
    name: 'Extra Virgin Olive Oil 500ml',
    category: 'Pantry',
    unit: '500ml',
    price: '$11.00',
    status: 'Active',
  },
];

const navItems = [
  { label: 'Overview', icon: '▦' },
  { label: 'Products', icon: '▣', active: true },
  { label: 'Approvals', icon: '✓' },
  { label: 'Vendors', icon: '◫' },
  { label: 'Settings', icon: '⚙' },
];

const statusClassName = {
  Active: 'catalog-status active',
  Archived: 'catalog-status archived',
};

export default function AdminProductManagementPage({ onViewChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState('Products');
  const [formState, setFormState] = useState({
    name: '',
    category: 'Staples & Grains',
    unit: '5kg',
    price: '0.00',
  });
  const [items, setItems] = useState(catalogItems);
  const [editingIndex, setEditingIndex] = useState(null);
  const [notice, setNotice] = useState('');

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
    setEditingIndex(null);
    setFormState({ name: '', category: 'Staples & Grains', unit: '5kg', price: '0.00' });
  };

  const saveCatalogItem = () => {
    if (!formState.name.trim()) {
      setNotice('Please provide an official product name.');
      return;
    }

    const normalizedProduct = {
      name: formState.name.trim(),
      category: formState.category,
      unit: formState.unit.trim(),
      price: `$${Number(formState.price || 0).toFixed(2)}`,
      status: 'Active',
    };

    if (editingIndex !== null) {
      setItems((current) =>
        current.map((item, index) => (index === editingIndex ? { ...normalizedProduct } : item))
      );
      setNotice('Official product updated in the shared catalog.');
    } else {
      setItems((current) => [normalizedProduct, ...current]);
      setNotice('Official product added to the shared catalog.');
    }

    resetForm();
  };

  const startEditingProduct = (item, index) => {
    setEditingIndex(index);
    setFormState({
      name: item.name,
      category: item.category,
      unit: item.unit,
      price: item.price.replace('$', ''),
    });
    setNotice(`Editing ${item.name}. Update the product and save again.`);
  };

  const deleteCatalogItem = (productName) => {
    setItems((current) => current.filter((item) => item.name !== productName));
    setNotice('Official product removed from the catalog.');
    if (editingIndex !== null) resetForm();
  };

  const toggleCatalogStatus = (productName) => {
    setItems((current) =>
      current.map((item) =>
        item.name === productName
          ? { ...item, status: item.status === 'Active' ? 'Archived' : 'Active' }
          : item
      )
    );
    setNotice('Official product status updated.');
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
              onClick={() => {
                setActiveItem(item.label);
                if (item.label === 'Products') onViewChange?.('admin-product');
                if (item.label === 'Approvals') onViewChange?.('admin-approval');
                if (item.label === 'Vendors') onViewChange?.('admin-vendor');
                if (item.label === 'Overview' || item.label === 'Settings') onViewChange?.('admin-reporting');
              }}
            >
              <span className="admin-product-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="admin-product-add-btn">
          + New Catalog Item
        </button>
      </aside>

      <section className="admin-product-content">
        <div className="admin-product-header-row">
          <div>
            <h1>Official Product Management</h1>
            <p>Create, update, and maintain the shared product catalog every approved shop uses.</p>
          </div>

          <div className="admin-product-searchbox">
            <span>⌕</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search catalog"
            />
          </div>
        </div>

        <div className="admin-product-grid">
          <div className="admin-product-card">
            <div className="admin-product-card-title">Create Product</div>

            <label className="admin-product-field">
              <span>Product Name</span>
              <input value={formState.name} onChange={updateForm('name')} placeholder="e.g. Premium Basmati Rice" />
            </label>

            <label className="admin-product-field">
              <span>Category</span>
              <select value={formState.category} onChange={updateForm('category')}>
                <option>Staples & Grains</option>
                <option>Dairy & Eggs</option>
                <option>Pantry</option>
                <option>Electronics</option>
              </select>
            </label>

            <label className="admin-product-field">
              <span>Unit</span>
              <input value={formState.unit} onChange={updateForm('unit')} placeholder="e.g. 5kg" />
            </label>

            <label className="admin-product-field">
              <span>Base Price</span>
              <input value={formState.price} onChange={updateForm('price')} placeholder="0.00" />
            </label>

            <button type="button" className="admin-product-save-btn" onClick={saveCatalogItem}>
              {editingIndex !== null ? 'Update Product' : 'Save Product'}
            </button>

            {editingIndex !== null && (
              <button type="button" className="admin-product-clear-btn" onClick={resetForm}>
                Cancel Edit
              </button>
            )}

            {notice && <div className="admin-product-notice">{notice}</div>}
          </div>

          <div className="admin-product-card admin-product-table-card">
            <div className="admin-product-card-title">Catalog Overview</div>

            <div className="admin-product-table-head">
              <span>Product</span>
              <span>Category</span>
              <span>Unit</span>
              <span>Price</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {filteredItems.map((item, index) => (
              <div key={`${item.name}-${index}`} className="admin-product-row">
                <div className="admin-product-name-cell">{item.name}</div>
                <div>{item.category}</div>
                <div>{item.unit}</div>
                <div className="admin-product-price-cell">{item.price}</div>
                <div>
                  <span className={statusClassName[item.status]}>{item.status}</span>
                </div>
                <div className="admin-product-actions">
                  <button type="button" className="admin-product-action-btn edit" onClick={() => startEditingProduct(item, index)}>
                    Edit
                  </button>
                  <button type="button" className="admin-product-action-btn archive" onClick={() => toggleCatalogStatus(item.name)}>
                    {item.status === 'Active' ? 'Archive' : 'Restore'}
                  </button>
                  <button type="button" className="admin-product-action-btn delete" onClick={() => deleteCatalogItem(item.name)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
