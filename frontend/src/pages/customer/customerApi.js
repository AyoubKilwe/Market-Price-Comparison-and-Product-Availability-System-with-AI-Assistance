import { api } from '../../services/api';

export const customerApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  askAi: (question) => api.post('/api/ai/ask', { question }),
  getProducts: (search = '') =>
    api.get(`/api/products${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getProductListings: (productId) => api.get(`/api/listings/product/${productId}`),
  getApprovedShops: () => api.get('/api/shops'),
  getShopDetails: (shopId) => api.get(`/api/shops/${shopId}`),
};

export default customerApi;
