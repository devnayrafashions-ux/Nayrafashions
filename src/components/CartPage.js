import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartPage.css';

const CartPage = () => {
  const { cart, cartTotal, cartCount, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = cartTotal >= 999 || cartTotal === 0 ? 0 : 99;
  const grandTotal = cartTotal + shipping;

  const handleCheckout = () => {
    if (!user) { navigate('/login'); return; }
    navigate('/checkout');
  };

  if (cart.length === 0) return (
    <div className="page-wrapper cart-page">
      <div className="empty-state">
        <ShoppingBag size={48} strokeWidth={1} style={{ margin: '0 auto 20px', color: 'var(--text-light)' }} />
        <h3>Your bag is empty</h3>
        <p>Discover our latest collections and add pieces you love</p>
        <Link to="/products"><button className="btn-gold">SHOP NOW</button></Link>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper cart-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <span>Shopping Bag</span>
      </div>
      <h1 className="cart-title">Shopping Bag <span>({cartCount} items)</span></h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.key} className="cart-item">
              <Link to={`/products/${item.product.slug}`} className="cart-item-image">
                <img
                  src={item.product.primary_image || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300&q=80'}
                  alt={item.product.name}
                />
              </Link>
              <div className="cart-item-info">
                <div className="cart-item-top">
                  <div>
                    {item.product.category_name && <p className="cart-item-cat">{item.product.category_name}</p>}
                    <Link to={`/products/${item.product.slug}`}>
                      <h3 className="cart-item-name">{item.product.name}</h3>
                    </Link>
                    {/* ✅ Show size from JSONField selection or variant */}
{(item.product?.selectedSize || item.variant?.size || item.variant?.color) && (
  <p className="cart-item-variant">
    {(item.product?.selectedSize || item.variant?.size) && (
      <span>Size: {item.product?.selectedSize || item.variant?.size}</span>
    )}
    {item.variant?.color && <span>Color: {item.variant.color}</span>}
  </p>
)}
                  </div>
                  <button className="cart-remove" onClick={() => removeFromCart(item.key)}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="cart-item-bottom">
                  <div className="cart-qty">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)}><Minus size={12} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)}><Plus size={12} /></button>
                  </div>
                  <div className="cart-item-price">
                    <p className="cart-item-total">₹{(Number(item.product.price) * item.quantity).toLocaleString()}</p>
                    {item.quantity > 1 && (
                      <p className="cart-item-unit">₹{Number(item.product.price).toLocaleString()} each</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2 className="summary-title">Order Summary</h2>
          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal ({cartCount} items)</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="free-tag">FREE</span> : `₹${shipping}`}</span>
            </div>
            {shipping > 0 && (
              <p className="free-shipping-note">Add ₹{(999 - cartTotal).toFixed(0)} more for free shipping</p>
            )}
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{grandTotal.toLocaleString()}</span>
          </div>
          <button className="btn-gold checkout-btn" onClick={handleCheckout}>
            PROCEED TO CHECKOUT
          </button>
          <Link to="/products" className="continue-shopping">← Continue Shopping</Link>
          <div className="cart-perks">
            <p>✓ Free shipping on orders above ₹999</p>
            <p>✓ 100% authentic products</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;