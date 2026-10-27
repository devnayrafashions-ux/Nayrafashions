
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";

import "./styles/global.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Collections from "./components/Collections";
import NewArrivals from "./components/NewArrivals";
import FestiveCollection from "./components/FestiveCollection";
import OurStory from "./components/OurStory";
import Footer from "./components/Footer";

import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/Registerpage";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import ProductDetailPage from "./components/ProductDetailPage";
import ProductsPage from "./components/ProductsPage";
import WishlistPage from "./components/WishlistPage";
import OrdersPage from "./components/OrdersPage";
import ScrollToTop from "./components/ScrollToTop";
import AboutUs from "./components/AboutUs";


import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsAndConditions from "./components/TermsAndConditions";
import ShippingPolicy from "./components/ShippingPolicy";
import RefundPolicy from "./components/RefundPolicy";

// Admin components
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminProducts from "./components/admin/AdminProducts";
import AdminCategories from "./components/admin/AdminCategories";
import AdminOrders from "./components/admin/AdminOrders";
import AdminCustomers from "./components/admin/AdminCustomers";

// Homepage content
const HomePage = () => {
  return (
    <>
      <Hero />
      <Collections />
      <NewArrivals />
      <FestiveCollection />
      <OurStory />
    </>
  );
};

// Shared layout for every public page
const PublicLayout = ({ children }) => {
  return (
    <div className="public-layout">
      <Navbar />

      <main className="public-page-content">
        {children}
      </main>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />

            <Routes>
              {/* ================= PUBLIC PAGES ================= */}

              {/* Homepage */}
              <Route
                path="/"
                element={
                  <PublicLayout>
                    <HomePage />
                  </PublicLayout>
                }
              />

              {/* Authentication */}
              <Route
                path="/login"
                element={
                  <PublicLayout>
                    <LoginPage />
                  </PublicLayout>
                }
              />

              <Route
                path="/register"
                element={
                  <PublicLayout>
                    <RegisterPage />
                  </PublicLayout>
                }
              />

              {/* Shopping */}
              <Route
                path="/products"
                element={
                  <PublicLayout>
                    <ProductsPage />
                  </PublicLayout>
                }
              />

              <Route
                path="/products/:slug"
                element={
                  <PublicLayout>
                    <ProductDetailPage />
                  </PublicLayout>
                }
              />

              <Route
                path="/collections"
                element={<Navigate to="/products" replace />}
              />

              <Route
                path="/collections/:slug"
                element={
                  <PublicLayout>
                    <ProductsPage />
                  </PublicLayout>
                }
              />

              {/* Cart and Checkout */}
              <Route
                path="/cart"
                element={
                  <PublicLayout>
                    <CartPage />
                  </PublicLayout>
                }
              />
              <Route
  path="/about-us"
  element={
    <PublicLayout>
      <AboutUs />
    </PublicLayout>
  }
/>
              <Route
                path="/checkout"
                element={
                  <PublicLayout>
                    <CheckoutPage />
                  </PublicLayout>
                }
              />

              {/* Customer Account */}
              <Route
                path="/wishlist"
                element={
                  <PublicLayout>
                    <WishlistPage />
                  </PublicLayout>
                }
              />

              <Route
                path="/orders"
                element={
                  <PublicLayout>
                    <OrdersPage />
                  </PublicLayout>
                }
              />

              {/* ================= POLICY PAGES ================= */}

              <Route
                path="/privacy-policy"
                element={
                  <PublicLayout>
                    <PrivacyPolicy />
                  </PublicLayout>
                }
              />

              <Route
                path="/terms-and-conditions"
                element={
                  <PublicLayout>
                    <TermsAndConditions />
                  </PublicLayout>
                }
              />

              <Route
                path="/shipping-policy"
                element={
                  <PublicLayout>
                    <ShippingPolicy />
                  </PublicLayout>
                }
              />

              <Route
                path="/refund-policy"
                element={
                  <PublicLayout>
                    <RefundPolicy />
                  </PublicLayout>
                }
              />

              {/* ================= ADMIN PAGES ================= */}
              {/* Admin pages intentionally have no public Navbar/Footer */}

              <Route path="/admin" element={<AdminLayout />}>
                <Route
                  index
                  element={<AdminDashboard />}
                />

                <Route
                  path="products"
                  element={<AdminProducts />}
                />

                <Route
                  path="categories"
                  element={<AdminCategories />}
                />

                <Route
                  path="orders"
                  element={<AdminOrders />}
                />

                <Route
                  path="customers"
                  element={<AdminCustomers />}
                />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
