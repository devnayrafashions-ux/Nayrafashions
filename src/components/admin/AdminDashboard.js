import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, Package, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { adminAPI, ordersAPI } from '../../services/api';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '20', color }}>
      <Icon size={22} />
    </div>
    <div className="stat-info">
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  </div>
);

const statusIcon = {
  pending: AlertCircle,
  processing: Clock,
  shipped: TrendingUp,
  delivered: CheckCircle,
  cancelled: XCircle,
  confirmed: CheckCircle,
  refunded: XCircle,
};
const statusColor = {
  pending: '#C8A96E',
  processing: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#2C5F2E',
  cancelled: '#7B1B1B',
  confirmed: '#16A34A',
  refunded: '#6B7280',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminAPI.getDashboard().catch(() => null),
      ordersAPI.getAll({ page_size: 5, ordering: '-created_at' }).catch(() => ({ results: [] })),
    ]).then(([dashData, ordersData]) => {
      setStats(dashData);
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : ordersData.results?.slice(0, 5) || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your store.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${(stats?.total_revenue || 0).toLocaleString()}`} sub="All time" color="#7B1B1B" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats?.total_orders || 0} sub={`${stats?.pending_orders || 0} pending`} color="#C8A96E" />
        <StatCard icon={Package} label="Products" value={stats?.total_products || 0} sub={`${stats?.active_products || 0} active`} color="#3B82F6" />
        <StatCard icon={Users} label="Customers" value={stats?.total_customers || 0} sub="Registered users" color="#2C5F2E" />
      </div>

      <div className="admin-grid-2">
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Orders</h2>
          </div>
          {recentOrders.length === 0 ? (
            <p className="admin-empty">No orders yet</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentOrders.map(order => {
                  const Icon = statusIcon[order.status] || Clock;
                  const color = statusColor[order.status] || '#888';
                  return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      {/* ✅ fixed: was order.user_name */}
                      <td>{order.customer_name || order.full_name || '—'}</td>
                      {/* ✅ fixed: was order.total_amount */}
                      <td>₹{Number(order.total || 0).toLocaleString()}</td>
                      <td>
                        <span className="status-badge" style={{ background: color + '20', color }}>
                          <Icon size={12} /> {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Order Status Summary */}
        <div className="admin-card">
          <div className="admin-card-header"><h2>Order Status</h2></div>
          <div className="status-list">
            {Object.entries(statusColor).map(([status, color]) => (
              <div key={status} className="status-row">
                <span className="status-dot" style={{ background: color }} />
                <span className="status-name">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                <span className="status-count">{stats?.[`${status}_orders`] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;