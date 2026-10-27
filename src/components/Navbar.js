
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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

const MENU_LINKS = [
  { label: "Home", to: "/" },
  { label: "Budget Friendly", to: "/collections/budget-friendly" },
  { label: "Festive Collections", to: "/collections/festive-collections" },
  { label: "New Arrivals", to: "/collections/new-arrivals" },
  { label: "Own Brand", to: "/collections/own-brand" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <span className="sparkle">✦</span>
        <span>FREE SHIPPING ON ORDERS ABOVE ₹2999</span>
        <span className="announcement-divider">|</span>
        <span>NEW ARRIVALS EVERY FRIDAY</span>
        <span className="sparkle">✦</span>
      </div>

      {/* Main Navigation */}
      <nav
        className={`navbar ${scrolled ? "scrolled" : ""}`}
        aria-label="Main navigation"
      >
        {/* Left: Hamburger */}
        <div className="nav-left">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {/* Center: N Logo + NAYRA + FASHIONS */}
        <Link
          to="/"
          className="logo"
          aria-label="Nayra Fashions Home"
          onClick={closeMenu}
        >
          <img
            src={logo}
            alt=""
            className={`logo-img ${scrolled ? "logo-small" : ""}`}
          />

          <span className="logo-text">
            <span className="logo-main">NAYRA</span>
            <span className="logo-sub">FASHIONS</span>
          </span>
        </Link>

        {/* Right: Account, Wishlist and Cart */}
        <div className="nav-right">
          {user ? (
            <button
              type="button"
              className="nav-icon"
              onClick={logout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <Link
              to="/login"
              className="nav-icon"
              aria-label="Login"
              title="Login"
            >
              <User size={20} />
            </Link>
          )}

          <Link
            to="/wishlist"
            className="nav-icon"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart size={20} />
          </Link>

          <Link
            to="/cart"
            className="nav-icon cart-nav-icon"
            aria-label={`Shopping cart, ${cartCount} items`}
            title="Shopping Cart"
          >
            <ShoppingBag size={20} />

            {cartCount > 0 && (
              <span className="badge">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Hamburger Menu */}
        {menuOpen && (
          <>
            <button
              type="button"
              className="menu-overlay"
              aria-label="Close menu"
              onClick={closeMenu}
            />

            <div className="mobile-menu">
              {MENU_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`menu-link ${
                    location.pathname === item.to ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}

              {user && (
                <Link
                  to="/orders"
                  className={`menu-link ${
                    location.pathname === "/orders" ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  My Orders
                </Link>
              )}
            </div>
          </>
        )}
      </nav>
    </>
  );
};

export default Navbar;
