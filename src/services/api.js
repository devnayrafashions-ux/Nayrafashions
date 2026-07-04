const BASE_URL = process.env.REACT_APP_API_URL;

if (!BASE_URL && process.env.NODE_ENV === 'production') {
  // Fail loudly instead of silently falling back to localhost in prod.
  throw new Error('REACT_APP_API_URL is not set. Refusing to run in production without it.');
}
const RESOLVED_BASE_URL = BASE_URL || 'https://nayrafashions-backend.onrender.com';

const DEFAULT_TIMEOUT_MS = 15000;

// ─── Auth event bus ──────────────────────────────────────────────
// Instead of hard-redirecting with window.location.href (which blows
// away SPA state), we emit an event. Wire this up once in your router
// root, e.g.:
//   useEffect(() => {
//     const onExpired = () => navigate('/login');
//     window.addEventListener('auth:expired', onExpired);
//     return () => window.removeEventListener('auth:expired', onExpired);
//   }, []);
function emitAuthExpired() {
  window.dispatchEvent(new CustomEvent('auth:expired'));
}

// ─── CSRF helper ─────────────────────────────────────────────────
// Tokens now live in httpOnly cookies set by the backend — no JS
// access to them, and no manual attach/clear needed. The one thing
// JS still needs to read is the (non-httpOnly) CSRF cookie, to echo
// it back on mutating requests.
function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function withCsrfHeader(headers = {}, method = 'GET') {
  const needsCsrf = !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method.toUpperCase());
  if (!needsCsrf) return headers;
  const csrfToken = getCsrfToken();
  return csrfToken ? { ...headers, 'X-CSRFToken': csrfToken } : headers;
}

