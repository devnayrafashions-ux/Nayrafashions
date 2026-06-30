import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { productsAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './NewArrivals.css';

const badgeColors = {
  new: '#7B1B1B',
  bestseller: '#C8A96E',
  sale: '#2C5F2E',
};

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    productsAPI.getNewArrivals()
      .then(data => {
        const items = Array.isArray(data) ? data : data.results || [];
        if (items.length > 0) {
          setProducts(items.slice(0, 8));
        } else {
          return productsAPI.getAll({ ordering: '-created_at', page_size: 8 })
            .then(d => setProducts(Array.isArray(d) ? d.slice(0, 8) : (d.results || []).slice(0, 8)));
        }
      })
      .catch(() => {
        productsAPI.getAll({ ordering: '-created_at', page_size: 8 })
          .then(d => setProducts(Array.isArray(d) ? d.slice(0, 8) : (d.results || []).slice(0, 8)))
          .catch(() => setProducts([]));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      wishlistAPI.get()
        .then(data => setWishlist((data || []).map(p => p.id)))
        .catch(() => {});
    }
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) { window.location.href = '/login'; return; }
    await wishlistAPI.toggle(productId);
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) return (
    <section className="arrivals-section">
      <div className="section-header">
        <h2 className="section-title">NEW ARRIVALS</h2>
        <div className="section-divider" />
      </div>
      <div className="products-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="product-card skeleton">
            <div className="product-image-wrap skeleton-img" />
            <div className="skeleton-text" />
            <div className="skeleton-text short" />
          </div>
        ))}
      </div>
    </section>
  );

  if (products.length === 0) return null;

  return (
    <section className="arrivals-section">
      <div className="section-header">
        <h2 className="section-title">NEW ARRIVALS</h2>
        <div className="section-divider" />
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <Link to={`/products/${product.slug}`} className="product-image-wrap">
              <img
                src={product.primary_image || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80'}
                alt={product.name}
                className="product-image"
                onError={e => {
                  e.target.src = 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80';
                }}
              />
              {product.badge && (
                <span className="product-badge" style={{ backgroundColor: badgeColors[product.badge] }}>
                  {product.badge.toUpperCase()}
                </span>
              )}
              <button
                className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
              >
                <Heart size={16} fill={wishlist.includes(product.id) ? '#7B1B1B' : 'none'} />
              </button>
            </Link>

            <div className="product-info">
              <Link to={`/products/${product.slug}`}>
                <h3 className="product-name">{product.name}</h3>
              </Link>
              <div className="product-pricing">
                <span className="price-current">₹{Number(product.price).toLocaleString()}</span>
                {product.original_price && (
                  <span className="price-original">₹{Number(product.original_price).toLocaleString()}</span>
                )}
                {product.discount_percent > 0 && (
                  <span className="price-discount">{product.discount_percent}% off</span>
                )}
              </div>
              {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <div className="product-sizes">
                  {product.sizes.map(size => (
                    <span key={size} className="product-size-chip">{size}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="view-all-wrap">
        <Link to="/products">
          <button className="btn-view-all">VIEW ALL PRODUCTS</button>
        </Link>
      </div>

    </section>
  );
};

export default NewArrivals;