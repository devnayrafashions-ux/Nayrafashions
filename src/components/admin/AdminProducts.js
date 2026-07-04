import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { adminAPI, categoriesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const PRODUCT_TYPES = [
  { value: 'dress', label: 'Dress' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'hair_accessory', label: 'Hair Accessory' },
];

const typeLabel = (value) =>
  PRODUCT_TYPES.find((t) => t.value === value)?.label || value || '-';

const emptyForm = {
  // NEW: drives which categories are selectable and whether sizes show.
  // Not sent to the backend directly — the backend derives product_type
  // from the chosen category, this is purely a frontend filter/UI switch.
  product_type: 'dress',
  name: '', description: '', price: '', original_price: '',
  category: '', badge: '', stock: '', is_active: true,
  sizes: [],
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [search, setSearch] = useState('');
  // Filter the product table itself by type
  const [typeFilter, setTypeFilter] = useState('all');
  const { success, error } = useToast();

  const fetchProducts = useCallback(() => {
    setLoading(true);
    adminAPI.getProducts({ search, page_size: 50 })
      .then(d => setProducts(Array.isArray(d) ? d : d.results || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    categoriesAPI.getAll()
      .then(d => setCategories(Array.isArray(d) ? d : d.results || []))
      .catch(() => {});
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditProduct(null);
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    const catId = p.category?.id || p.category || '';
    const matchedCat = categories.find(c => String(c.id) === String(catId));
    const inferredType = p.product_type || matchedCat?.product_type || 'dress';
    setForm({
      product_type: inferredType,
      name: p.name,
      description: p.description || '',
      price: p.price,
      original_price: p.original_price || '',
      category: catId,
      badge: p.badge || '',
      stock: p.stock || '',
      is_active: p.is_active,
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
    });
    setEditProduct(p);
    setImageFile(null);
    setShowModal(true);
  };

  // When the admin switches product type, the previously selected category
  // almost certainly belongs to the wrong type now — clear it so they can't
  // accidentally save a Jewelry product under a Dress category.
  const changeProductType = (nextType) => {
    setForm(prev => ({
      ...prev,
      product_type: nextType,
      category: '',
      sizes: nextType === 'dress' ? prev.sizes : [],
    }));
  };

  const toggleSize = (size) => {
    setForm(prev => {
      const current = prev.sizes || [];
      const updated = current.includes(size)
        ? current.filter(s => s !== size)
        : [...current, size];
      return { ...prev, sizes: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    Object.entries(form).forEach(([k, v]) => {
      if (k === 'sizes' || k === 'product_type') return; // handled separately / not a backend field
      if (k === 'is_active') { fd.append(k, v ? 'true' : 'false'); return; }
      if (v !== '') fd.append(k, v);
    });

    // Sizes only make sense for dresses — always send an empty list otherwise,
    // even if stale values are lingering in local state.
    const sizesToSend = form.product_type === 'dress' ? form.sizes : [];
    fd.append('sizes', JSON.stringify(sizesToSend));

    if (imageFile) fd.append('image', imageFile);

    try {
      if (editProduct) {
        await adminAPI.updateProduct(editProduct.id, fd);
      } else {
        await adminAPI.createProduct(fd);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      error(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await adminAPI.deleteProduct(id);
      success('Product deleted');
      fetchProducts();
    } catch {
      error('Failed to delete');
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleProduct(id);
      fetchProducts();
    } catch {
      error('Failed to toggle');
    }
  };

  const categoriesForType = categories.filter(c => c.product_type === form.product_type);

  const visibleProducts = typeFilter === 'all'
    ? products
    : products.filter(p => p.product_type === typeFilter);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Products</h1>
          <p>{products.length} total products</p>
        </div>
        <button className="admin-btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="admin-tabs" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ value: 'all', label: 'All' }, ...PRODUCT_TYPES].map(t => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={typeFilter === t.value ? 'admin-btn-primary' : 'admin-btn-secondary'}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={15} />
            <input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? <p className="admin-loading">Loading...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sizes</th>
                <th>Badge</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="product-cell">
                      <img
                        src={p.primary_image || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=60&q=80'}
                        alt={p.name}
                      />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td>{typeLabel(p.product_type)}</td>
                  <td>{p.category_name || '-'}</td>
                  <td>₹{Number(p.price).toLocaleString()}</td>
                  <td>{p.stock || '-'}</td>
                  <td>
                    {p.product_type === 'dress' && Array.isArray(p.sizes) && p.sizes.length > 0
                      ? p.sizes.join(', ')
                      : '-'}
                  </td>
                  <td>{p.badge ? <span className="admin-badge">{p.badge}</span> : '-'}</td>
                  <td>
                    <button className="toggle-btn" onClick={() => handleToggle(p.id)}>
                      {p.is_active
                        ? <ToggleRight size={22} color="#2C5F2E" />
                        : <ToggleLeft size={22} color="#999" />}
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn edit" onClick={() => openEdit(p)}><Edit2 size={14} /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="admin-form" onSubmit={handleSubmit}>

              <div className="admin-form-group">
                <label>Product Type *</label>
                <select
                  required
                  value={form.product_type}
                  onChange={e => changeProductType(e.target.value)}
                >
                  {PRODUCT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
                <div className="admin-form-group">
                  <label>Product Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Silk Kurta Set"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  >
                    <option value="">Select category</option>
                    {categoriesForType.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {categoriesForType.length === 0 && (
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      No {typeLabel(form.product_type)} categories yet — add one under Categories first.
                    </p>
                  )}
                </div>
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Product description..."
                />
              </div>

              <div className="form-row-2">
                <div className="admin-form-group">
                  <label>Price (₹) *</label>
                  <input
                    required
                    type="number"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="2499"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Original Price (₹)</label>
                  <input
                    type="number"
                    value={form.original_price}
                    onChange={e => setForm(p => ({ ...p, original_price: e.target.value }))}
                    placeholder="3499"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="admin-form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                    placeholder="100"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Badge</label>
                  <select
                    value={form.badge}
                    onChange={e => setForm(p => ({ ...p, badge: e.target.value }))}
                  >
                    <option value="">None</option>
                    <option value="new">New</option>
                    <option value="bestseller">Bestseller</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>
              </div>

              {/* Sizes only apply to dresses — hidden entirely for
                  jewelry / hair accessories rather than shown-but-irrelevant */}
              {form.product_type === 'dress' && (
                <div className="admin-form-group">
                  <label>Available Sizes</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {ALL_SIZES.map(size => {
                      const selected = (form.sizes || []).includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '4px',
                            border: `1.5px solid ${selected ? '#7B1B1B' : '#ccc'}`,
                            background: selected ? '#7B1B1B' : '#fff',
                            color: selected ? '#fff' : '#444',
                            fontWeight: selected ? '600' : '400',
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  {form.sizes.length === 0 && (
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      No sizes selected — all sizes available by default
                    </p>
                  )}
                </div>
              )}

              <div className="admin-form-group">
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                />
              </div>

              <div className="admin-form-check">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                />
                <label htmlFor="is_active">Active (visible on store)</label>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;