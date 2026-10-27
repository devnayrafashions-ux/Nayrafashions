
import React from "react";
import { Link } from "react-router-dom";
import {
  FaShippingFast,
  FaHeart,
  FaLock,
  FaInstagram,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  // Header navigation links displayed under SHOP
  const headerLinks = [
    { label: "Home", path: "/" },
    { label: "Budget Friendly", path: "/collections/budget-friendly" },
    { label: "Festive Collections", path: "/collections/festive" },
    { label: "New Arrivals", path: "/collections/new-arrivals" },
    { label: "Own Brand", path: "/collections/own-brand" },
    { label: "My Orders", path: "/orders" },
  ];

  const accountLinks = [
    { label: "Login", path: "/login" },
    { label: "Register", path: "/register" },
    { label: "My Orders", path: "/orders" },
    { label: "Wishlist", path: "/wishlist" },
    { label: "Cart", path: "/cart" },
  ];

  const policyLinks = [
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Terms & Conditions", path: "/terms-and-conditions" },
    { label: "Shipping Policy", path: "/shipping-policy" },
    { label: "Refund Policy", path: "/refund-policy" },
  ];

  return (
    <footer className="nayra-footer">
      {/* Features */}
      <div className="footer-features">
        <div className="footer-feature">
          <FaShippingFast className="footer-feature-icon" />
          <div>
            <h4>FREE SHIPPING</h4>
            <p>On orders above ₹2999</p>
          </div>
        </div>

        <div className="footer-feature">
          <FaHeart className="footer-feature-icon" />
          <div>
            <h4>HANDCRAFTED</h4>
            <p>Made with love & care</p>
          </div>
        </div>

        <div className="footer-feature">
          <FaLock className="footer-feature-icon" />
          <div>
            <h4>SECURE PAYMENT</h4>
            <p>100% safe checkout</p>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        {/* Brand */}
        <div className="footer-brand">
          <Link
            to="/"
            className="footer-logo"
            aria-label="Nayra Fashions Home"
          >
            <span className="footer-logo-name">NAYRA</span>
            <span className="footer-logo-subtitle">FASHIONS</span>
          </Link>

          <p className="footer-tagline">Where Comfort Meets You</p>

          <p className="footer-brand-description">
            Discover timeless ethnic wear designed to bring together comfort,
            elegance, and everyday style.
          </p>

          <a
            href="https://www.instagram.com/nayrafashions10/"
            className="footer-social-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Nayra Fashions on Instagram"
          >
            <FaInstagram />
            <span>@nayrafashions10</span>
          </a>
        </div>

        {/* SHOP - Header Links Directly Under the Heading */}
        <div className="footer-column footer-shop-column">
          <h3>SHOP</h3>

          <ul>
            {headerLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* My Account */}
        <div className="footer-column">
          <h3>MY ACCOUNT</h3>

          <ul>
            {accountLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div className="footer-column">
          <h3>POLICIES</h3>

          <ul>
            {policyLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Us */}
        <div className="footer-column footer-contact">
          <h3>CONTACT US</h3>

          <p>
            <FaEnvelope className="footer-contact-icon" />
            <a href="mailto:nayrafashions43@gmail.com">
              nayrafashions43@gmail.com
            </a>
          </p>

          <p>
            <FaPhoneAlt className="footer-contact-icon" />
            <a href="tel:+919677328864">+91 9677328864</a>
          </p>

          <p>
            <FaMapMarkerAlt className="footer-contact-icon" />
            <span>
              Shop No. 4, 3rd Floor, BBC Plaza, Near Sony Center, North Usman
              Road, T. Nagar, Chennai, Tamil Nadu – 600017
            </span>
          </p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Nayra Fashions. All rights reserved.
        </p>

        <div className="footer-bottom-links">
          <Link to="/privacy-policy">Privacy</Link>
          <span>|</span>
          <Link to="/terms-and-conditions">Terms</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
