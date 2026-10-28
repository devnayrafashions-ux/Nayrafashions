
  import React, { useState, useEffect, useRef } from 'react';
  import { useParams, useNavigate, Link } from 'react-router-dom';
  import {
    Heart,
    Star,
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    ZoomIn,
    X,
  } from 'lucide-react';

  import { productsAPI, wishlistAPI } from '../services/api';
  import { useAuth } from '../context/AuthContext';
  import { useCart } from '../context/CartContext';
  import { useToast } from '../context/ToastContext';
  import './ProductDetailPage.css';

  const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=900&q=85';

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

    // Image zoom state
    const [zoomActive, setZoomActive] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({
      x: 50,
      y: 50,
    });
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const mainImageRef = useRef(null);

    const { user } = useAuth();
    const { addToCart } = useCart();
    const { success, error } = useToast();

    useEffect(() => {
      let mounted = true;

      setLoading(true);
      setProduct(null);
      setSelectedImage(0);
      setSelectedSize('');
      setSelectedColor('');
      setSelectedVariant(null);
      setQuantity(1);
      setZoomActive(false);
      setLightboxOpen(false);

      productsAPI
        .getBySlug(slug)
        .then((data) => {
          if (mounted) setProduct(data);
        })
        .catch(() => {
          if (mounted) setProduct(null);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });

      return () => {
        mounted = false;
      };
    }, [slug]);

    useEffect(() => {
      if (!user || !product) return;

      wishlistAPI
        .get()
        .then((data) => {
          const items = data || [];

          setWishlisted(
            items.some((item) => item.id === product.id)
          );

          setRelatedWishlist(items.map((item) => item.id));
        })
        .catch(() => {});
    }, [user, product]);

    useEffect(() => {
      if (!product) return;

      const loadRelated = (params) =>
        productsAPI
          .getAll(params)
          .then((data) =>
            Array.isArray(data) ? data : data.results || []
          )
          .then((items) =>
            items.filter((item) => item.id !== product.id).slice(0, 8)
          );

      const params = product.category
        ? { category: product.category.slug, page_size: 9 }
        : { page_size: 9 };

      loadRelated(params)
        .then((items) => {
          if (items.length > 0) {
            setRelatedProducts(items);
          } else {
            return loadRelated({ page_size: 9 }).then(
              setRelatedProducts
            );
          }
        })
        .catch(() => setRelatedProducts([]));
    }, [product]);

    const sizes = product
      ? Array.isArray(product.sizes) && product.sizes.length > 0
        ? product.sizes
            .map((item) =>
              typeof item === 'object' ? item.size : item
            )
            .filter(Boolean)
        : [
            ...new Set(
              product.variants?.map((variant) => variant.size).filter(Boolean)
            ),
          ]
      : [];

    const colors = product
      ? [
          ...new Set(
            product.variants?.map((variant) => variant.color).filter(Boolean)
          ),
        ]
      : [];

    useEffect(() => {
      if (!product?.variants?.length) {
        setSelectedVariant(null);
        return;
      }

      const matchingVariants = product.variants.filter(
        (variant) =>
          (!selectedSize || variant.size === selectedSize) &&
          (!selectedColor || variant.color === selectedColor)
      );

      setSelectedVariant(matchingVariants[0] || null);
    }, [selectedSize, selectedColor, product]);

    const primaryImage =
      product?.images?.find((image) => image.is_primary) ||
      product?.images?.[0];

    const allImages =
      product?.images?.length > 0
        ? product.images
        : primaryImage
          ? [primaryImage]
          : product?.primary_image
            ? [{ image: product.primary_image }]
            : [];

    const currentImage =
      allImages[selectedImage]?.image || FALLBACK_IMAGE;

    const stockToShow =
      selectedVariant
        ? Number(selectedVariant.stock)
        : Number(product?.stock || 0);

    const avgRating = product?.avg_rating;

    // Desktop hover zoom: follow the pointer over the image.
    const handleImageMouseMove = (event) => {
      const bounds = event.currentTarget.getBoundingClientRect();

      if (!bounds.width || !bounds.height) return;

      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;

      setZoomPosition({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    };

    const handleImageMouseEnter = () => {
      setZoomActive(true);
    };

    const handleImageMouseLeave = () => {
      setZoomActive(false);
      setZoomPosition({ x: 50, y: 50 });
    };

    const showPreviousImage = () => {
      setSelectedImage((previous) =>
        Math.max(0, previous - 1)
      );
      setZoomActive(false);
    };

    const showNextImage = () => {
      setSelectedImage((previous) =>
        Math.min(allImages.length - 1, previous + 1)
      );
      setZoomActive(false);
    };

    // Close enlarged image with Escape.
    useEffect(() => {
      if (!lightboxOpen) return;

      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          setLightboxOpen(false);
        }

        if (event.key === 'ArrowLeft') {
          showPreviousImage();
        }

        if (event.key === 'ArrowRight') {
          showNextImage();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [lightboxOpen, allImages.length]);

    const handleAddToCart = () => {
      if (!user) {
        error('Please login to add items to your bag');
        navigate('/login', {
          state: { from: `/products/${slug}` },
        });
        return;
      }

      if (sizes.length > 0 && !selectedSize) {
        error('Please select a size to continue');
        return;
      }

      if (colors.length > 0 && !selectedColor) {
        error('Please select a colour');
        return;
      }

      if (selectedVariant && stockToShow < 1) {
        error('This selected variant is out of stock');
        return;
      }

      if (quantity > stockToShow) {
        error(`Only ${stockToShow} pieces are currently available`);
        return;
      }

      addToCart(
        { ...product, selectedSize },
        selectedVariant,
        quantity
      );

      success(
        `${product.name}${
          selectedSize ? ` (Size: ${selectedSize})` : ''
        } added to cart!`
      );
    };

    const toggleWishlist = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        await wishlistAPI.toggle(product.id);
        setWishlisted((previous) => !previous);

        success(
          wishlisted
            ? 'Removed from wishlist'
            : 'Added to wishlist'
        );
      } catch {
        error('Unable to update wishlist');
      }
    };

    const toggleRelatedWishlist = async (productId) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        await wishlistAPI.toggle(productId);

        setRelatedWishlist((previous) =>
          previous.includes(productId)
            ? previous.filter((id) => id !== productId)
            : [...previous, productId]
        );
      } catch {
        error('Unable to update wishlist');
      }
    };

    if (loading) {
      return (
        <div className="page-wrapper">
          <div className="spinner" />
        </div>
      );
    }

    if (!product) {
      return (
        <div
          className="page-wrapper"
          style={{
            textAlign: 'center',
            padding: '120px 20px',
          }}
        >
          <h2>Product not found</h2>

          <Link to="/products">
            <button
              className="btn-gold"
              style={{ marginTop: 24 }}
            >
              BACK TO SHOP
            </button>
          </Link>
        </div>
      );
    }

    return (
      <div className="page-wrapper product-detail-page">
        <div className="breadcrumb">
          <Link to="/">Home</Link> /
          <Link to="/products">Products</Link> /

          {product.category && (
            <>
              <Link to={`/collections/${product.category.slug}`}>
                {product.category.name}
              </Link>{' '}
              /
            </>
          )}

          <span>{product.name}</span>
        </div>

        <div className="pd-grid">
          {/* Product image gallery */}
          <div className="pd-gallery">
            {allImages.length > 1 && (
              <div className="pd-thumbnails">
                {allImages.map((image, index) => (
                  <button
                    key={image.id || `${image.image}-${index}`}
                    type="button"
                    className={`pd-thumb ${
                      selectedImage === index ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedImage(index);
                      setZoomActive(false);
                    }}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <img
                      src={image.image || FALLBACK_IMAGE}
                      alt={image.alt_text || product.name}
                    />
                  </button>
                ))}
              </div>
            )}

            <div
              ref={mainImageRef}
              className={`pd-main-image ${
                zoomActive ? 'pd-zoom-active' : ''
              }`}
              onMouseMove={handleImageMouseMove}
              onMouseEnter={handleImageMouseEnter}
              onMouseLeave={handleImageMouseLeave}
              onClick={() => setLightboxOpen(true)}
            >
              <img
                className="pd-main-product-img"
                src={currentImage}
                alt={product.name}
                style={{
                  transform: zoomActive ? 'scale(1.8)' : 'scale(1)',
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />

              {product.badge && (
                <span className="pd-badge">
                  {product.badge.toUpperCase()}
                </span>
              )}

              <button
                type="button"
                className="pd-zoom-button"
                aria-label="Open enlarged product image"
                title="Click to enlarge"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightboxOpen(true);
                }}
              >
                <ZoomIn size={20} />
              </button>

              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="pd-nav pd-prev"
                    aria-label="Previous image"
                    onClick={(event) => {
                      event.stopPropagation();
                      showPreviousImage();
                    }}
                    disabled={selectedImage === 0}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    className="pd-nav pd-next"
                    aria-label="Next image"
                    onClick={(event) => {
                      event.stopPropagation();
                      showNextImage();
                    }}
                    disabled={selectedImage === allImages.length - 1}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            <p className="pd-zoom-hint">
              <ZoomIn size={14} />
              Hover to zoom or click the image to enlarge
            </p>
          </div>

          {/* Product information */}
          <div className="pd-info">
            {product.category && (
              <Link
                to={`/collections/${product.category.slug}`}
                className="pd-category"
              >
                {product.category.name.toUpperCase()}
              </Link>
            )}

            <h1 className="pd-name">{product.name}</h1>

            {avgRating != null && (
              <div className="pd-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    fill={
                      star <= Math.round(avgRating)
                        ? '#C8A96E'
                        : 'none'
                    }
                    stroke="#C8A96E"
                  />
                ))}

                <span>{avgRating}</span>
              </div>
            )}

            <div className="pd-pricing">
              <span className="pd-price">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>

              {product.original_price && (
                <span className="pd-original">
                  ₹
                  {Number(product.original_price).toLocaleString('en-IN')}
                </span>
              )}

              {product.discount_percent > 0 && (
                <span className="pd-off">
                  {product.discount_percent}% OFF
                </span>
              )}
            </div>

            <p className="pd-description">
              {product.description}
            </p>

            {sizes.length > 0 && (
              <div className="pd-variants-section">
                <p className="pd-variant-label">
                  SIZE
                  {selectedSize ? (
                    <span className="pd-selected-val">
                      {' '}— {selectedSize}
                    </span>
                  ) : (
                    <span className="pd-required">
                      {' '}— Please select *
                    </span>
                  )}
                </p>

                <div className="pd-sizes">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`pd-size-btn ${
                        selectedSize === size ? 'active' : ''
                      }`}
                      onClick={() => {
                        setSelectedSize(
                          selectedSize === size ? '' : size
                        );
                        setQuantity(1);
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {selectedSize && selectedVariant && (
                  <p className="pd-variant-stock">
                    {Number(selectedVariant.stock) > 0
                      ? `${selectedVariant.stock} pieces available`
                      : 'Currently out of stock'}
                  </p>
                )}
              </div>
            )}

            {colors.length > 0 && (
              <div className="pd-variants-section">
                <p className="pd-variant-label">
                  COLOUR
                  {selectedColor && (
                    <span className="pd-selected-val">
                      {' '}— {selectedColor}
                    </span>
                  )}
                </p>

                <div className="pd-colors">
                  {product.variants
                    ?.filter(
                      (variant, index, array) =>
                        array.findIndex(
                          (item) => item.color === variant.color
                        ) === index
                    )
                    .map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        className={`pd-color-btn ${
                          selectedColor === variant.color ? 'active' : ''
                        }`}
                        style={{
                          background: variant.color_hex || '#ccc',
                        }}
                        title={variant.color}
                        aria-label={variant.color}
                        onClick={() =>
                          setSelectedColor(
                            selectedColor === variant.color
                              ? ''
                              : variant.color
                          )
                        }
                      />
                    ))}
                </div>
              </div>
            )}

            {stockToShow <= 0 && (
              <p className="pd-stock out">
                ✗ Out of Stock
              </p>
            )}

            <div className="pd-actions">
              <div className="pd-qty">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                >
                  <Minus size={14} />
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={quantity >= stockToShow}
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(stockToShow, current + 1)
                    )
                  }
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                className="btn-gold pd-add-btn"
                onClick={handleAddToCart}
                disabled={
                  stockToShow <= 0 ||
                  (sizes.length > 0 && !selectedSize) ||
                  (colors.length > 0 && !selectedColor)
                }
              >
                {stockToShow <= 0
                  ? 'OUT OF STOCK'
                  : sizes.length > 0 && !selectedSize
                    ? 'SELECT A SIZE'
                    : colors.length > 0 && !selectedColor
                      ? 'SELECT A COLOUR'
                      : 'ADD TO BAG'}
              </button>

              <button
                type="button"
                className={`pd-wish-btn ${
                  wishlisted ? 'active' : ''
                }`}
                onClick={toggleWishlist}
                aria-label="Toggle wishlist"
              >
                <Heart
                  size={18}
                  fill={wishlisted ? '#7B1B1B' : 'none'}
                />
              </button>
            </div>

            <div className="pd-meta">
              <p>Free shipping on orders above ₹2999</p>
            </div>
          </div>
        </div>

        {/* Enlarged image viewer */}
        {lightboxOpen && (
          <div
            className="pd-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged product image"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              className="pd-lightbox-close"
              aria-label="Close enlarged image"
              onClick={() => setLightboxOpen(false)}
            >
              <X size={26} />
            </button>

            {allImages.length > 1 && (
              <button
                type="button"
                className="pd-lightbox-nav pd-lightbox-prev"
                aria-label="Previous image"
                disabled={selectedImage === 0}
                onClick={(event) => {
                  event.stopPropagation();
                  showPreviousImage();
                }}
              >
                <ChevronLeft size={30} />
              </button>
            )}

            <img
              className="pd-lightbox-image"
              src={currentImage}
              alt={product.name}
              onClick={(event) => event.stopPropagation()}
              onError={(event) => {
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />

            {allImages.length > 1 && (
              <button
                type="button"
                className="pd-lightbox-nav pd-lightbox-next"
                aria-label="Next image"
                disabled={selectedImage === allImages.length - 1}
                onClick={(event) => {
                  event.stopPropagation();
                  showNextImage();
                }}
              >
                <ChevronRight size={30} />
              </button>
            )}

            <span className="pd-lightbox-counter">
              {selectedImage + 1} / {allImages.length}
            </span>
          </div>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="pd-related-section">
            <h2 className="pd-related-heading">
              YOU MAY ALSO LIKE
            </h2>

            <div className="pd-related-grid">
              {relatedProducts.map((item) => (
                <div key={item.id} className="pd-related-card">
                  <Link
                    to={`/products/${item.slug}`}
                    className="pd-related-image-wrap"
                  >
                    <img
                      src={item.primary_image || FALLBACK_IMAGE}
                      alt={item.name}
                      className="pd-related-image"
                      onError={(event) => {
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    <button
                      type="button"
                      className={`pd-related-wish-btn ${
                        relatedWishlist.includes(item.id)
                          ? 'active'
                          : ''
                      }`}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleRelatedWishlist(item.id);
                      }}
                      aria-label="Toggle related product wishlist"
                    >
                      <Heart
                        size={16}
                        fill={
                          relatedWishlist.includes(item.id)
                            ? '#7B1B1B'
                            : 'none'
                        }
                      />
                    </button>
                  </Link>

                  <div className="pd-related-info">
                    <Link to={`/products/${item.slug}`}>
                      <h3 className="pd-related-name">
                        {item.name}
                      </h3>
                    </Link>

                    <div className="pd-related-pricing">
                      <span className="pd-related-price">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>

                      {item.original_price && (
                        <span className="pd-related-original">
                          ₹
                          {Number(item.original_price).toLocaleString(
                            'en-IN'
                          )}
                        </span>
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
