import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersAPI, paymentsAPI } from '../services/api';
import './CheckoutPage.css';

const loadRazorpay = () =>
  new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [addr, setAddr] = useState({
    full_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
    email: user?.email || '',
    phone: user?.phone || '',
    address_line1: '', address_line2: '',
    city: '', state: '', pincode: '',
    notes: '',
  });

  const set = (k) => (e) => setAddr(p => ({ ...p, [k]: e.target.value }));

  const shipping = cartTotal >= 999 ? 0 : 99;
  const grandTotal = cartTotal + shipping;

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // 1. Load Razorpay script first
      const loaded = await loadRazorpay();
      if (!loaded) {
        error('Payment gateway failed to load');
        setLoading(false);
        return;
      }

      // 2. Create a Razorpay order (just a payment intent, NOT a DB order yet)
      const rpOrder = await paymentsAPI.createRazorpayOrder({
        amount: grandTotal,
        currency: 'INR',
      });

      // 3. Open Razorpay
      const options = {
        key: rpOrder.key,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        order_id: rpOrder.razorpay_order_id,
        name: 'Nayra Fashions',
        description: 'Order Payment',
        prefill: {
          name: addr.full_name,
          email: addr.email,
          contact: addr.phone,
        },
        theme: { color: '#7B1B1B' },
        method: {
          upi: true, card: true, netbanking: true, wallet: true, paylater: false,
        },

        handler: async (response) => {
          try {
            // 4. Payment succeeded → NOW create the order in DB
            const orderData = {
              ...addr,
              subtotal: cartTotal,
              shipping_charge: shipping,
              total: grandTotal,
              razorpay_order_id: response.razorpay_order_id,
              items: cart.map(item => ({
                product_id: item.product.id,
                product_name: item.product.name,
                product_price: item.product.price,
                quantity: item.quantity,
                size: item.variant?.size || '',
                color: item.variant?.color || '',
              })),
            };

            const order = await ordersAPI.createOrder(orderData);

            // 5. Verify payment signature
            await paymentsAPI.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            clearCart();
            success('Payment successful!');
            navigate(`/order-success/${order.id}`);
          } catch {
            error(
              'Payment done but order saving failed. Contact support with payment ID: ' +
              response.razorpay_payment_id
            );
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => { setLoading(false); },
        },
      };

      const rp = new window.Razorpay(options);
      rp.open();

    } catch (err) {
      error(err.message || 'Could not initiate payment');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="page-wrapper checkout-page">
      <div className="breadcrumb">
        <a href="/">Home</a> / <a href="/cart">Cart</a> / <span>Checkout</span>
      </div>

      <div className="checkout-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}><span>1</span> Shipping</div>
        <div className="step-line" />
        <div className={`step ${step >= 2 ? 'active' : ''}`}><span>2</span> Review & Pay</div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {step === 1 && (
            <div className="checkout-form-section">
              <h2 className="section-heading">Shipping Details</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={addr.full_name}
                    onChange={set('full_name')}
                    placeholder="Priya Sharma"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    required
                    value={addr.phone}
                    onChange={set('phone')}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={addr.email}
                  onChange={set('email')}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label>Address Line 1</label>
                <input
                  type="text"
                  required
                  value={addr.address_line1}
                  onChange={set('address_line1')}
                  placeholder="House no., Street name"
                />
              </div>

              <div className="form-group">
                <label>
                  Address Line 2{' '}
                  <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={addr.address_line2}
                  onChange={set('address_line2')}
                  placeholder="Apartment, Area, Landmark"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    required
                    value={addr.city}
                    onChange={set('city')}
                    placeholder="Chennai"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    required
                    value={addr.state}
                    onChange={set('state')}
                    placeholder="Tamil Nadu"
                  />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    required
                    value={addr.pincode}
                    onChange={set('pincode')}
                    placeholder="600001"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Order Notes{' '}
                  <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  rows="2"
                  value={addr.notes}
                  onChange={set('notes')}
                  placeholder="Special instructions for delivery..."
                />
              </div>

              <button
                className="btn-gold checkout-next-btn"
                onClick={() => {
                  if (
                    !addr.full_name ||
                    !addr.phone ||
                    !addr.email ||
                    !addr.address_line1 ||
                    !addr.city ||
                    !addr.state ||
                    !addr.pincode
                  ) {
                    error('Please fill all required fields');
                    return;
                  }
                  setStep(2);
                }}
              >
                CONTINUE TO REVIEW →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-review-section">
              <div className="review-address">
                <div className="review-address-header">
                  <h2 className="section-heading">Shipping To</h2>
                  <button className="btn-outline edit-btn" onClick={() => setStep(1)}>EDIT</button>
                </div>
                <p className="addr-name">{addr.full_name}</p>
                <p>{addr.address_line1}{addr.address_line2 && ', ' + addr.address_line2}</p>
                <p>{addr.city}, {addr.state} — {addr.pincode}</p>
                <p>{addr.phone} · {addr.email}</p>
              </div>

              <h2 className="section-heading" style={{ marginTop: 32 }}>Order Items</h2>
              <div className="review-items">
                {cart.map(item => (
                  <div key={item.key} className="review-item">
                    <img
                      src={
                        item.product.primary_image ||
                        'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=100&q=80'
                      }
                      alt={item.product.name}
                    />
                    <div className="review-item-info">
                      <p className="review-item-name">{item.product.name}</p>
                      {item.variant && (
                        <p className="review-item-variant">
                          {item.variant.size && `Size: ${item.variant.size}`}
                          {item.variant.color && ` · Color: ${item.variant.color}`}
                        </p>
                      )}
                      <p className="review-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="review-item-price">
                      ₹{(Number(item.product.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <button
                className="btn-gold pay-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? 'PROCESSING...' : `PAY ₹${grandTotal.toLocaleString()}`}
              </button>
              <p className="pay-note">
                You'll be redirected to Razorpay's secure payment gateway
              </p>
            </div>
          )}
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="co-summary-items">
            {cart.map(item => (
              <div key={item.key} className="co-summary-item">
                <span>{item.product.name} × {item.quantity}</span>
                <span>₹{(Number(item.product.price) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="co-summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
          <div className="co-summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
          </div>
          <div className="co-summary-total">
            <span>Total</span>
            <span>₹{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;