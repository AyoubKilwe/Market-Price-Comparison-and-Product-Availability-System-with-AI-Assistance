import { api } from '../../services/api';

export const vendorApi = {
  getMyShop: () => api.get('/api/shops/my-shop'),
  createShop: (shopData) => api.post('/api/shops', shopData),
  updateShop: (shopData) => api.put('/api/shops/my-shop', shopData),
  getMyListings: () => api.get('/api/listings/my-listings'),
  getInsights: (days = 30) => api.get(`/api/shops/my-shop/insights?days=${days}`),
  createListing: (listingData) => api.post('/api/listings', listingData),
  updateListing: (id, listingData) => api.put(`/api/listings/${id}`, listingData),
  deleteListing: (id) => api.delete(`/api/listings/${id}`),
  getOfficialProducts: () => api.get('/api/products'),
  changePassword: (passwordData) => api.patch('/api/auth/change-password', passwordData),
};

export default vendorApi;
