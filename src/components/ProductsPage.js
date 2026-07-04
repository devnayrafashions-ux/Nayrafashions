import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { productsAPI, categoriesAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './ProductsPage.css';

const badgeColors = { new: '#7B1B1B', bestseller: '#C8A96E', sale: '#2C5F2E' };

const ProductCard = ({ product, wishlist, onWishlist, onAddCart }) => (
  <div className="pc-card">
    <Link to={`/products/${product.slug}`} className="pc-image-wrap">
      <img
        src={product.primary_image || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80'}
        alt={product.name}
        className="pc-image"
        onError={e => {
          e.target.src = 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80';
        }}
      />
      {product.badge && (
        <span className="pc-badge" style={{ background: badgeColors[product.badge] }}>
          {product.badge.toUpperCase()}
        </span>
      )}
    </Link>
    <button
      className={`pc-wishlist ${wishlist.includes(product.id) ? 'active' : ''}`}
      onClick={() => onWishlist(product.id)}
    >
      <Heart size={15} fill={wishlist.includes(product.id) ? '#7B1B1B' : 'none'} />
    </button>
    <div className="pc-info">
      {product.category_name && <p className="pc-category">{product.category_name}</p>}
      <Link to={`/products/${product.slug}`}><h3 className="pc-name">{product.name}</h3></Link>
      <div className="pc-pricing">
        <span className="pc-price">₹{Number(product.price).toLocaleString()}</span>
        {product.original_price && (
          <span className="pc-original">₹{Number(product.original_price).toLocaleString()}</span>
        )}
        {product.discount_percent > 0 && (
          <span className="pc-discount">{product.discount_percent}% off</span>
        )}
      </div>
      {/* Sizes only ever apply to dresses — for jewelry/hair accessories
          product.sizes will be an empty list, so this simply won't render */}
      {Array.isArray(product.sizes) && product.sizes.length > 0 && (
        <div className="pc-sizes">
          {product.sizes.map(size => (
            <span key={size} className="pc-size-chip">{size}</span>
          ))}
        </div>
      )}
    </div>
  </div>
);

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { success, error } = useToast();

  const BADGE_SLUGS = { 'new-arrivals': 'new', 'bestsellers': 'bestseller', 'on-sale': 'sale' };

  // NEW: same pattern as BADGE_SLUGS. These slugs are type-level landing
  // pages (all Jewellery, all Hair Accessories) rather than a specific
  // sub-category — they map to Category.product_type, not Category.slug.
  const TYPE_SLUGS = { 'jewellery': 'jewelry', 'hair-accessories': 'hair_accessory' };

  const slugIsBadge = slug && BADGE_SLUGS[slug];
  const slugIsType = slug && TYPE_SLUGS[slug];

  const selectedCategory = (slugIsBadge || slugIsType) ? '' : (slug || searchParams.get('category') || '');
  const selectedBadge = slugIsBadge ? BADGE_SLUGS[slug] : (searchParams.get('badge') || '');
  const selectedType = slugIsType ? TYPE_SLUGS[slug] : '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const sortBy = searchParams.get('sort') || '-created_at';
  const searchQuery = searchParams.get('search') || '';
  const isFeatured = searchParams.get('featured') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, ordering: sortBy };
      if (selectedCategory) params['category__slug'] = selectedCategory;
      if (selectedType) params['category__product_type'] = selectedType;
      if (selectedBadge) params.badge = selectedBadge;
      if (searchQuery) params.search = searchQuery;
      if (isFeatured) params.is_featured = true;
      const data = await productsAPI.getAll(params);
      setProducts(Array.isArray(data) ? data : data.results || []);
      setTotalCount(data.count || 0);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [currentPage, selectedCategory, selectedType, selectedBadge, sortBy, searchQuery, isFeatured]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    categoriesAPI.getAll()
      .then(d => setCategories(Array.isArray(d) ? d : d.results || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      wishlistAPI.get()
        .then(d => {
          const items = Array.isArray(d) ? d : d.results || d.wishlist || [];
          setWishlist(items.map(p => p.id));
        })
        .catch(() => {});
    }
  }, [user]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const selectCategory = (catSlug) => {
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    next.delete('page');
    const qs = next.toString();
    if (catSlug) {
      navigate(`/collections/${catSlug}${qs ? `?${qs}` : ''}`);
    } else {
      navigate(`/products${qs ? `?${qs}` : ''}`);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) { window.location.href = '/login'; return; }
    try {
      await wishlistAPI.toggle(productId);
      setWishlist(prev =>
        prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
    } catch { error('Could not update wishlist'); }
  };

  const handleAddCart = (product) => {
    addToCart(product);
    success(`${product.name} added to cart`);
  };

  const totalPages = Math.ceil(totalCount / 12);

  const badgeLabels = { new: 'New Arrivals', bestseller: 'Bestsellers', sale: 'On Sale' };
  const typeLabels = { jewelry: 'Jewellery', hair_accessory: 'Hair Accessories' };
  const pageTitle = selectedCategory
    ? categories.find(c => c.slug === selectedCategory)?.name || 'Collection'
    : selectedType
    ? typeLabels[selectedType]
    : isFeatured ? 'Featured'
    : selectedBadge ? (badgeLabels[selectedBadge] || 'Collection')
    : 'All Products';

  // FIX: only treat this as a "type mode" page (Jewellery / Hair
  // Accessories) if the matched category's product_type is one we
  // actually have a label for. Previously this picked up ANY
  // product_type (e.g. a plain dress category), which caused
  // "All undefined" to render and made the "All" option re-navigate
  // to the same category instead of clearing filters.
  const matchedType = categories.find(c => c.slug === selectedCategory)?.product_type;
  const activeType = selectedType || (typeLabels[matchedType] ? matchedType : '') || '';

  // NEW: sidebar shows only sub-categories relevant to the current context.
  // On a type-level page (Jewellery, Hair Accessories) or when a specific
  // sub-category of that type is selected, narrow the list to that type.
  // On the general /products page, show everything as before.
  const sidebarCategories = activeType
    ? categories.filter(c => c.product_type === activeType)
    : categories;

  return (
    <div className="page-wrapper products-page">
      <div className="products-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <span>{pageTitle}</span>
        </div>
        <div className="products-header-row">
          <h1 className="products-title">{pageTitle}</h1>
          {totalCount > 0 && <p className="products-count">{totalCount} pieces</p>}
        </div>
      </div>

      <div className="products-toolbar">
        <button className="filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
          <SlidersHorizontal size={14} /> FILTERS
        </button>
        <div className="search-inline">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setParam('search', e.target.value)}
          />
          {searchQuery && <button onClick={() => setParam('search', '')}><X size={12} /></button>}
        </div>
        <div className="sort-wrap">
          <select value={sortBy} onChange={e => setParam('sort', e.target.value)}>
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
          <ChevronDown size={12} />
        </div>
      </div>

      <div className="products-layout">
        <aside className={`filters-sidebar ${filtersOpen ? 'open' : ''}`}>
          <div className="filter-section">
            <h4 className="filter-heading">
              {activeType ? typeLabels[activeType] || 'CATEGORY' : 'CATEGORY'}
            </h4>
            <label className="filter-option">
              <input
                type="radio"
                name="cat"
                checked={!selectedCategory}
                onChange={() => {
                  if (activeType) {
                    // FIX: resolve the type-level slug (e.g. "jewellery")
                    // rather than reusing `slug`, which may be a
                    // sub-category slug (e.g. "earrings") when this is
                    // clicked from within a sub-category page.
                    const typeSlug = Object.keys(TYPE_SLUGS).find(k => TYPE_SLUGS[k] === activeType);
                    navigate(`/collections/${typeSlug || slug}`);
                  } else {
                    selectCategory('');
                  }
                }}
              />
              {/* FIX: guard against undefined label so this never renders
                  "All undefined" for a non-type category. */}
              {activeType ? `All ${typeLabels[activeType] || ''}`.trim() : 'All Categories'}
            </label>
            {sidebarCategories.map(cat => (
              <label key={cat.slug} className="filter-option">
                <input type="radio" name="cat" checked={selectedCategory === cat.slug} onChange={() => selectCategory(cat.slug)} />
                {cat.name} <span>({cat.product_count})</span>
              </label>
            ))}
          </div>
          <div className="filter-section">
            <h4 className="filter-heading">COLLECTION</h4>
            {[
              { value: '', label: 'All' },
              { value: 'new', label: 'New Arrivals' },
              { value: 'bestseller', label: 'Bestsellers' },
              { value: 'sale', label: 'On Sale' },
            ].map(b => (
              <label key={b.value} className="filter-option">
                <input type="radio" name="badge" checked={selectedBadge === b.value} onChange={() => setParam('badge', b.value)} />
                {b.label}
              </label>
            ))}
          </div>
          {(selectedCategory || selectedBadge || searchQuery) && (
            <button className="clear-filters" onClick={() => navigate('/products')}>
              CLEAR ALL FILTERS
            </button>
          )}
        </aside>

        <div className="products-content">
          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="pc-card skeleton">
                  <div className="pc-image-wrap skeleton-img" />
                  <div style={{ padding: '16px' }}>
                    <div className="skeleton-line" style={{ width: '60%', height: 10, marginBottom: 8 }} />
                    <div className="skeleton-line" style={{ width: '40%', height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your filters or search query</p>
              <button className="btn-gold" onClick={() => navigate('/products')}>VIEW ALL</button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wishlist={wishlist}
                  onWishlist={toggleWishlist}
                  onAddCart={handleAddCart}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setParam('page', currentPage - 1)}>←</button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? 'active' : ''}
                  onClick={() => setParam('page', i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setParam('page', currentPage + 1)}>→</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;