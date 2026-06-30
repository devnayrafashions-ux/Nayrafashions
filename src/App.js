import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import './styles/global.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Collections from './components/Collections';
import NewArrivals from './components/NewArrivals';
import OurStory from './components/OurStory';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/Registerpage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import ProductDetailPage from './components/ProductDetailPage';
import ProductsPage from './components/ProductsPage';
import WishlistPage from './components/WishlistPage';
import OrdersPage from './components/OrdersPage';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProducts from './components/admin/AdminProducts';
import AdminCategories from './components/admin/AdminCategories';
import AdminOrders from './components/admin/AdminOrders';
import AdminCustomers from './components/admin/AdminCustomers';

const HomePage = () => (
  <>
    <Hero />
    <Collections />
    <NewArrivals />
    <OurStory />
    <Footer />
  </>
);

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Public routes with Navbar */}
              <Route path="/" element={<><Navbar /><HomePage /></>} />
              <Route path="/login" element={<><Navbar /><LoginPage /></>} />
              <Route path="/register" element={<><Navbar /><RegisterPage /></>} />
              <Route path="/cart" element={<><Navbar /><CartPage /></>} />
              <Route path="/checkout" element={<><Navbar /><CheckoutPage /></>} />
              <Route path="/products" element={<><Navbar /><ProductsPage /></>} />
              <Route path="/products/:slug" element={<><Navbar /><ProductDetailPage /></>} />
              <Route path="/collections" element={<Navigate to="/products" replace />} />
              <Route path="/collections/:slug" element={<><Navbar /><ProductsPage /></>} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/orders" element={<><Navbar /><OrdersPage /></>} />

              {/* Admin routes - no Navbar */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;