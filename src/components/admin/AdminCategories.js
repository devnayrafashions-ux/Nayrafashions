import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { categoriesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const PRODUCT_TYPES = [
  { value: 'dress', label: 'Dress' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'hair_accessory', label: 'Hair Accessory' },
];

const typeBadgeColors = {
  dress: '#7B1B1B',
  jewelry: '#C8A96E',
  hair_accessory: '#2C5F2E',
};

const typeLabel = (value) =>
  PRODUCT_TYPES.find((t) => t.value === value)?.label || value;

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', product_type: 'dress' });
  const [imageFile, setImageFile] = useState(null);
  // Filter the grid itself by type, so the admin can look at
  // "just Jewelry categories" or "just Hair Accessory categories"
  const [typeFilter, setTypeFilter] = useState('all');
  const { success, error } = useToast();

  const fetch = () => {
    setLoading(true);
    categoriesAPI.getAll()
      .then(d => setCategories(Array.isArray(d) ? d : d.results || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => {
    setForm({ name: '', product_type: 'dress' });
    setEditCat(null);
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setForm({ name: c.name, product_type: c.product_type || 'dress' });
    setEditCat(c);
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('product_type', form.product_type);
    if (imageFile) fd.append('image', imageFile);
    try {
      if (editCat) { await categoriesAPI.update(editCat.id, fd); success('Category updated!'); }
      else { await categoriesAPI.create(fd); success('Category created!'); }
      setShowModal(false);
      fetch();
    } catch (err) { error(err.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await categoriesAPI.delete(id); success('Deleted'); fetch(); }
    catch { error('Failed to delete'); }
  };

  const visibleCategories = typeFilter === 'all'
    ? categories
    : categories.filter(c => c.product_type === typeFilter);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>Categories</h1><p>{categories.length} categories</p></div>
        <button className="admin-btn-primary" onClick={openAdd}><Plus size={16} /> Add Category</button>
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
        {loading ? <p className="admin-loading">Loading...</p> : (
          <div className="categories-grid">
            {visibleCategories.map(cat => (
              <div key={cat.id} className="category-card">
                <img src={cat.image || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&q=80'} alt={cat.name} />
                <div className="category-card-info">
                  <span
                    className="category-type-badge"
                    style={{
                      background: typeBadgeColors[cat.product_type] || '#888',
                      color: '#fff',
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 4,
                      display: 'inline-block',
                      marginBottom: 4,
                    }}
                  >
                    {typeLabel(cat.product_type)}
                  </span>
                  <h3>{cat.name}</h3>
                  <p>{cat.product_count || 0} products</p>
                </div>
                <div className="category-card-actions">
                  <button className="action-btn edit" onClick={() => openEdit(cat)}><Edit2 size={14} /></button>
                  <button className="action-btn delete" onClick={() => handleDelete(cat.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Product Type *</label>
                <select
                  required
                  value={form.product_type}
                  onChange={e => setForm(p => ({ ...p, product_type: e.target.value }))}
                >
                  {PRODUCT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Category Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Kurtas & Sets, Necklaces, Hair Clips"
                />
              </div>
              <div className="admin-form-group">
                <label>Category Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">{editCat ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;