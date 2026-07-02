const BASE_URL = process.env.REACT_APP_API_URL || 'https://nayrafashions-backend.onrender.com/api';

// ─── Token Helpers ───────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// ─── Base Fetch with Auto Token Refresh ─────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${getAccessToken()}`;
      response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    } else {
      clearTokens();
      window.location.href = '/login';
      return null;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.detail || errorData.message || 'API error');
    err.response = { status: response.status, data: errorData };
    throw err;
  }

  if (response.status === 204) return null;
  return response.json();
}

// Multipart form data (for file uploads)
async function apiFetchForm(endpoint, formData, method = 'POST') {
  const token = getAccessToken();
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.detail || errorData.message || 'Upload error');
    err.response = { status: response.status, data: errorData };
    throw err;
  }
  return response.json();
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return true;
  } catch { return false; }
}

// ─── Auth ────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    apiFetch('/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) =>
    apiFetch('/auth/register/', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => { clearTokens(); window.location.href = '/'; },
  getProfile: () => apiFetch('/auth/profile/'),
  updateProfile: (data) =>
    apiFetch('/auth/profile/', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data) =>
    apiFetch('/auth/change-password/', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Products ────────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/products/${query ? '?' + query : ''}`);
  },
  getBySlug: (slug) => apiFetch(`/products/${slug}/`),
  getNewArrivals: () => apiFetch('/products/new_arrivals/'),
  getFeatured: () => apiFetch('/products/featured/'),
  getByCategory: (categorySlug) => apiFetch(`/products/?category__slug=${categorySlug}`),
  search: (query) => apiFetch(`/products/?search=${query}`),
  addReview: (productId, data) =>
    apiFetch(`/products/${productId}/reviews/`, { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  create: (formData) => apiFetchForm('/admin/products/', formData, 'POST'),
  update: (id, formData) => apiFetchForm(`/admin/products/${id}/`, formData, 'PATCH'),
  delete: (id) => apiFetch(`/admin/products/${id}/`, { method: 'DELETE' }),
  toggleActive: (id) => apiFetch(`/admin/products/${id}/toggle_active/`, { method: 'POST' }),
};

// ─── Categories ──────────────────────────────────────────────────
export const categoriesAPI = {
  getAll: () => apiFetch('/categories/'),
  getBySlug: (slug) => apiFetch(`/categories/${slug}/`),
  // Admin
  create: (formData) => apiFetchForm('/admin/categories/', formData, 'POST'),
  update: (id, formData) => apiFetchForm(`/admin/categories/${id}/`, formData, 'PATCH'),
  delete: (id) => apiFetch(`/admin/categories/${id}/`, { method: 'DELETE' }),
};

// ─── Wishlist ─────────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => apiFetch('/wishlist/'),
  toggle: (productId) =>
    apiFetch('/wishlist/', { method: 'POST', body: JSON.stringify({ product_id: productId }) }),
};

// ─── Cart ────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => apiFetch('/cart/'),
  add: (productId, quantity = 1, variantId = null) =>
    apiFetch('/cart/', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity, variant_id: variantId }) }),
  remove: (itemId) =>
    apiFetch('/cart/', { method: 'DELETE', body: JSON.stringify({ item_id: itemId }) }),
};

// ─── Orders ──────────────────────────────────────────────────────
export const ordersAPI = {
  getMyOrders: () => apiFetch('/orders/'),
  getOrder: (id) => apiFetch(`/orders/${id}/`),
  createOrder: (data) =>
    apiFetch('/orders/', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/admin/orders/${query ? '?' + query : ''}`);
  },
  updateStatus: (id, status) =>
    apiFetch(`/admin/orders/${id}/`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// ─── Payments ────────────────────────────────────────────────────
export const paymentsAPI = {
  createRazorpayOrder: (data) =>
    apiFetch('/payments/create-order/', { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (data) =>
    apiFetch('/payments/verify/', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/admin/payments/${query ? '?' + query : ''}`);
  },
};

// ─── Admin ────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => apiFetch('/admin/dashboard/'),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/admin/products/${query ? '?' + query : ''}`);
  },
  createProduct: (formData) => apiFetchForm('/admin/products/', formData, 'POST'),
  updateProduct: (id, formData) => apiFetchForm(`/admin/products/${id}/`, formData, 'PATCH'),
  deleteProduct: (id) => apiFetch(`/admin/products/${id}/`, { method: 'DELETE' }),
  toggleProduct: (id) => apiFetch(`/admin/products/${id}/toggle_active/`, { method: 'POST' }),

  // Customers
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/admin/customers/${query ? '?' + query : ''}`);
  },
  getCustomer: (id) => apiFetch(`/admin/customers/${id}/`),

  // Reviews
  getReviews: () => apiFetch('/admin/reviews/'),
  deleteReview: (id) => apiFetch(`/admin/reviews/${id}/`, { method: 'DELETE' }),
};