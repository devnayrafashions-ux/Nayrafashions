  import React, { useState, useEffect } from 'react';
  import { Plus, Edit2, Trash2 } from 'lucide-react';
  import { categoriesAPI } from '../../services/api';
  import { useToast } from '../../context/ToastContext';

  const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCat, setEditCat] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [imageFile, setImageFile] = useState(null);
    const { success, error } = useToast();

    const fetch = () => {
      setLoading(true);
      categoriesAPI.getAll()
        .then(d => setCategories(Array.isArray(d) ? d : d.results || []))
        .catch(() => setCategories([]))
        .finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []);

    const openAdd = () => { setForm({ name: '', description: '' }); setEditCat(null); setImageFile(null); setShowModal(true); };
    const openEdit = (c) => { setForm({ name: c.name, description: c.description || '' }); setEditCat(c); setImageFile(null); setShowModal(true); };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
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

    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div><h1>Categories</h1><p>{categories.length} categories</p></div>
          <button className="admin-btn-primary" onClick={openAdd}><Plus size={16} /> Add Category</button>
        </div>

        <div className="admin-card">
          {loading ? <p className="admin-loading">Loading...</p> : (
            <div className="categories-grid">
              {categories.map(cat => (
                <div key={cat.id} className="category-card">
                  <img src={cat.image || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&q=80'} alt={cat.name} />
                  <div className="category-card-info">
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
                  <label>Category Name *</label>
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Kurtas & Sets" />
                </div>
                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Category description..." />
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