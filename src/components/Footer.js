import React from 'react';
import { Truck, Heart, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const features = [
  { icon: <Truck size={20} />, title: 'FREE SHIPPING', sub: 'On orders above ₹999' },
  { icon: <Heart size={20} />, title: 'HANDCRAFTED', sub: 'Made with love & care' },
  { icon: <Shield size={20} />, title: 'SECURE PAYMENT', sub: '100% safe checkout' },
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">

      {/* Features Bar */}
      <div className="features-bar">
        {features.map((f, i) => (
          <div key={i} className="feature-item">
            <div className="feature-icon">{f.icon}</div>
            <p className="feature-title">{f.title}</p>
            <p className="feature-sub">{f.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Footer */}
      <div className="footer-main">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-main">NAYRA</span>
            <span className="footer-logo-sub">FASHIONS</span>
          </div>
          <p className="footer-tagline">
            Elegance redefined — crafted for the modern Indian woman.
          </p>
        </div>

        {/* Footer Links */}
        <div className="footer-links">

          {/* Shop */}
          <div className="footer-col">
            <h4>SHOP</h4>
            <span onClick={() => navigate('/products')}>All Products</span>
            <span onClick={() => navigate('/collections/new-arrivals')}>New Arrivals</span>
            <span onClick={() => navigate('/collections/kurtas')}>Kurtas & Sets</span>
            <span onClick={() => navigate('/collections/festive')}>Festive Wear</span>
          </div>

          {/* Account */}
          <div className="footer-col">
            <h4>ACCOUNT</h4>
            <span onClick={() => navigate('/login')}>Login</span>
            <span onClick={() => navigate('/register')}>Register</span>
            <span onClick={() => navigate('/orders')}>My Orders</span>
            <span onClick={() => navigate('/wishlist')}>Wishlist</span>
            <span onClick={() => navigate('/cart')}>Cart</span>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>CONTACT</h4>
            <a href="mailto:Nayrafashions43@gmail.com">Nayrafashions43@gmail.com</a>
            <a href="https://www.instagram.com/nayrafashions10?igsh=MWF1dXRzaWQwOWgxYQ=="
              target="_blank" rel="noreferrer">
              @nayrafashions10
            </a>
            <a href="tel:+919677328864">+91 9677328864</a>
          </div>

        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <p>© 2026 Nayra Fashions. All rights reserved.</p>
      </div>

    </footer>
  );
};

export default Footer;