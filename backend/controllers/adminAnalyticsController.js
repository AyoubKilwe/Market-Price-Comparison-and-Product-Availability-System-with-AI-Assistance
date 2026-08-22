const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Listing = require('../models/Listing');
const CustomerActivity = require('../models/CustomerActivity');
const asyncHandler = require('../utils/asyncHandler');

const topActivity = (type, field = 'product') => CustomerActivity.aggregate([
  { $match: { type, [field]: { $ne: field === 'query' ? '' : null } } },
  { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  { $sort: { count: -1 } }, { $limit: 10 },
  ...(field === 'product' ? [{ $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } }, { $unwind: '$product' }, { $project: { _id: 0, productId: '$_id', label: '$product.name', count: 1 } }] : [{ $project: { _id: 0, label: '$_id', count: 1 } }]),
]);

const getAnalytics = asyncHandler(async (req, res) => {
  const [totalVendors, totalShops, totalProducts, totalListings, totalSearches, vendorStatuses, shopStatuses, availability, mostSearchedProducts, mostComparedProducts, popularSearches, mostViewedProducts, listings, shops] = await Promise.all([
    User.countDocuments({ role: 'Vendor' }), Shop.countDocuments(), Product.countDocuments(), Listing.countDocuments(), CustomerActivity.countDocuments({ type: 'search' }),
    User.aggregate([{ $match: { role: 'Vendor' } }, { $group: { _id: '$status', value: { $sum: 1 } } }]),
    Shop.aggregate([{ $group: { _id: '$status', value: { $sum: 1 } } }]),
    Listing.aggregate([{ $group: { _id: '$stockStatus', value: { $sum: 1 } } }]),
    topActivity('search'), topActivity('compare'), topActivity('search', 'query'), topActivity('view'),
    Listing.find().populate('product', 'name').populate('shop', 'shopName').lean(),
    Shop.find().populate('vendor', 'name status').lean(),
  ]);

  const prices = listings.map((item) => item.price).filter(Number.isFinite);
  const history = listings.flatMap((item) => (item.priceHistory || []).map((entry) => ({ date: entry.timestamp, price: entry.price })))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const daily = new Map();
  history.forEach(({ date, price }) => { const key = new Date(date).toISOString().slice(0, 10); const row = daily.get(key) || { total: 0, count: 0 }; row.total += price; row.count += 1; daily.set(key, row); });
  const shopPerformance = shops.map((shop) => {
    const own = listings.filter((listing) => listing.shop?._id?.toString() === shop._id.toString());
    return { _id: shop._id, shopName: shop.shopName, vendor: shop.vendor?.name || '—', status: shop.status, listings: own.length, activeListings: own.filter((item) => item.isActive).length, availableListings: own.filter((item) => item.isActive && item.stockStatus !== 'Out of Stock').length, averagePrice: own.length ? Number((own.reduce((sum, item) => sum + item.price, 0) / own.length).toFixed(2)) : null };
  }).sort((a, b) => b.activeListings - a.activeListings);

  const active = vendorStatuses.find((row) => row._id === 'Active')?.value || 0;
  const pendingVendorIds = new Set(shops.filter((shop) => shop.status === 'Pending').map((shop) => shop.vendor?._id?.toString()).filter(Boolean));
  return res.json({
    generatedAt: new Date(), overview: { totalVendors, totalShops, totalProducts, totalListings, totalSearches },
    products: { mostSearched: mostSearchedProducts, mostCompared: mostComparedProducts, availability: availability.map((row) => ({ label: row._id, value: row.value })) },
    prices: { lowest: prices.length ? Math.min(...prices) : null, highest: prices.length ? Math.max(...prices) : null, timeline: Array.from(daily, ([label, row]) => ({ label, value: Number((row.total / row.count).toFixed(2)) })).slice(-30) },
    vendors: { statuses: [{ label: 'Approved / Active', value: active }, { label: 'Pending approval', value: pendingVendorIds.size }, { label: 'Suspended', value: vendorStatuses.find((row) => row._id === 'Suspended')?.value || 0 }] },
    shops: { statuses: shopStatuses.map((row) => ({ label: row._id, value: row.value })), performance: shopPerformance },
    customers: { popularSearches, mostViewedProducts },
  });
});

module.exports = { getAnalytics };
