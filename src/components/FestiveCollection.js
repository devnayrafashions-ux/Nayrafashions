import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { productsAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
// Reuses NewArrivals' stylesheet (same arrivals-* classes) so the cards,
// grid and sliding behavior look identical to the section above it.
import './NewArrivals.css';

// Change this if your category slug in the admin/database is different
const FESTIVE_SLUG = 'festive-collection';
const MAX_PRODUCTS = 8;
const SLIDE_THRESHOLD = 5;

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80';

const badgeColors = {
  new: '#7B1B1B',
  bestseller: '#C8A96E',
  sale: '#2C5F2E',
};

// Returns true only if the product belongs to the festive category.
// Checks the different shapes a category can come in from the API.
const isFestiveProduct = product => {
  const values = [];

  const collect = value => {
    if (!value) return;
    if (typeof value === 'string') values.push(value);
    else if (typeof value === 'object') {
      if (value.slug) values.push(value.slug);
      if (value.name) values.push(value.name);
    }
  };

  collect(product.category);
  collect(product.category_slug);
  collect(product.category_name);
  if (Array.isArray(product.categories)) product.categories.forEach(collect);

  // If the API sends no category info at all, trust the server-side filter
  if (values.length === 0) return true;

  return values.some(v => String(v).toLowerCase().includes('festive'));
};

const FestiveCollection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    productsAPI
      .getAll({ category: FESTIVE_SLUG, page_size: 50 })
      .then(data => {
        const items = Array.isArray(data) ? data : data.results || [];
        // Only festive category products are allowed in this section
        setProducts(items.filter(isFestiveProduct).slice(0, MAX_PRODUCTS));
      })
      .catch(error => {
        console.error('Failed to load festive collection:', error);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      wishlistAPI
        .get()
        .then(data => setWishlist((data || []).map(p => p.id)))
        .catch(() => {});
    }
  }, [user]);

  const toggleWishlist = async productId => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    await wishlistAPI.toggle(productId);
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <section className="arrivals-section festive-section">
        <div className="section-header">
          <h2 className="section-title">FESTIVE COLLECTION</h2>
          <div className="section-divider" />
        </div>
        <div className="arrivals-grid arrivals-grid-static">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="arrivals-card skeleton">
              <div className="arrivals-image-wrap arrivals-skeleton-img" />
              <div className="arrivals-skeleton-text" />
              <div className="arrivals-skeleton-text short" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Hide the whole section if there are no festive products yet
  if (products.length === 0) return null;

  const shouldSlide = products.length > SLIDE_THRESHOLD;
  const trackProducts = shouldSlide ? [...products, ...products] : products;

  const renderCard = (product, key) => (
    <div key={key} className="arrivals-card">
      <Link to={`/products/${product.slug}`} className="arrivals-image-wrap">
        <img
          src={product.primary_image || FALLBACK_IMAGE}
          alt={product.name}
          className="arrivals-image"
          loading="lazy"
          onError={e => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE;
          }}
        />

        {product.badge && (
          <span
            className="arrivals-badge"
            style={{ backgroundColor: badgeColors[product.badge] }}
          >
            {product.badge.toUpperCase()}
          </span>
        )}

        <button
          className={`arrivals-wishlist-btn ${
            wishlist.includes(product.id) ? 'active' : ''
          }`}
          onClick={e => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
        >
          <Heart
            size={16}
            fill={wishlist.includes(product.id) ? '#7B1B1B' : 'none'}
          />
        </button>
      </Link>

      <div className="arrivals-info">
        <Link to={`/products/${product.slug}`}>
          <h3 className="arrivals-name">{product.name}</h3>
        </Link>

        <div className="arrivals-pricing">
          <span className="arrivals-price-current">
            ₹{Number(product.price).toLocaleString()}
          </span>
          {product.original_price && (
            <span className="arrivals-price-original">
              ₹{Number(product.original_price).toLocaleString()}
            </span>
          )}
          {product.discount_percent > 0 && (
            <span className="arrivals-price-discount">
              {product.discount_percent}% off
            </span>
          )}
        </div>

        {Array.isArray(product.sizes) && product.sizes.length > 0 && (
          <div className="arrivals-sizes">
            {product.sizes.map(size => (
              <span key={size} className="arrivals-size-chip">
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="arrivals-section festive-section">
      <div className="section-header">
        <h2 className="section-title">FESTIVE COLLECTION</h2>
        <div className="section-divider" />
      </div>

      {shouldSlide ? (
        <div className="arrivals-scroll-container">
          <div className="arrivals-grid arrivals-grid-slide">
            {trackProducts.map((product, idx) =>
              renderCard(product, `${product.id}-${idx}`)
            )}
          </div>
        </div>
      ) : (
        <div className="arrivals-grid arrivals-grid-static">
          {trackProducts.map(product => renderCard(product, product.id))}
        </div>
      )}

      <div className="view-all-wrap">
        <Link to={`/collections/${FESTIVE_SLUG}`}>
          <button className="btn-view-all">VIEW FESTIVE COLLECTION</button>
        </Link>
      </div>
    </section>
  );
};

export default FestiveCollection;