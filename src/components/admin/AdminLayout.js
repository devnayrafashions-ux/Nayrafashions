import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, ShoppingBag,
  Users, LogOut, Menu, X, Store
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: Tags, label: 'Categories' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  // ✅ Wait for auth to resolve before deciding anything
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', height: '100vh',
        fontSize: '1.2rem', color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // ✅ Redirect to login if not logged in or not staff
  if (!user || !user.is_staff) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <Store size={20} />
            {sidebarOpen && <span>NAYRA ADMIN</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-avatar">{user?.first_name?.[0] || 'A'}</div>
            {sidebarOpen && (
              <div className="admin-user-info">
                <p>{user?.first_name || 'Admin'}</p>
                <span>{user?.email}</span>
              </div>
            )}
          </div>
          <button className="admin-logout" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
          <button className="admin-store-btn" onClick={() => navigate('/')}>
            <Store size={16} />
            {sidebarOpen && <span>View Store</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;