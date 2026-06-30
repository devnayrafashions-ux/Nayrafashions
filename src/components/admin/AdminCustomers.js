import React, { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { adminAPI } from '../../services/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    adminAPI.getCustomers({ search })
      .then(d => setCustomers(Array.isArray(d) ? d : d.results || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>Customers</h1><p>{customers.length} registered users</p></div>
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={15} />
            <input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? <p className="admin-loading">Loading...</p> : customers.length === 0 ? (
          <p className="admin-empty">No customers found</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Customer</th><th>Email</th><th>Phone</th><th>Joined</th><th>Orders</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar">{c.first_name?.[0] || c.email[0].toUpperCase()}</div>
                      <span>{c.first_name} {c.last_name}</span>
                    </div>
                  </td>
                  <td>{c.email}</td>
                  <td>{c.phone || '-'}</td>
                  <td>{new Date(c.date_joined).toLocaleDateString('en-IN')}</td>
                  <td>{c.order_count || 0}</td>
                  <td>
                    <button className="action-btn edit" onClick={() => setSelected(c)}><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Customer Details</h2>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="order-detail">
              <div className="order-detail-row"><span>Name</span><strong>{selected.first_name} {selected.last_name}</strong></div>
              <div className="order-detail-row"><span>Email</span><strong>{selected.email}</strong></div>
              <div className="order-detail-row"><span>Phone</span><strong>{selected.phone || '-'}</strong></div>
              <div className="order-detail-row"><span>City</span><strong>{selected.city || '-'}</strong></div>
              <div className="order-detail-row"><span>Joined</span><strong>{new Date(selected.date_joined).toLocaleDateString('en-IN')}</strong></div>
              <div className="order-detail-row"><span>Total Orders</span><strong>{selected.order_count || 0}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;