// ─── Fetch with timeout ──────────────────────────────────────────
async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Request timed out');
      timeoutErr.isTimeout = true;
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ─── De-duped token refresh ──────────────────────────────────────
// Ensures concurrent 401s trigger only one refresh call, not one per
// request.
let refreshPromise = null;
async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      // No body needed — the refresh token cookie is sent
      // automatically (scoped to this path server-side) and the new
      // access/refresh cookies are set directly on the response.
      const res = await fetchWithTimeout(`${RESOLVED_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: withCsrfHeader({ 'Content-Type': 'application/json' }, 'POST'),
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    }
  })();

  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

// ─── Base Fetch with Auto Token Refresh ─────────────────────────
async function apiFetch(endpoint, options = {}) {
  const method = options.method || 'GET';
  const headers = withCsrfHeader(
    { 'Content-Type': 'application/json', ...options.headers },
    method
  );
  const fetchOpts = { ...options, headers, credentials: 'include' };

  let response = await fetchWithTimeout(`${RESOLVED_BASE_URL}${endpoint}`, fetchOpts);

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await fetchWithTimeout(`${RESOLVED_BASE_URL}${endpoint}`, fetchOpts);
    } else {
      emitAuthExpired();
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
  const headers = withCsrfHeader({}, method);
  // Longer timeout for uploads — large files take longer than a
  // normal JSON request.
  const response = await fetchWithTimeout(
    `${RESOLVED_BASE_URL}${endpoint}`,
    { method, headers, body: formData, credentials: 'include' },
    60000
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.detail || errorData.message || 'Upload error');
    err.response = { status: response.status, data: errorData };
    throw err;
  }
  return response.json();
}

// Small helper so every list endpoint encodes params consistently.
function toQueryString(params = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const query = new URLSearchParams(cleaned).toString();
  return query ? `?${query}` : '';
}

// ─── Auth ────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    apiFetch('/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) =>
    apiFetch('/auth/register/', { method: 'POST', body: JSON.stringify(data) }),
  logout: async () => {
    // Backend clears the httpOnly cookies and blacklists the refresh
    // token; we can't clear them from JS since they're not readable.
    try { await apiFetch('/auth/logout/', { method: 'POST' }); }
    finally { emitAuthExpired(); }
  },
  getProfile: () => apiFetch('/auth/profile/'),
  updateProfile: (data) =>
    apiFetch('/auth/profile/', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data) =>
    apiFetch('/auth/change-password/', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Products ────────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params = {}) => apiFetch(`/products/${toQueryString(params)}`),
  getBySlug: (slug) => apiFetch(`/products/${encodeURIComponent(slug)}/`),
  getNewArrivals: () => apiFetch('/products/new_arrivals/'),
  getJewelryAndAccessories: () => apiFetch('/products/jewelry_and_accessories/'),
  getFeatured: () => apiFetch('/products/featured/'),
  getByCategory: (categorySlug) => apiFetch(`/products/${toQueryString({ category__slug: categorySlug })}`),
  search: (query) => apiFetch(`/products/${toQueryString({ search: query })}`),
  addReview: (productId, data) =>
    apiFetch(`/products/${encodeURIComponent(productId)}/reviews/`, { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  create: (formData) => apiFetchForm('/admin/products/', formData, 'POST'),
  update: (id, formData) => apiFetchForm(`/admin/products/${encodeURIComponent(id)}/`, formData, 'PATCH'),
  delete: (id) => apiFetch(`/admin/products/${encodeURIComponent(id)}/`, { method: 'DELETE' }),
  toggleActive: (id) => apiFetch(`/admin/products/${encodeURIComponent(id)}/toggle_active/`, { method: 'POST' }),
};

// ─── Categories ──────────────────────────────────────────────────
export const categoriesAPI = {
  getAll: (params = {}) => apiFetch(`/categories/${toQueryString(params)}`),
  getBySlug: (slug) => apiFetch(`/categories/${encodeURIComponent(slug)}/`),
  // Admin
  create: (formData) => apiFetchForm('/admin/categories/', formData, 'POST'),
  update: (id, formData) => apiFetchForm(`/admin/categories/${encodeURIComponent(id)}/`, formData, 'PATCH'),
  delete: (id) => apiFetch(`/admin/categories/${encodeURIComponent(id)}/`, { method: 'DELETE' }),
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
  getOrder: (id) => apiFetch(`/orders/${encodeURIComponent(id)}/`),
  createOrder: (data) =>
    apiFetch('/orders/', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getAll: (params = {}) => apiFetch(`/admin/orders/${toQueryString(params)}`),
  getOrderAdmin: (id) => apiFetch(`/admin/orders/${encodeURIComponent(id)}/`),
  updateStatus: (id, status, extra = {}) =>
    apiFetch(`/admin/orders/${encodeURIComponent(id)}/`, { method: 'PATCH', body: JSON.stringify({ status, ...extra }) }),
};

// ─── Payments ────────────────────────────────────────────────────
export const paymentsAPI = {
  createRazorpayOrder: (data) =>
    apiFetch('/payments/create-order/', { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (data) =>
    apiFetch('/payments/verify/', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getAll: (params = {}) => apiFetch(`/admin/payments/${toQueryString(params)}`),
};

// ─── Admin ────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => apiFetch('/admin/dashboard/'),

  // Products
  getProducts: (params = {}) => apiFetch(`/admin/products/${toQueryString(params)}`),
  createProduct: (formData) => apiFetchForm('/admin/products/', formData, 'POST'),
  updateProduct: (id, formData) => apiFetchForm(`/admin/products/${encodeURIComponent(id)}/`, formData, 'PATCH'),
  deleteProduct: (id) => apiFetch(`/admin/products/${encodeURIComponent(id)}/`, { method: 'DELETE' }),
  toggleProduct: (id) => apiFetch(`/admin/products/${encodeURIComponent(id)}/toggle_active/`, { method: 'POST' }),

  // Customers
  getCustomers: (params = {}) => apiFetch(`/admin/customers/${toQueryString(params)}`),
  getCustomer: (id) => apiFetch(`/admin/customers/${encodeURIComponent(id)}/`),

  // Reviews
  getReviews: () => apiFetch('/admin/reviews/'),
  deleteReview: (id) => apiFetch(`/admin/reviews/${encodeURIComponent(id)}/`, { method: 'DELETE' }),
};