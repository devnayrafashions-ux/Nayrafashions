
import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  X,
  Image as ImageIcon,
} from 'lucide-react';

import { adminAPI, categoriesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const PRODUCT_TYPES = [
  { value: 'dress', label: 'Dress' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'hair_accessory', label: 'Hair Accessory' },
];

const typeLabel = (value) =>
  PRODUCT_TYPES.find((type) => type.value === value)?.label || value || '-';

const emptyForm = {
  product_type: 'dress',
  name: '',
  description: '',
  price: '',
  original_price: '',
  category: '',
  badge: '',
  stock: '',
  is_active: true,
  is_budget_friendly: false,
  is_own_brand: false,
  sizes: [],
};

const BOOLEAN_FIELDS = [
  'is_active',
  'is_budget_friendly',
  'is_own_brand',
];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [sizeStock, setSizeStock] = useState({});
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  const fetchProducts = useCallback(() => {
    setLoading(true);

    adminAPI
      .getProducts({ search, page_size: 50 })
      .then((data) => {
        setProducts(
          Array.isArray(data) ? data : data.results || []
        );
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    categoriesAPI
      .getAll()
      .then((data) => {
        setCategories(
          Array.isArray(data) ? data : data.results || []
        );
      })
      .catch(() => {});
  }, []);

  const getProductSizes = (product) => {
    const sizesFromField = Array.isArray(product?.sizes)
      ? product.sizes
          .map((item) =>
            typeof item === 'object' && item !== null ? item.size : item
          )
          .filter(Boolean)
      : [];

    // Some API responses may expose sizes only through variants.
    const sizesFromVariants = Array.isArray(product?.variants)
      ? product.variants.map((variant) => variant?.size).filter(Boolean)
      : [];

    return [...new Set([...sizesFromField, ...sizesFromVariants])];
  };

  const getVariantStock = (product) => {
    const stockMap = {};

    // Preferred source: actual ProductVariant rows returned by the API.
    (Array.isArray(product?.variants) ? product.variants : []).forEach((variant) => {
      if (variant?.size) {
        stockMap[variant.size] = Number(variant.stock ?? 0);
      }
    });

    // Fallback for APIs that serialize sizes as [{ size, stock }, ...].
    if (Array.isArray(product?.sizes)) {
      product.sizes.forEach((item) => {
        if (item && typeof item === 'object' && item.size) {
          stockMap[item.size] = Number(item.stock ?? stockMap[item.size] ?? 0);
        }
      });
    }

    return stockMap;
  };

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditProduct(null);
    setImageFiles([]);
    setSizeStock({});
    setShowModal(true);
  };

  const openEdit = (product) => {
    const categoryId =
      product.category?.id || product.category || '';

    const matchedCategory = categories.find(
      (category) => String(category.id) === String(categoryId)
    );

    const inferredType =
      product.product_type ||
      matchedCategory?.product_type ||
      'dress';

    const sizes = getProductSizes(product);

    setForm({
      product_type: inferredType,
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      original_price: product.original_price ?? '',
      category: categoryId,
      badge: product.badge || '',
      stock: product.stock ?? 0,
      is_active: Boolean(product.is_active),
      is_budget_friendly: Boolean(product.is_budget_friendly),
      is_own_brand: Boolean(product.is_own_brand),
      sizes,
    });

    setSizeStock(getVariantStock(product));
    setEditProduct(product);
    setImageFiles([]);
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditProduct(null);
    setImageFiles([]);
  };

  const changeProductType = (nextType) => {
    setForm((previous) => ({
      ...previous,
      product_type: nextType,
      category: '',
      sizes: nextType === 'dress' ? previous.sizes : [],
      stock:
        nextType === 'dress'
          ? previous.stock
          : previous.stock,
    }));
  };

  const toggleSize = (size) => {
    setForm((previous) => {
      const currentSizes = previous.sizes || [];

      const updatedSizes = currentSizes.includes(size)
        ? currentSizes.filter((item) => item !== size)
        : [...currentSizes, size];

      return {
        ...previous,
        sizes: updatedSizes,
      };
    });

    setSizeStock((previous) => ({
      ...previous,
      [size]: previous[size] ?? 0,
    }));
  };

  const updateSizeStock = (size, value) => {
    const parsedValue =
      value === '' ? '' : Math.max(0, Number(value));

    setSizeStock((previous) => ({
      ...previous,
      [size]: parsedValue,
    }));
  };

  const selectedSizeStockTotal = (form.sizes || []).reduce(
    (total, size) => {
      const stock = Number(sizeStock[size] ?? 0);
      return total + (Number.isFinite(stock) ? stock : 0);
    },
    0
  );

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    setImageFiles(files);

    // Allow selecting the same files again after clearing.
    event.target.value = '';
  };

  const removeSelectedImage = (indexToRemove) => {
    setImageFiles((previous) =>
      previous.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    if (!form.name.trim()) {
      error('Please enter a product name.');
      return;
    }

    if (form.price === '' || Number(form.price) < 0) {
      error('Please enter a valid product price.');
      return;
    }

    if (
      form.product_type === 'dress' &&
      form.sizes.length > 0
    ) {
      for (const size of form.sizes) {
        const value = sizeStock[size];

        if (
          value === '' ||
          value === undefined ||
          !Number.isInteger(Number(value)) ||
          Number(value) < 0
        ) {
          error(`Enter a valid stock quantity for size ${size}.`);
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === 'sizes' || key === 'product_type') return;

        if (key === 'stock' && form.product_type === 'dress') {
          return;
        }

        if (BOOLEAN_FIELDS.includes(key)) {
          formData.append(key, value ? 'true' : 'false');
          return;
        }

        if (value !== '' && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const sizesToSend =
        form.product_type === 'dress' ? form.sizes : [];

      formData.append('sizes', JSON.stringify(sizesToSend));

      if (form.product_type === 'dress') {
        const variantsToSend = sizesToSend.map((size) => ({
          size,
          stock: Number(sizeStock[size] ?? 0),
        }));

        formData.append(
          'variants',
          JSON.stringify(variantsToSend)
        );

        // The backend recalculates Product.stock from its variants.
        formData.append('stock', String(selectedSizeStockTotal));
      } else {
        formData.append('stock', String(Number(form.stock || 0)));
      }

      // Use the plural "images" field for multiple uploaded files.
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      if (editProduct) {
        await adminAPI.updateProduct(editProduct.id, formData);
        success('Product updated successfully.');
      } else {
        await adminAPI.createProduct(formData);
        success('Product created successfully.');
      }

      setShowModal(false);
      setEditProduct(null);
      setImageFiles([]);
      fetchProducts();
    } catch (err) {
      error(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      await adminAPI.deleteProduct(id);
      success('Product deleted successfully.');
      fetchProducts();
    } catch (err) {
      error(err.message || 'Failed to delete product.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleProduct(id);
      success('Product status updated.');
      fetchProducts();
    } catch (err) {
      error(err.message || 'Failed to update product status.');
    }
  };

  const categoriesForType = categories.filter(
    (category) => category.product_type === form.product_type
  );

  const visibleProducts =
    typeFilter === 'all'
      ? products
      : products.filter(
          (product) => product.product_type === typeFilter
        );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Products</h1>
          <p>{products.length} total products</p>
        </div>

        <button
          type="button"
          className="admin-btn-primary"
          onClick={openAdd}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div
        className="admin-tabs"
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        {[{ value: 'all', label: 'All' }, ...PRODUCT_TYPES].map(
          (type) => (
            <button
              type="button"
              key={type.value}
              onClick={() => setTypeFilter(type.value)}
              className={
                typeFilter === type.value
                  ? 'admin-btn-primary'
                  : 'admin-btn-secondary'
              }
            >
              {type.label}
            </button>
          )
        )}
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={15} />

            <input
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p className="admin-loading">Loading...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Collections</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Sizes</th>
                  <th>Badge</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <img
                          src={
                            product.primary_image ||
                            'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=60&q=80'
                          }
                          alt={product.name}
                        />

                        <span>{product.name}</span>
                      </div>
                    </td>

                    <td>{typeLabel(product.product_type)}</td>

                    <td>{product.category_name || '-'}</td>

                    <td>
                      {product.is_budget_friendly ||
                      product.is_own_brand
                        ? [
                            product.is_budget_friendly
                              ? 'Budget Friendly'
                              : null,
                            product.is_own_brand
                              ? 'Own Brand'
                              : null,
                          ]
                            .filter(Boolean)
                            .join(', ')
                        : '-'}
                    </td>

                    <td>
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </td>

                    <td>{Number(product.stock ?? 0)}</td>

                    <td>
                      {product.product_type === 'dress' &&
                      getProductSizes(product).length > 0
                        ? getProductSizes(product)
                            .map((size) => `${size}: ${getVariantStock(product)[size] ?? 0}`)
                            .join(', ')
                        : '-'}
                    </td>

                    <td>
                      {product.badge ? (
                        <span className="admin-badge">
                          {product.badge}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="toggle-btn"
                        aria-label={
                          product.is_active
                            ? 'Deactivate product'
                            : 'Activate product'
                        }
                        onClick={() => handleToggle(product.id)}
                      >
                        {product.is_active ? (
                          <ToggleRight
                            size={22}
                            color="#2C5F2E"
                          />
                        ) : (
                          <ToggleLeft
                            size={22}
                            color="#999"
                          />
                        )}
                      </button>
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          type="button"
                          className="action-btn edit"
                          aria-label="Edit product"
                          onClick={() => openEdit(product)}
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          className="action-btn delete"
                          aria-label="Delete product"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {visibleProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      style={{ textAlign: 'center', padding: 24 }}
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="admin-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2>
                {editProduct ? 'Edit Product' : 'Add Product'}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form
              className="admin-form"
              onSubmit={handleSubmit}
            >
              <div className="admin-form-group">
                <label>Product Type *</label>

                <select
                  required
                  value={form.product_type}
                  onChange={(event) =>
                    changeProductType(event.target.value)
                  }
                >
                  {PRODUCT_TYPES.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
                <div className="admin-form-group">
                  <label>Product Name *</label>

                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Silk Kurta Set"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Category</label>

                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        category: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select category</option>

                    {categoriesForType.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {categoriesForType.length === 0 && (
                    <p
                      style={{
                        fontSize: 12,
                        color: '#999',
                        marginTop: 4,
                      }}
                    >
                      No {typeLabel(form.product_type)} categories
                      yet. Add one under Categories first.
                    </p>
                  )}
                </div>
              </div>

              <div className="admin-form-group">
                <label>Description</label>

                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Product description..."
                />
              </div>

              <div className="form-row-2">
                <div className="admin-form-group">
                  <label>Price (₹) *</label>

                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={form.price}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        price: event.target.value,
                      }))
                    }
                    placeholder="2499"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Original Price (₹)</label>

                  <input
                    min="0"
                    step="0.01"
                    type="number"
                    value={form.original_price}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        original_price: event.target.value,
                      }))
                    }
                    placeholder="3499"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="admin-form-group">
                  <label>
                    {form.product_type === 'dress'
                      ? 'Total Stock (calculated)'
                      : 'Stock'}
                  </label>

                  {form.product_type === 'dress' ? (
                    <>
                      <input
                        type="number"
                        value={selectedSizeStockTotal}
                        readOnly
                      />

                      <p
                        style={{
                          fontSize: 12,
                          color: '#777',
                          marginTop: 4,
                        }}
                      >
                        Calculated from the stock quantities entered
                        for selected sizes.
                      </p>
                    </>
                  ) : (
                    <input
                      min="0"
                      step="1"
                      type="number"
                      value={form.stock}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          stock: event.target.value,
                        }))
                      }
                      placeholder="100"
                    />
                  )}
                </div>

                <div className="admin-form-group">
                  <label>Badge</label>

                  <select
                    value={form.badge}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        badge: event.target.value,
                      }))
                    }
                  >
                    <option value="">None</option>
                    <option value="new">New</option>
                    <option value="bestseller">Bestseller</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Also show in collections</label>

                <div className="admin-form-check">
                  <input
                    type="checkbox"
                    id="is_budget_friendly"
                    checked={form.is_budget_friendly}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        is_budget_friendly: event.target.checked,
                      }))
                    }
                  />

                  <label
                    htmlFor="is_budget_friendly"
                    style={{
                      textTransform: 'none',
                      letterSpacing: 0,
                      fontSize: 13,
                      fontWeight: 400,
                    }}
                  >
                    Budget Friendly
                  </label>
                </div>

                <div className="admin-form-check">
                  <input
                    type="checkbox"
                    id="is_own_brand"
                    checked={form.is_own_brand}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        is_own_brand: event.target.checked,
                      }))
                    }
                  />

                  <label
                    htmlFor="is_own_brand"
                    style={{
                      textTransform: 'none',
                      letterSpacing: 0,
                      fontSize: 13,
                      fontWeight: 400,
                    }}
                  >
                    Own Brand
                  </label>
                </div>
              </div>

              {form.product_type === 'dress' && (
                <div className="admin-form-group">
                  <label>Available Sizes & Stock</label>

                  <p
                    style={{
                      fontSize: 12,
                      color: '#777',
                      marginTop: 4,
                      marginBottom: 10,
                    }}
                  >
                    Select each available size and enter the number
                    of pieces in stock for that size.
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(125px, 1fr))',
                      gap: 10,
                    }}
                  >
                    {ALL_SIZES.map((size) => {
                      const selected =
                        (form.sizes || []).includes(size);

                      return (
                        <div
                          key={size}
                          style={{
                            border: `1px solid ${
                              selected ? '#7B1B1B' : '#ddd'
                            }`,
                            borderRadius: 6,
                            padding: 10,
                            background: selected
                              ? '#fff9f9'
                              : '#fff',
                          }}
                        >
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 7,
                              cursor: 'pointer',
                              marginBottom: selected ? 8 : 0,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleSize(size)}
                            />

                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: selected ? 600 : 400,
                              }}
                            >
                              {size}
                            </span>
                          </label>

                          {selected && (
                            <>
                              <label
                                style={{
                                  display: 'block',
                                  fontSize: 11,
                                  marginBottom: 4,
                                  color: '#666',
                                }}
                              >
                                Pieces in stock
                              </label>

                              <input
                                type="number"
                                min="0"
                                step="1"
                                required
                                value={sizeStock[size] ?? 0}
                                onChange={(event) =>
                                  updateSizeStock(
                                    size,
                                    event.target.value
                                  )
                                }
                                style={{ width: '100%' }}
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {form.sizes.length === 0 && (
                    <p
                      style={{
                        fontSize: 12,
                        color: '#999',
                        marginTop: 8,
                      }}
                    >
                      No sizes selected.
                    </p>
                  )}

                  <p
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Total selected stock: {selectedSizeStockTotal}
                  </p>
                </div>
              )}

              <div className="admin-form-group">
                <label>Product Images</label>

                <p
                  style={{
                    fontSize: 12,
                    color: '#777',
                    marginTop: 4,
                    marginBottom: 8,
                  }}
                >
                  Select multiple images at once. When editing, new
                  images are added to the existing gallery.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />

                {imageFiles.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(90px, 1fr))',
                      gap: 10,
                      marginTop: 12,
                    }}
                  >
                    {imageFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        style={{
                          position: 'relative',
                          border: '1px solid #eee',
                          borderRadius: 6,
                          padding: 5,
                        }}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          style={{
                            display: 'block',
                            width: '100%',
                            height: 90,
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => removeSelectedImage(index)}
                          aria-label={`Remove ${file.name}`}
                          style={{
                            position: 'absolute',
                            top: 7,
                            right: 7,
                            width: 24,
                            height: 24,
                            border: 'none',
                            borderRadius: '50%',
                            background: '#fff',
                            cursor: 'pointer',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <X size={14} />
                        </button>

                        <p
                          style={{
                            fontSize: 10,
                            margin: '5px 0 0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {editProduct &&
                  (editProduct.images || []).length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <label>Currently saved images</label>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 10,
                          marginTop: 8,
                        }}
                      >
                        {editProduct.images.map((image) => (
                          <div
                            key={image.id || image.image}
                            style={{
                              width: 85,
                              textAlign: 'center',
                            }}
                          >
                            {image.image ? (
                              <img
                                src={image.image}
                                alt={image.alt_text || editProduct.name}
                                style={{
                                  width: 85,
                                  height: 85,
                                  objectFit: 'cover',
                                  borderRadius: 5,
                                  border: image.is_primary
                                    ? '2px solid #7B1B1B'
                                    : '1px solid #ddd',
                                }}
                              />
                            ) : (
                              <ImageIcon size={32} />
                            )}

                            <span
                              style={{
                                display: 'block',
                                fontSize: 10,
                                marginTop: 4,
                                color: image.is_primary
                                  ? '#7B1B1B'
                                  : '#777',
                              }}
                            >
                              {image.is_primary ? 'Primary' : 'Saved'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="admin-form-check">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      is_active: event.target.checked,
                    }))
                  }
                />

                <label htmlFor="is_active">
                  Active (visible on store)
                </label>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving...'
                    : editProduct
                      ? 'Update Product'
                      : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
