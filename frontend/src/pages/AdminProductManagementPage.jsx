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

export default function AdminProductManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [formState, setFormState] = useState({
    name: '',
    category: 'Staples & Grains',
    unit: '5kg',
    price: '0.00',
  });
  const [items, setItems] = useState(catalogItems);
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

  const createCatalogItem = () => {
    if (!formState.name.trim()) {
      setNotice('Please provide an official product name.');
      return;
    }

    setItems((current) => [
      {
        name: formState.name,
        category: formState.category,
        unit: formState.unit,
        price: `$${Number(formState.price || 0).toFixed(2)}`,
        status: 'Active',
      },
      ...current,
    ]);

    setNotice('Official product added to the shared catalog.');
    setFormState({ name: '', category: 'Staples & Grains', unit: '5kg', price: '0.00' });
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
              className={`admin-product-nav-item ${item.active ? 'active' : ''}`}
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

            <button type="button" className="admin-product-save-btn" onClick={createCatalogItem}>
              Save Product
            </button>

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
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
