const Listing = require('../models/Listing');
const Shop = require('../models/Shop');
const asyncHandler = require('../utils/asyncHandler');
const CustomerActivity = require('../models/CustomerActivity');

const createShop = asyncHandler(async (req, res) => {
  const existingShop = await Shop.findOne({ vendor: req.user._id });
  if (existingShop) return res.status(409).json({ message: 'Vendor already has a shop' });

  const shop = await Shop.create({ ...req.body, vendor: req.user._id, status: 'Pending' });
  return res.status(201).json({ shop });
});

const getApprovedShops = asyncHandler(async (req, res) => {
  const shopIdsWithActiveListings = await Listing.find({ isActive: true }).distinct('shop');
  const shops = await Shop.find({ status: 'Approved', _id: { $in: shopIdsWithActiveListings } }).sort({ shopName: 1 });
  return res.status(200).json({ shops });
});

const getShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ _id: req.params.id, status: 'Approved' });
  if (!shop) return res.status(404).json({ message: 'Approved shop not found' });

  const listings = await Listing.find({ shop: shop._id, isActive: true })
    .populate({ path: 'product', match: { status: 'Active' } })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    shop,
    listings: listings.filter((listing) => listing.product),
  });
});


const recordShopVisit = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ _id: req.params.id, status: 'Approved' }).select('_id');
  if (!shop) return res.status(404).json({ message: 'Approved shop not found' });
  await CustomerActivity.create({ type: 'shop_view', shop: shop._id, visitorId: req.body.visitorId || '' });
  return res.status(201).json({ recorded: true });
});

const getMyShopInsights = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ vendor: req.user._id }).select('_id shopName');
  if (!shop) return res.status(404).json({ message: 'Shop profile not found' });
  const requestedDays = Number(req.query.days);
  const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30;
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - days + 1);
  const match = { shop: shop._id, createdAt: { $gte: since } };
  const [totals, dailyRows, productRows] = await Promise.all([
    CustomerActivity.aggregate([
      { $match: match },
      { $group: { _id: null, shopVisits: { $sum: { $cond: [{ $eq: ['$type', 'shop_view'] }, 1, 0] } }, productViews: { $sum: { $cond: [{ $eq: ['$type', 'view'] }, 1, 0] } }, visitors: { $addToSet: { $cond: [{ $ne: ['$visitorId', ''] }, '$visitorId', '$$REMOVE'] } } } },
      { $project: { _id: 0, shopVisits: 1, productViews: 1, uniqueVisitors: { $size: '$visitors' } } },
    ]),
    CustomerActivity.aggregate([
      { $match: match },
      { $group: { _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, type: '$type' }, count: { $sum: 1 } } },
      { $sort: { '_id.date': 1 } },
    ]),
    CustomerActivity.aggregate([
      { $match: { ...match, type: 'view', product: { $ne: null } } },
      { $group: { _id: '$product', views: { $sum: 1 }, visitors: { $addToSet: '$visitorId' }, lastViewedAt: { $max: '$createdAt' } } },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { _id: 0, productId: '$_id', name: '$product.name', category: '$product.category', image: '$product.image', views: 1, uniqueVisitors: { $size: { $setDifference: ['$visitors', ['']] } }, lastViewedAt: 1 } },
      { $sort: { views: -1, name: 1 } },
    ]),
  ]);
  const dailyMap = new Map();
  dailyRows.forEach((row) => {
    const current = dailyMap.get(row._id.date) || { date: row._id.date, shopVisits: 0, productViews: 0 };
    if (row._id.type === 'shop_view') current.shopVisits = row.count;
    if (row._id.type === 'view') current.productViews = row.count;
    dailyMap.set(row._id.date, current);
  });
  const daily = Array.from({ length: days }, (_, index) => {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return dailyMap.get(key) || { date: key, shopVisits: 0, productViews: 0 };
  });
  return res.json({ shop: { _id: shop._id, shopName: shop.shopName }, days, summary: totals[0] || { shopVisits: 0, productViews: 0, uniqueVisitors: 0 }, daily, products: productRows });
});
const getMyShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ vendor: req.user._id });
  if (!shop) return res.status(404).json({ message: 'Shop profile not found' });
  return res.status(200).json({ shop });
});

const updateMyShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findOneAndUpdate(
    { vendor: req.user._id },
    {
      shopName: req.body.shopName,
      phone: req.body.phone,
      address: req.body.address,
      image: req.body.image || '',
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    },
    { new: true, runValidators: true }
  );
  if (!shop) return res.status(404).json({ message: 'Shop profile not found' });
  return res.status(200).json({ shop });
});

const updateShopStatus = asyncHandler(async (req, res) => {
  const shop = await Shop.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  ).populate('vendor', 'name email phone status');
  if (!shop) return res.status(404).json({ message: 'Shop not found' });
  return res.status(200).json({ shop });
});

const getAllShops = asyncHandler(async (req, res) => {
  const shops = await Shop.find()
    .populate('vendor', 'name email phone status')
    .sort({ createdAt: -1 });
  return res.status(200).json({ shops });
});

const User = require('../models/User');
const Product = require('../models/Product');

const getReportingStats = asyncHandler(async (req, res) => {
  const [
    totalProducts,
    totalShops,
    approvedShops,
    pendingShops,
    totalVendors,
    activeVendors,
    suspendedVendors,
    totalListings,
    activeListings,
    shopsList,
  ] = await Promise.all([
    Product.countDocuments(),
    Shop.countDocuments(),
    Shop.countDocuments({ status: 'Approved' }),
    Shop.countDocuments({ status: 'Pending' }),
    User.countDocuments({ role: 'Vendor' }),
    User.countDocuments({ role: 'Vendor', status: 'Active' }),
    User.countDocuments({ role: 'Vendor', status: 'Suspended' }),
    Listing.countDocuments(),
    Listing.countDocuments({ isActive: true }),
    Shop.find().populate('vendor', 'name email').sort({ createdAt: -1 }),
  ]);

  return res.status(200).json({
    stats: {
      totalProducts,
      totalShops,
      approvedShops,
      pendingShops,
      totalVendors,
      activeVendors,
      suspendedVendors,
      totalListings,
      activeListings,
    },
    shops: shopsList,
  });
});

module.exports = {
  createShop,
  getAllShops,
  getApprovedShops,
  getMyShop,
  getMyShopInsights,
  getReportingStats,
  getShop,
  recordShopVisit,
  updateMyShop,
  updateShopStatus,
};
