import { api } from '../../services/api';

export const adminApi = {
  getShops: () => api.get('/api/admin/shops'),
  updateShopStatus: (shopId, status) => api.patch(`/api/shops/${shopId}/status`, { status }),
  getVendors: () => api.get('/api/admin/vendors'),
  updateVendorStatus: (vendorId, status) => api.patch(`/api/admin/vendors/${vendorId}/status`, { status }),
  getListings: () => api.get('/api/admin/listings'),
  getReporting: () => api.get('/api/admin/reporting'),
  getMarketMonitoring: (params) => api.get('/api/admin/market-monitoring', { params }),
  getProducts: () => api.get('/api/products'),
  createProduct: (productData) => api.post('/api/products', productData),
  updateProduct: (id, productData) => api.put(`/api/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
};

export default adminApi;
