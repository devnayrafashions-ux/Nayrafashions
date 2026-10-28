
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Truck, ExternalLink } from 'lucide-react';
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

const ACTIONABLE_STATUSES = ['pending', 'confirmed', 'processing'];

const emptyTrackingForm = {
  courier_name: '',
  tracking_number: '',
  tracking_url: '',
};

const getAgeInfo = (dateStr, status) => {
  const created = new Date(dateStr);
  const now = new Date();
  const days = Math.floor(
    (now - created) / (1000 * 60 * 60 * 24)
  );

  let label;
  if (days <= 0) label = 'Today';
  else if (days === 1) label = '1 day ago';
  else label = `${days} days ago`;

  let color = '#6B7280';

  if (ACTIONABLE_STATUSES.includes(status)) {
    if (days >= 5) color = '#B91C1C';
    else if (days >= 2) color = '#C2660A';
  }

  return { label, color };
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [trackingForm, setTrackingForm] = useState(emptyTrackingForm);
  const [savingShipment, setSavingShipment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { success, error } = useToast();

  const fetchOrders = useCallback(() => {
    setLoading(true);

    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;

    ordersAPI.getAll(params)
      .then(data => {
        setOrders(
          Array.isArray(data) ? data : data.results || []
        );
      })
      .catch(() => {
        setOrders([]);
        error('Failed to load orders');
      })
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Open the order details popup and populate existing shipping details.
  const openOrderDetails = async (orderId) => {
    try {
      const full = await ordersAPI.getOrderAdmin(orderId);

      setSelectedOrder(full);

      setTrackingForm({
        courier_name: full.courier_name || '',
        tracking_number: full.tracking_number || '',
        tracking_url: full.tracking_url || '',
      });
    } catch {
      error('Failed to load order details');
    }
  };

  const handleTrackingChange = (e) => {
    const { name, value } = e.target;

    setTrackingForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update normal order statuses.
  // Shipping must go through the Save & Ship Order button.
  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'shipped') {
      error('Enter the courier and tracking details, then click Save & Ship Order.');
      return;
    }

    try {
      setUpdatingStatus(true);

      const updated = await ordersAPI.updateStatus(
        orderId,
        newStatus
      );

      success('Order status updated!');

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, ...updated, status: newStatus }
            : order
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({
          ...prev,
          ...updated,
          status: newStatus,
        }));
      }
    } catch {
      error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Save courier details, mark the order as shipped,
  // and let the Django backend send the shipment email.
  const handleSaveAndShip = async (e) => {
    e.preventDefault();

    if (!selectedOrder) return;

    const courierName = trackingForm.courier_name.trim();
    const trackingNumber = trackingForm.tracking_number.trim();
    const trackingUrl = trackingForm.tracking_url.trim();

    if (!courierName) {
      error('Please enter the courier name.');
      return;
    }

    if (!trackingNumber) {
      error('Please enter the tracking ID / AWB number.');
      return;
    }

    if (!trackingUrl) {
      error('Please enter the courier tracking URL.');
      return;
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(trackingUrl);

      if (parsedUrl.protocol !== 'https:') {
        error('Please enter a valid HTTPS tracking URL.');
        return;
      }
    } catch {
      error('Please enter a valid tracking URL.');
      return;
    }

    try {
      setSavingShipment(true);

      const updated = await ordersAPI.updateStatus(
        selectedOrder.id,
        'shipped',
        {
          courier_name: courierName,
          tracking_number: trackingNumber,
          tracking_url: parsedUrl.href,
        }
      );

      setSelectedOrder(prev => ({
        ...prev,
        ...updated,
      }));

      setTrackingForm({
        courier_name: updated.courier_name || courierName,
        tracking_number: updated.tracking_number || trackingNumber,
        tracking_url: updated.tracking_url || parsedUrl.href,
      });

      setOrders(prev =>
        prev.map(order =>
          order.id === selectedOrder.id
            ? { ...order, ...updated, status: 'shipped' }
            : order
        )
      );

      success(
        'Order marked as shipped. Shipment email request submitted.'
      );

      fetchOrders();
    } catch (err) {
      error(
        err?.message ||
        'Failed to ship the order. Please check the details and try again.'
      );
    } finally {
      setSavingShipment(false);
    }
  };

  const closeOrderDetails = () => {
    if (savingShipment) return;

    setSelectedOrder(null);
    setTrackingForm(emptyTrackingForm);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p>{orders.length} orders</p>
        </div>
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

            {Object.keys(statusColor).map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="admin-loading">Loading...</p>
        ) : orders.length === 0 ? (
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
                const {
                  label: ageLabel,
                  color: ageColor,
                } = getAgeInfo(order.created_at, order.status);

                return (
                  <tr key={order.id}>
                    <td>#{order.id}</td>

                    <td>
                      {order.customer_name || order.full_name || '—'}
                    </td>

                    <td>{order.city || '—'}</td>

                    <td>
                      {new Date(order.created_at).toLocaleDateString('en-IN')}

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

                    <td>
                      ₹{Number(order.total || 0).toLocaleString('en-IN')}
                    </td>

                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        style={{ color: statusColor[order.status] }}
                        disabled={updatingStatus}
                        onChange={e =>
                          handleStatusChange(order.id, e.target.value)
                        }
                      >
                        {Object.keys(statusColor).map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="action-btn edit"
                        title="View order details"
                        onClick={() => openOrderDetails(order.id)}
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="admin-modal-overlay"
          onClick={closeOrderDetails}
        >
          <div
            className="admin-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2>Order #{selectedOrder.id}</h2>

              <button
                type="button"
                onClick={closeOrderDetails}
                disabled={savingShipment}
                aria-label="Close order details"
              >
                ✕
              </button>
            </div>

            <div className="order-detail">
              <div className="order-detail-row">
                <span>Order No</span>
                <strong>{selectedOrder.order_number}</strong>
              </div>

              <div className="order-detail-row">
                <span>Customer</span>
                <strong>
                  {selectedOrder.customer_name ||
                    selectedOrder.full_name ||
                    '—'}
                </strong>
              </div>

              <div className="order-detail-row">
                <span>Email</span>
                <strong>
                  {selectedOrder.email ||
                    selectedOrder.customer_email ||
                    '—'}
                </strong>
              </div>

              <div className="order-detail-row">
                <span>Phone</span>
                <strong>{selectedOrder.phone || '—'}</strong>
              </div>

              <div className="order-detail-row">
                <span>Address</span>
                <strong>
                  {selectedOrder.address_line1}
                  {selectedOrder.address_line2
                    ? `, ${selectedOrder.address_line2}`
                    : ''}
                  {`, ${selectedOrder.city}, ${selectedOrder.state} — ${selectedOrder.pincode}`}
                </strong>
              </div>

              <div className="order-detail-row">
                <span>Date</span>
                <strong>
                  {new Date(selectedOrder.created_at).toLocaleDateString('en-IN')}
                </strong>
              </div>

              <div className="order-detail-row">
                <span>Subtotal</span>
                <strong>
                  ₹{Number(selectedOrder.subtotal || 0).toLocaleString('en-IN')}
                </strong>
              </div>

              <div className="order-detail-row">
                <span>Shipping</span>
                <strong>
                  {Number(selectedOrder.shipping_charge) === 0
                    ? 'FREE'
                    : `₹${Number(selectedOrder.shipping_charge).toLocaleString('en-IN')}`}
                </strong>
              </div>

              <div className="order-detail-row">
                <span>Total</span>
                <strong>
                  ₹{Number(selectedOrder.total || 0).toLocaleString('en-IN')}
                </strong>
              </div>

              <div className="order-detail-row">
                <span>Status</span>

                <strong
                  style={{
                    color: statusColor[selectedOrder.status],
                    textTransform: 'capitalize',
                  }}
                >
                  {selectedOrder.status}
                </strong>
              </div>

              {/* Shipping and Tracking Form */}
              <div
                style={{
                  marginTop: '24px',
                  padding: '20px',
                  background: '#FBF6EF',
                  border: '1px solid #E8D9C5',
                  borderRadius: '10px',
                }}
              >
                <h3
                  style={{
                    color: '#7B1B1B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: 0,
                    marginBottom: '8px',
                  }}
                >
                  <Truck size={20} />
                  Shipping & Tracking
                </h3>

                <p
                  style={{
                    fontSize: '13px',
                    color: '#6B6259',
                    marginBottom: '18px',
                  }}
                >
                  Enter the courier details after dispatching the order.
                  Saving will mark the order as shipped and request the
                  shipment email from the backend.
                </p>

                <form onSubmit={handleSaveAndShip}>
                  <div style={{ marginBottom: '15px' }}>
                    <label
                      htmlFor="courier_name"
                      style={formLabelStyle}
                    >
                      Courier Partner *
                    </label>

                    <input
                      id="courier_name"
                      name="courier_name"
                      type="text"
                      placeholder="e.g. Blue Dart, Delhivery, DTDC"
                      value={trackingForm.courier_name}
                      onChange={handleTrackingChange}
                      required
                      disabled={savingShipment}
                      style={formInputStyle}
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label
                      htmlFor="tracking_number"
                      style={formLabelStyle}
                    >
                      Tracking ID / AWB Number *
                    </label>

                    <input
                      id="tracking_number"
                      name="tracking_number"
                      type="text"
                      placeholder="Enter tracking ID"
                      value={trackingForm.tracking_number}
                      onChange={handleTrackingChange}
                      required
                      disabled={savingShipment}
                      style={formInputStyle}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label
                      htmlFor="tracking_url"
                      style={formLabelStyle}
                    >
                      Courier Tracking URL *
                    </label>

                    <input
                      id="tracking_url"
                      name="tracking_url"
                      type="url"
                      placeholder="https://courier-website.com/track"
                      value={trackingForm.tracking_url}
                      onChange={handleTrackingChange}
                      required
                      disabled={savingShipment}
                      style={formInputStyle}
                    />
                  </div>

                  {trackingForm.tracking_url &&
                    trackingForm.tracking_url.startsWith('https://') && (
                      <a
                        href={trackingForm.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#7B1B1B',
                          fontSize: '13px',
                          marginBottom: '18px',
                        }}
                      >
                        <ExternalLink size={14} />
                        Preview tracking page
                      </a>
                    )}

                  <button
                    type="submit"
                    disabled={savingShipment}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      background: savingShipment ? '#A88B8B' : '#7B1B1B',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '13px',
                      letterSpacing: '0.5px',
                      cursor: savingShipment ? 'wait' : 'pointer',
                    }}
                  >
                    {savingShipment
                      ? 'SAVING SHIPPING DETAILS...'
                      : selectedOrder.status === 'shipped'
                        ? 'UPDATE SHIPPING DETAILS'
                        : 'SAVE & SHIP ORDER'}
                  </button>
                </form>

                {selectedOrder.status === 'shipped' && (
                  <p
                    style={{
                      marginTop: '12px',
                      marginBottom: 0,
                      color: '#2C5F2E',
                      fontSize: '12px',
                    }}
                  >
                    This order is already marked as shipped. Updating
                    tracking details will not automatically resend the
                    shipment email unless your backend explicitly supports it.
                  </p>
                )}
              </div>

              {/* Order Items */}
              {(selectedOrder.items || selectedOrder.order_items || []).length > 0 && (
                <>
                  <h4 style={{ marginTop: 20, marginBottom: 8 }}>
                    Items
                  </h4>

                  {(selectedOrder.items || selectedOrder.order_items || []).map(
                    (item, index) => (
                      <div
                        key={item.id || index}
                        className="order-item-row"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        {item.primary_image ? (
                          <img
                            src={item.primary_image}
                            alt={item.product_name || 'Product'}
                            style={{
                              width: 48,
                              height: 48,
                              objectFit: 'cover',
                              borderRadius: 6,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 6,
                              flexShrink: 0,
                              background: '#F1EDE6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 10,
                              color: '#9C9587',
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

                        <span>
                          ₹{Number(item.product_price || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )
                  )}
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

const formLabelStyle = {
  display: 'block',
  marginBottom: '7px',
  color: '#3D302B',
  fontSize: '13px',
  fontWeight: 600,
};

const formInputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 12px',
  border: '1px solid #D8C9B7',
  borderRadius: '6px',
  background: '#FFFFFF',
  color: '#2B2420',
  fontSize: '14px',
  outlineColor: '#7B1B1B',
};

export default AdminOrders;
