import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Star, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { productsAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedWishlist, setRelatedWishlist] = useState([]);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { success, error } = useToast();

  useEffect(() => {
    productsAPI.getBySlug(slug)
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (user && product) {
      wishlistAPI.get().then(d => {
        setWishlisted((d || []).some(p => p.id === product.id));
        setRelatedWishlist((d || []).map(p => p.id));
      }).catch(() => {});
    }
  }, [user, product]);

  // Fetch other dress suggestions once we know the product/category
  useEffect(() => {
    if (!product) return;

    const loadRelated = (params) =>
      productsAPI.getAll(params)
        .then(d => Array.isArray(d) ? d : d.results || [])
        .then(items => items.filter(p => p.id !== product.id).slice(0, 8));

    const params = product.category
      ? { category: product.category.slug, page_size: 9 }
      : { page_size: 9 };

    loadRelated(params)
      .then(items => {
        if (items.length > 0) {
          setRelatedProducts(items);
        } else {
          // fallback: no other products in same category
          return loadRelated({ page_size: 9 }).then(setRelatedProducts);
        }
      })
      .catch(() => setRelatedProducts([]));
  }, [product]);

  // ✅ Use product.sizes (JSONField) first, fall back to variants for backward compat
  const sizes = product
    ? (Array.isArray(product.sizes) && product.sizes.length > 0
        ? product.sizes
        : [...new Set(product.variants?.map(v => v.size).filter(Boolean))])
    : [];

  const colors = product
    ? [...new Set(product.variants?.map(v => v.color).filter(Boolean))]
    : [];

  useEffect(() => {
    if (product?.variants?.length) {
      const match = product.variants.find(v =>
        (!selectedSize || v.size === selectedSize) &&
        (!selectedColor || v.color === selectedColor)
      );
      setSelectedVariant(match || null);
    }
  }, [selectedSize, selectedColor, product]);

  const handleAddToCart = () => {
    // FIX: previously this added to cart directly with no login check,
    // so logged-out users could add items and see the cart badge update
    // without ever being asked to sign in.
    if (!user) {
      error('Please login to add items to your bag');
      navigate('/login', { state: { from: `/products/${slug}` } });
      return;
    }
    // ✅ Require size selection if sizes exist
    if (sizes.length > 0 && !selectedSize) {
      error('Please select a size to continue');
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      error('Please select a colour');
      return;
    }
    addToCart({ ...product, selectedSize }, selectedVariant, quantity);
    success(`${product.name} (${selectedSize ? `Size: ${selectedSize}` : ''}) added to cart!`);
  };

  const toggleWishlist = async () => {
    if (!user) { window.location.href = '/login'; return; }
    await wishlistAPI.toggle(product.id);
    setWishlisted(p => !p);
    success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const toggleRelatedWishlist = async (productId) => {
    if (!user) { window.location.href = '/login'; return; }
    await wishlistAPI.toggle(productId);
    setRelatedWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) return <div className="page-wrapper"><div className="spinner" /></div>;
  if (!product) return (
    <div className="page-wrapper" style={{ textAlign: 'center', padding: '120px 20px' }}>
      <h2>Product not found</h2>
      <Link to="/products">
        <button className="btn-gold" style={{ marginTop: 24 }}>BACK TO SHOP</button>
      </Link>
    </div>
  );

  const primaryImg = product.images?.find(i => i.is_primary) || product.images?.[0];
  const allImages = product.images || (primaryImg ? [primaryImg] : []);
  const avgRating = product.avg_rating;
  const stockToShow = selectedVariant ? selectedVariant.stock : product.stock;

  return (
    <div className="page-wrapper product-detail-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> /
        <Link to="/products">Products</Link> /
        {product.category && (
          <><Link to={`/collections/${product.category.slug}`}>{product.category.name}</Link> / </>
        )}
        <span>{product.name}</span>
      </div>

      <div className="pd-grid">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-thumbnails">
            {allImages.map((img, i) => (
              <button
                key={i}
                className={`pd-thumb ${selectedImage === i ? 'active' : ''}`}
                onClick={() => setSelectedImage(i)}
              >
                <img src={img.image} alt={img.alt_text || product.name} />
              </button>
            ))}
          </div>
          <div className="pd-main-image">
            {allImages[selectedImage] ? (
              <img src={allImages[selectedImage].image} alt={product.name} />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=700&q=80"
                alt={product.name}
              />
            )}
            {product.badge && (
              <span className="pd-badge">{product.badge.toUpperCase()}</span>
            )}
            {allImages.length > 1 && (
              <>
                <button
                  className="pd-nav pd-prev"
                  onClick={() => setSelectedImage(p => Math.max(0, p - 1))}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  className="pd-nav pd-next"
                  onClick={() => setSelectedImage(p => Math.min(allImages.length - 1, p + 1))}
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="pd-info">
          {product.category && (
            <Link to={`/collections/${product.category.slug}`} className="pd-category">
              {product.category.name.toUpperCase()}
            </Link>
          )}
          <h1 className="pd-name">{product.name}</h1>

          {avgRating && (
            <div className="pd-rating">
              {[1,2,3,4,5].map(s => (
                <Star
                  key={s} size={14}
                  fill={s <= Math.round(avgRating) ? '#C8A96E' : 'none'}
                  stroke="#C8A96E"
                />
              ))}
              <span>{avgRating}</span>
            </div>
          )}

          <div className="pd-pricing">
            <span className="pd-price">₹{Number(product.price).toLocaleString()}</span>
            {product.original_price && (
              <span className="pd-original">₹{Number(product.original_price).toLocaleString()}</span>
            )}
            {product.discount_percent > 0 && (
              <span className="pd-off">{product.discount_percent}% OFF</span>
            )}
          </div>

          <p className="pd-description">{product.description}</p>

          {/* ✅ Size selector from product.sizes JSONField */}
          {sizes.length > 0 && (
            <div className="pd-variants-section">
              <p className="pd-variant-label">
                SIZE
                {selectedSize
                  ? <span className="pd-selected-val"> — {selectedSize}</span>
                  : <span className="pd-required"> — Please select *</span>}
              </p>
              <div className="pd-sizes">
                {sizes.map(s => (
                  <button
                    key={s}
                    className={`pd-size-btn ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color (from variants — unchanged) */}
          {colors.length > 0 && (
            <div className="pd-variants-section">
              <p className="pd-variant-label">COLOUR — <span>{selectedColor}</span></p>
              <div className="pd-colors">
                {product.variants
                  ?.filter((v, i, arr) => arr.findIndex(x => x.color === v.color) === i)
                  .map(v => (
                    <button
                      key={v.id}
                      className={`pd-color-btn ${selectedColor === v.color ? 'active' : ''}`}
                      style={{ background: v.color_hex || '#ccc' }}
                      title={v.color}
                      onClick={() => setSelectedColor(selectedColor === v.color ? '' : v.color)}
                    />
                  ))}
              </div>
            </div>
          )}

          {stockToShow === 0 && (
  <p className="pd-stock out">✗ Out of Stock</p>
)}

          {/* Quantity + Add to Cart */}
          <div className="pd-actions">
            <div className="pd-qty">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus size={14} />
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(stockToShow, q + 1))}>
                <Plus size={14} />
              </button>
            </div>
            <button
              className="btn-gold pd-add-btn"
              onClick={handleAddToCart}
              disabled={stockToShow === 0}
            >
              {stockToShow === 0
                ? 'OUT OF STOCK'
                : sizes.length > 0 && !selectedSize
                ? 'SELECT A SIZE'
                : 'ADD TO BAG'}
            </button>
            <button
              className={`pd-wish-btn ${wishlisted ? 'active' : ''}`}
              onClick={toggleWishlist}
            >
              <Heart size={18} fill={wishlisted ? '#7B1B1B' : 'none'} />
            </button>
          </div>

          <div className="pd-meta">
            <p>Free shipping on orders above ₹2999</p>
          </div>
        </div>
      </div>

      {/* You May Also Like */}
      {relatedProducts.length > 0 && (
        <div className="pd-related-section">
          <h2 className="pd-related-heading">YOU MAY ALSO LIKE</h2>
          <div className="pd-related-grid">
            {relatedProducts.map(p => (
              <div key={p.id} className="pd-related-card">
                <Link to={`/products/${p.slug}`} className="pd-related-image-wrap">
                  <img
                    src={p.primary_image || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80'}
                    alt={p.name}
                    className="pd-related-image"
                    onError={e => {
                      e.target.src = 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80';
                    }}
                  />
                  <button
                    className={`pd-related-wish-btn ${relatedWishlist.includes(p.id) ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); toggleRelatedWishlist(p.id); }}
                  >
                    <Heart size={16} fill={relatedWishlist.includes(p.id) ? '#7B1B1B' : 'none'} />
                  </button>
                </Link>
                <div className="pd-related-info">
                  <Link to={`/products/${p.slug}`}>
                    <h3 className="pd-related-name">{p.name}</h3>
                  </Link>
                  <div className="pd-related-pricing">
                    <span className="pd-related-price">₹{Number(p.price).toLocaleString()}</span>
                    {p.original_price && (
                      <span className="pd-related-original">₹{Number(p.original_price).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;