import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  User,
  Heart,
  ShoppingBag,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import logo from "../assets/logo.png";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Announcement */}

      <div className="announcement-bar">
        <span className="sparkle">✦</span>
        <span>FREE SHIPPING ON ORDERS ABOVE ₹2999</span>
        <span className="divider">|</span>
        <span>NEW ARRIVALS EVERY FRIDAY</span>
        <span className="sparkle">✦</span>
      </div>

      {/* Navbar */}

      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>

        {/* Left */}

        <div className="nav-left">

          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>

        {/* Center */}

        <a href="/" className="logo">

          <img
            src={logo}
            alt="Nayra Fashions"
            className={`logo-img ${scrolled ? "logo-small" : ""}`}
          />

          <div className="logo-text">

            <span className="logo-main">
              AYRA
            </span>

            <span className="logo-sub">
              FASHIONS
            </span>

          </div>

        </a>

        {/* Right */}

        <div className="nav-right">

          {user ? (
            <button
              className="nav-icon"
              onClick={logout}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          ) : (
            <a href="/login">
              <button className="nav-icon">
                <User size={18} />
              </button>
            </a>
          )}

          <a href="/wishlist">

            <button className="nav-icon">

              <Heart size={18} />

            </button>

          </a>

          <a href="/cart">

            <button className="nav-icon">

              <ShoppingBag size={18} />

              {cartCount > 0 && (

                <span className="badge">

                  {cartCount}

                </span>

              )}

            </button>

          </a>

        </div>

        {/* Mobile Menu */}

        {menuOpen && (

          <div className="mobile-menu">

            <a
              href="/"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </a>

            <a
              href="/collections"
              onClick={() => setMenuOpen(false)}
            >
              Collections
            </a>

            <a
              href="/collections/jewellery"
              onClick={() => setMenuOpen(false)}
            >
              Jewellery
            </a>

            <a
              href="/collections/hair-accessories"
              onClick={() => setMenuOpen(false)}
            >
              Hair Accessories
            </a>

            <a
              href="/collections/new-arrivals"
              onClick={() => setMenuOpen(false)}
            >
              New Arrivals
            </a>

            <a
              href="/collections/sale"
              onClick={() => setMenuOpen(false)}
            >
              Sale
            </a>

            {user && (

              <a
                href="/orders"
                onClick={() => setMenuOpen(false)}
              >
                My Orders
              </a>

            )}

          </div>

        )}

      </nav>
    </>
  );
};

export default Navbar;