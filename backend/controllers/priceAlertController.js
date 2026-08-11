const PriceAlert = require('../models/PriceAlert');
const PriceNotification = require('../models/PriceNotification');
const Product = require('../models/Product');
const Listing = require('../models/Listing');
const Shop = require('../models/Shop');
const asyncHandler = require('../utils/asyncHandler');

const clientId = (req) => req.get('x-marketeye-client-id').trim();

const listAlerts = asyncHandler(async (req, res) => {
  const alerts = await PriceAlert.find({ clientId: clientId(req) }).populate('product').sort({ createdAt: -1 });
  const productIds = alerts.map((item) => item.product?._id).filter(Boolean);
  const approvedShopIds = await Shop.find({ status: 'Approved' }).distinct('_id');
  const listings = await Listing.find({ product: { $in: productIds }, shop: { $in: approvedShopIds }, isActive: true })
    .populate('shop', 'shopName').sort({ price: 1 });
  const cheapest = new Map();
  listings.forEach((listing) => {
    const id = listing.product.toString();
    if (!cheapest.has(id)) cheapest.set(id, listing);
  });
  return res.json({ alerts: alerts.filter((item) => item.product).map((item) => ({
    _id: item._id, product: item.product, createdAt: item.createdAt,
    currentListing: cheapest.get(item.product._id.toString()) || null,
  })) });
});

const createAlert = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.body.productId, status: 'Active' });
  if (!product) return res.status(404).json({ message: 'Active product not found' });
  const alert = await PriceAlert.findOneAndUpdate(
    { clientId: clientId(req), product: product._id },
    { $setOnInsert: { clientId: clientId(req), product: product._id } },
    { new: true, upsert: true, runValidators: true }
  ).populate('product');
  return res.status(201).json({ alert });
});

const removeAlert = asyncHandler(async (req, res) => {
  await PriceAlert.deleteOne({ clientId: clientId(req), product: req.params.productId });
  return res.json({ message: 'Price alert removed' });
});

const listNotifications = asyncHandler(async (req, res) => {
  const id = clientId(req);
  const notifications = await PriceNotification.find({ clientId: id })
    .populate('product', 'name image category unit').populate('shop', 'shopName').sort({ createdAt: -1 }).limit(100);
  const unreadCount = await PriceNotification.countDocuments({ clientId: id, isRead: false });
  return res.json({ notifications, unreadCount });
});

const markNotificationsRead = asyncHandler(async (req, res) => {
  await PriceNotification.updateMany({ clientId: clientId(req), isRead: false }, { isRead: true });
  return res.json({ message: 'Notifications marked as read', unreadCount: 0 });
});

module.exports = { createAlert, listAlerts, listNotifications, markNotificationsRead, removeAlert };
