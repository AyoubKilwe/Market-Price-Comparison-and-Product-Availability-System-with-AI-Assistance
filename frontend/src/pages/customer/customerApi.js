import { api } from '../../services/api';

export const customerApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  askAi: (question) => api.post('/api/ai/ask', { question }),
  getProduct: (productId) => api.get(`/api/products/${productId}`),
  getProducts: (search = '') =>
    api.get(`/api/products${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getProductListings: (productId) => api.get(`/api/listings/product/${productId}`),
  getFeaturedListings: () => api.get('/api/listings/featured'),
  getApprovedShops: () => api.get('/api/shops'),
  getShopDetails: (shopId) => api.get(`/api/shops/${shopId}`),
  recordShopVisit: (shopId, visitorId) => api.post(`/api/shops/${shopId}/visit`, { visitorId }),
  recordListingView: (listingId, visitorId) => api.post(`/api/listings/${listingId}/view`, { visitorId }),
};

export default customerApi;
