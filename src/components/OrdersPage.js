import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, ShoppingBag, ArrowRight } from 'lucide-react';
import { ordersAPI } from '../services/api';
import './OrdersPage.css';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'status-pending' },
  confirmed:  { label: 'Confirmed',  color: 'status-confirmed' },
  processing: { label: 'Processing', color: 'status-processing' },
  shipped:    { label: 'Shipped',    color: 'status-shipped' },
  delivered:  { label: 'delivered',  color: 'status-delivered' },
  cancelled:  { label: 'Cancelled',  color: 'status-cancelled' },
};

const STEPS = ['confirmed', 'processing', 'shipped', 'delivered'];

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const status = order.status?.toLowerCase() || 'pending';
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'status-pending' };
  const isCancelled = status === 'cancelled';
  const currentStep = STEPS.indexOf(status);

  return (
    <div className={`order-card ${expanded ? 'expanded' : ''}`}>
      <div className="order-card-header" onClick={() => setExpanded(p => !p)}>
        <div className="order-header-left">
          <div className="order-icon-wrap">
            <Package size={18} strokeWidth={1.5} />
          </div>
          <div>
            <p className="order-id">Order #{order.id}</p>
            <p className="order-date">
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="order-header-right">
          <span className={`order-status-badge ${cfg.color}`}>{cfg.label}</span>
          <p className="order-total">₹{Number(order.total_amount || order.total || 0).toLocaleString()}</p>
          <button className="expand-btn" aria-label={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="order-card-body">

          {/* Progress tracker — only for non-cancelled */}
          {!isCancelled && (
            <div className="order-tracker">
              {STEPS.map((step, i) => {
                const done = currentStep >= i;
                const active = currentStep === i;
                return (
                  <React.Fragment key={step}>
                    <div className={`tracker-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                      <div className="tracker-dot">
                        {done && <span className="tracker-check">✓</span>}
                      </div>
                      <span className="tracker-label">{STATUS_CONFIG[step]?.label || step}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`tracker-line ${currentStep > i ? 'done' : ''}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {isCancelled && (
            <div className="cancelled-notice">
              <span>This order was cancelled.</span>
            </div>
          )}

          {/* Items */}
          <div className="order-items">
            {(order.items || order.order_items || []).map((item, idx) => (
              <div key={idx} className="order-item-row">
                <div className="order-item-img">
                  {/* FIX: OrderItemSerializer returns the image as a flat
                      `primary_image` field on the item itself (not nested
                      under `product`) — check that first. */}
                  {item.primary_image || item.product_image || item.product?.primary_image ? (
                    <img
                      src={item.primary_image || item.product_image || item.product?.primary_image}
                      alt={item.product_name || item.product?.name}
                    />
                  ) : (
                    <div className="order-item-img-placeholder">
                      <Package size={20} strokeWidth={1} />
                    </div>
                  )}
                </div>
                <div className="order-item-info">
                  <p className="order-item-name">{item.product_name || item.product?.name}</p>
                  {/* Only ever renders for dresses — size/selected_size are
                      empty strings for jewelry & hair accessories, since
                      checkout now sends size: '' for those item types */}
                  {(item.size || item.selected_size) && (
                    <p className="order-item-meta">Size: {item.size || item.selected_size}</p>
                  )}
                  {item.color && (
                    <p className="order-item-meta">Color: {item.color}</p>
                  )}
                  <p className="order-item-meta">Qty: {item.quantity}</p>
                </div>
                <p className="order-item-price">
                  ₹{Number((item.product_price || item.price || 0) * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="order-card-footer">
            <div className="order-address">
              {order.shipping_address && (
                <>
                  <p className="footer-label">Delivered to</p>
                  <p className="footer-value">
                    {order.shipping_address.full_name || order.shipping_address.name},&nbsp;
                    {order.shipping_address.address_line1 || order.shipping_address.line1},&nbsp;
                    {order.shipping_address.city} — {order.shipping_address.pincode || order.shipping_address.zip}
                  </p>
                </>
              )}
              {!order.shipping_address && order.full_name && (
                <>
                  <p className="footer-label">Delivered to</p>
                  <p className="footer-value">
                    {order.full_name}, {order.address_line1}
                    {order.address_line2 ? `, ${order.address_line2}` : ''},&nbsp;
                    {order.city} — {order.pincode}
                  </p>
                </>
              )}
            </div>
            <div className="order-totals">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal || order.total_amount || 0).toLocaleString()}</span>
              </div>
              <div className="totals-row">
                <span>Shipping</span>
                <span className={Number(order.shipping_charge) === 0 ? 'free-tag' : ''}>
                  {Number(order.shipping_charge) === 0
                    ? 'FREE'
                    : `₹${Number(order.shipping_charge || 0).toLocaleString()}`}
                </span>
              </div>
              <div className="totals-row grand">
                <span>Total</span>
                <span>₹{Number(order.total_amount || order.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    ordersAPI.getMyOrders()
      .then(data => {
        setOrders(Array.isArray(data) ? data : data?.results || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="page-wrapper orders-page">
      <div className="orders-loading">
        {[1, 2, 3].map(i => <div key={i} className="order-skeleton" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="page-wrapper orders-page">
      <div className="orders-error">
        <p>Could not load your orders. Please try again.</p>
        <button className="btn-gold" onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper orders-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <span>My Orders</span>
      </div>

      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        {orders.length > 0 && (
          <p className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <ShoppingBag size={48} strokeWidth={1} />
          <h3>No orders yet</h3>
          <p>When you place an order, it will appear here.</p>
          <Link to="/products">
            <button className="btn-gold">
              SHOP NOW <ArrowRight size={14} style={{ marginLeft: 6, verticalAlign: -2 }} />
            </button>
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;