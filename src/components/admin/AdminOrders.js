import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const statusColor = {
  pending: '#C8A96E',
  processing: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#2C5F2E',
  cancelled: '#7B1B1B',
  confirmed: '#16A34A',
  refunded: '#6B7280',
};

// NEW: statuses that still need admin action — used to decide whether
// the age badge should carry a warning color (see getAgeInfo below).
const ACTIONABLE_STATUSES = ['pending', 'confirmed', 'processing'];

// NEW: returns { label, color } for the "time since order" badge.
// - Non-actionable orders (shipped/delivered/cancelled/refunded) always
//   get a neutral gray badge, since there's nothing left to act on.
// - Actionable orders escalate in color the longer they sit untouched:
//   gray (< 2 days) → orange (2-4 days) → red (5+ days).
const getAgeInfo = (dateStr, status) => {
  const created = new Date(dateStr);
  const now = new Date();
  const diffMs = now - created;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let label;
  if (days <= 0) label = 'Today';
  else if (days === 1) label = '1 day ago';
  else label = `${days} days ago`;

  let color = '#6B7280'; // neutral gray default
  if (ACTIONABLE_STATUSES.includes(status)) {
    if (days >= 5) color = '#B91C1C';       // red — needs urgent attention
    else if (days >= 2) color = '#C2660A';  // orange — getting stale
  }

  return { label, color };
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { success, error } = useToast();

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    ordersAPI.getAll(params)
      .then(d => setOrders(Array.isArray(d) ? d : d.results || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      success('Order status updated!');
      fetchOrders();
      if (selectedOrder?.id === orderId)
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    } catch { error('Failed to update status'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>Orders</h1><p>{orders.length} orders</p></div>
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={15} />
            <input
              placeholder="Search orders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            {Object.keys(statusColor).map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {loading ? <p className="admin-loading">Loading...</p> : orders.length === 0 ? (
          <p className="admin-empty">No orders found</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>City</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                // NEW: compute the age badge once per row
                const { label: ageLabel, color: ageColor } = getAgeInfo(order.created_at, order.status);
                return (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  {/* ✅ fixed: was order.user_name */}
                  <td>{order.customer_name || order.full_name || '—'}</td>
                  {/* ✅ city now shown */}
                  <td>{order.city || '—'}</td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                    {/* NEW: age badge under the date */}
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: ageColor,
                        marginTop: '2px',
                      }}
                    >
                      {ageLabel}
                    </div>
                  </td>
                  {/* ✅ fixed: was order.total_amount */}
                  <td>₹{Number(order.total || 0).toLocaleString()}</td>
                  <td>
                    <select
                      className="status-select"
                      value={order.status}
                      style={{ color: statusColor[order.status] }}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                    >
                      {Object.keys(statusColor).map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td>

<button
  className="action-btn edit"
  onClick={async () => {
    try {
      // FIX: use the admin-scoped endpoint (/admin/orders/<id>/),
      // which is unfiltered by user. The previous ordersAPI.getOrder()
      // call hit the customer-facing /orders/<id>/ route, which is
      // filtered to request.user's own orders and 404s whenever the
      // logged-in admin views an order placed by a different customer.
      const full = await ordersAPI.getOrderAdmin(order.id);
      setSelectedOrder(full);
    } catch {
      error('Failed to load order details');
    }
  }}
>
  <Eye size={14} />
</button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Order #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="order-detail">
              <div className="order-detail-row">
                <span>Order No</span>
                <strong>{selectedOrder.order_number}</strong>
              </div>
              <div className="order-detail-row">
                <span>Customer</span>
                {/* ✅ fixed: was order.user_name */}
                <strong>{selectedOrder.customer_name || selectedOrder.full_name || '—'}</strong>
              </div>
              <div className="order-detail-row">
                <span>Email</span>
                <strong>{selectedOrder.customer_email || selectedOrder.email || '—'}</strong>
              </div>
              <div className="order-detail-row">
                <span>Phone</span>
                <strong>{selectedOrder.phone || '—'}</strong>
              </div>
              <div className="order-detail-row">
                <span>Address</span>
                <strong>
                  {selectedOrder.address_line1}
                  {selectedOrder.address_line2 ? `, ${selectedOrder.address_line2}` : ''}
                  {`, ${selectedOrder.city}, ${selectedOrder.state} — ${selectedOrder.pincode}`}
                </strong>
              </div>
              <div className="order-detail-row">
                <span>Date</span>
                <strong>{new Date(selectedOrder.created_at).toLocaleDateString('en-IN')}</strong>
              </div>
              <div className="order-detail-row">
                <span>Subtotal</span>
                <strong>₹{Number(selectedOrder.subtotal || 0).toLocaleString()}</strong>
              </div>
              <div className="order-detail-row">
                <span>Shipping</span>
                <strong>
                  {Number(selectedOrder.shipping_charge) === 0
                    ? 'FREE'
                    : `₹${Number(selectedOrder.shipping_charge).toLocaleString()}`}
                </strong>
              </div>
              <div className="order-detail-row">
                <span>Total</span>
                {/* ✅ fixed: was total_amount */}
                <strong>₹{Number(selectedOrder.total || 0).toLocaleString()}</strong>
              </div>
              <div className="order-detail-row">
                <span>Status</span>
                <select
                  value={selectedOrder.status}
                  onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                >
                  {Object.keys(statusColor).map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Order Items */}
              
{(selectedOrder.items || selectedOrder.order_items || []).length > 0 && (
  <>
    <h4 style={{ marginTop: 16, marginBottom: 8 }}>Items</h4>
    {(selectedOrder.items || selectedOrder.order_items || []).map((item, i) => (
      <div key={i} className="order-item-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* NEW: product image — falls back to a placeholder box if no image was saved */}
        {item.primary_image ? (
          <img
            src={item.primary_image}
            alt={item.product_name}
            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 48, height: 48, borderRadius: 6, flexShrink: 0,
              background: '#F1EDE6', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 10, color: '#9C9587',
            }}
          >
            No image
          </div>
        )}
        <div style={{ flex: 1 }}>
          <strong>{item.product_name}</strong>
          <div>Size: {item.size || 'N/A'}</div>
          <div>Qty: ×{item.quantity}</div>
        </div>
        <span>₹{Number(item.product_price || 0).toLocaleString()}</span>
      </div>
    ))}
  </>
)}

              {selectedOrder.notes && (
                <div className="order-detail-row">
                  <span>Notes</span>
                  <strong>{selectedOrder.notes}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;