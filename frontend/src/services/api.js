const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const token = localStorage.getItem('marketeye_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  get: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'DELETE' }),
};

// Admin API Services
export const adminApi = {
  getShops: () => api.get('/api/admin/shops'),
  updateShopStatus: (shopId, status) => api.patch(`/api/shops/${shopId}/status`, { status }),
  getVendors: () => api.get('/api/admin/vendors'),
  updateVendorStatus: (vendorId, status) => api.patch(`/api/admin/vendors/${vendorId}/status`, { status }),
  getListings: () => api.get('/api/admin/listings'),
  getReporting: () => api.get('/api/admin/reporting'),
  getProducts: () => api.get('/api/products'),
  createProduct: (productData) => api.post('/api/products', productData),
  updateProduct: (id, productData) => api.put(`/api/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
};

// Vendor API Services
export const vendorApi = {
  getMyShop: () => api.get('/api/shops/my-shop'),
  createShop: (shopData) => api.post('/api/shops', shopData),
  updateShop: (shopData) => api.put('/api/shops/my-shop', shopData),
  getMyListings: () => api.get('/api/listings/my-listings'),
  createListing: (listingData) => api.post('/api/listings', listingData),
  updateListing: (id, listingData) => api.put(`/api/listings/${id}`, listingData),
  deleteListing: (id) => api.delete(`/api/listings/${id}`),
};

// Customer / Auth / Public API Services
export const customerApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  askAi: (question) => api.post('/api/ai/ask', { question }),
  getProducts: (search = '') => api.get(`/api/products${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getProductListings: (productId) => api.get(`/api/listings/product/${productId}`),
  getFeaturedListings: () => api.get('/api/listings/featured'),
  getApprovedShops: () => api.get('/api/shops'),
  getShopDetails: (shopId) => api.get(`/api/shops/${shopId}`),
};

export default api;
