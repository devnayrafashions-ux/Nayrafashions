
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { paymentsAPI } from '../services/api';
import './CheckoutPage.css';

const FREE_SHIPPING_THRESHOLD = 2999;
const SHIPPING_FEE = 99;

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
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
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });

  const set = (key) => (event) => {
    setAddr((previous) => ({
      ...previous,
      [key]: event.target.value,
    }));
  };

  // Display estimates only. The backend calculates the authoritative total.
  const shipping =
    Number(cartTotal) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  const grandTotal = Number(cartTotal) + shipping;

  const getCheckoutItems = () =>
    cart.map((item) => {
      const selectedSize =
        item.selectedSize ||
        item.product?.selectedSize ||
        item.variant?.size ||
        '';

      const variantId =
        item.variant?.id ||
        item.variant_id ||
        item.product?.selectedVariant?.id ||
        null;

      return {
        product_id: item.product.id,
        variant_id: variantId,
        quantity: Number(item.quantity),
        size: selectedSize,
        color: item.variant?.color || '',
      };
    });

  const validateAddress = () => {
    const requiredFields = [
      ['full_name', 'Full name'],
      ['email', 'Email'],
      ['phone', 'Phone'],
      ['address_line1', 'Address line 1'],
      ['city', 'City'],
      ['state', 'State'],
      ['pincode', 'Pincode'],
    ];

    for (const [key, label] of requiredFields) {
      if (!String(addr[key] || '').trim()) {
        error(`Please enter ${label}.`);
        return false;
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email.trim())) {
      error('Please enter a valid email address.');
      return false;
    }

    if (!/^\d{6}$/.test(addr.pincode.trim())) {
      error('Please enter a valid 6-digit pincode.');
      return false;
    }

    if (!/^\+?[\d\s()-]{10,15}$/.test(addr.phone.trim())) {
      error('Please enter a valid phone number.');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const loaded = await loadRazorpay();

      if (!loaded) {
        error('Payment gateway failed to load. Please try again.');
        return;
      }

      if (!cart.length) {
        error('Your cart is empty.');
        navigate('/cart');
        return;
      }

      const items = getCheckoutItems();

      if (
        items.some(
          (item) =>
            !item.product_id ||
            !Number.isInteger(item.quantity) ||
            item.quantity < 1
        )
      ) {
        error('Your cart contains an invalid item. Please review your cart.');
        return;
      }

      // The backend calculates prices, shipping and the final total.
      // It creates both the pending Order and its Payment record.
      const rpOrder = await paymentsAPI.createRazorpayOrder({
        ...addr,
        items,
      });

      if (!rpOrder?.razorpay_order_id || !rpOrder?.key) {
        throw new Error('Unable to initialize the payment. Please try again.');
      }

      const options = {
        key: rpOrder.key,
        amount: rpOrder.amount,
        currency: rpOrder.currency || 'INR',
        order_id: rpOrder.razorpay_order_id,
        name: 'Nayra Fashions',
        description: `Order ${rpOrder.order_number || ''}`,

        prefill: {
          name: addr.full_name,
          email: addr.email,
          contact: addr.phone,
        },

        theme: {
          color: '#7B1B1B',
        },

        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          paylater: false,
        },

        handler: async (response) => {
          try {
            // Verify the payment with the backend.
            const result = await paymentsAPI.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            // IMPORTANT:
            // HTTP 202 means payment is authorized but not confirmed.
            // Do not clear the cart or claim the order is confirmed.
            if (result?.status === 'authorized') {
              error(
                result.detail ||
                  'Your payment is being confirmed. Please check My Orders shortly.'
              );
              return;
            }

            // Only a verified, captured payment should reach this point.
            if (!result?.order_id) {
              throw new Error(
                'The server has not confirmed your order yet.'
              );
            }

            clearCart();

            success('Payment successful! Your order is confirmed.');

            // Use the route configured in App.js.
            navigate('/orders', { replace: true });
          } catch (verificationError) {
            console.error(
              'Payment verification/order confirmation failed:',
              verificationError
            );

            const serverMessage =
              verificationError?.response?.data?.error ||
              verificationError?.message;

            error(
              `${serverMessage || 'We could not confirm your order yet.'} Payment ID: ${response.razorpay_payment_id}`
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', (response) => {
        console.error('Razorpay payment failed:', response.error);

        error(
          response.error?.description ||
            'Payment failed. You can try again.'
        );

        setLoading(false);
      });

      razorpay.open();
    } catch (err) {
      console.error('Checkout initialization failed:', err);

      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Could not initiate payment. Please try again.';

      error(message);
      setLoading(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="page-wrapper checkout-page">
        <div className="checkout-form-section">
          <h2>Your cart is empty</h2>
          <p>Add some products before proceeding to checkout.</p>

          <button
            type="button"
            className="btn-gold checkout-next-btn"
            onClick={() => navigate('/cart')}
          >
            RETURN TO CART
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper checkout-page">
      <div className="breadcrumb">
        <a href="/">Home</a> / <a href="/cart">Cart</a> /{' '}
        <span>Checkout</span>
      </div>

      <div className="checkout-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <span>1</span> Shipping
        </div>

        <div className="step-line" />

        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <span>2</span> Review &amp; Pay
        </div>
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
                  <span
                    style={{
                      color: 'var(--text-light)',
                      fontWeight: 400,
                    }}
                  >
                    (optional)
                  </span>
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
                  <span
                    style={{
                      color: 'var(--text-light)',
                      fontWeight: 400,
                    }}
                  >
                    (optional)
                  </span>
                </label>

                <textarea
                  rows="2"
                  value={addr.notes}
                  onChange={set('notes')}
                  placeholder="Special instructions for delivery..."
                />
              </div>

              <button
                type="button"
                className="btn-gold checkout-next-btn"
                onClick={() => {
                  if (validateAddress()) {
                    setStep(2);
                  }
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

                  <button
                    type="button"
                    className="btn-outline edit-btn"
                    disabled={loading}
                    onClick={() => setStep(1)}
                  >
                    EDIT
                  </button>
                </div>

                <p className="addr-name">{addr.full_name}</p>

                <p>
                  {addr.address_line1}
                  {addr.address_line2 && `, ${addr.address_line2}`}
                </p>

                <p>
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>

                <p>
                  {addr.phone} · {addr.email}
                </p>
              </div>

              <h2
                className="section-heading"
                style={{ marginTop: 32 }}
              >
                Order Items
              </h2>

              <div className="review-items">
                {cart.map((item) => {
                  const size =
                    item.selectedSize ||
                    item.product?.selectedSize ||
                    item.variant?.size ||
                    '';

                  return (
                    <div key={item.key} className="review-item">
                      <img
                        src={
                          item.product.primary_image ||
                          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=100&q=80'
                        }
                        alt={item.product.name}
                      />

                      <div className="review-item-info">
                        <p className="review-item-name">
                          {item.product.name}
                        </p>

                        {(size || item.variant?.color) && (
                          <p className="review-item-variant">
                            {size && `Size: ${size}`}
                            {item.variant?.color &&
                              ` · Color: ${item.variant.color}`}
                          </p>
                        )}

                        <p className="review-item-qty">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="review-item-price">
                        ₹
                        {(
                          Number(item.product.price) * item.quantity
                        ).toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="btn-gold pay-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading
                  ? 'PROCESSING...'
                  : `PAY ₹${grandTotal.toLocaleString('en-IN')}`}
              </button>

              <p className="pay-note">
                Secure payment powered by Razorpay.
              </p>
            </div>
          )}
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>

          <div className="co-summary-items">
            {cart.map((item) => (
              <div key={item.key} className="co-summary-item">
                <span>
                  {item.product.name} × {item.quantity}
                </span>

                <span>
                  ₹
                  {(
                    Number(item.product.price) * item.quantity
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="co-summary-row">
            <span>Subtotal (estimate)</span>
            <span>
              ₹{Number(cartTotal).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="co-summary-row">
            <span>Shipping (estimate)</span>
            <span>
              {shipping === 0
                ? 'FREE'
                : `₹${shipping.toLocaleString('en-IN')}`}
            </span>
          </div>

          <div className="co-summary-total">
            <span>Estimated Total</span>
            <span>
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <p className="pay-note">
            Final pricing and shipping are confirmed by the server.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
