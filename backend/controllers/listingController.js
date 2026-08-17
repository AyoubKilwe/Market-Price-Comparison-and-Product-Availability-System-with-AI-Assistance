const Listing = require('../models/Listing');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const asyncHandler = require('../utils/asyncHandler');
const PriceAlert = require('../models/PriceAlert');
const PriceNotification = require('../models/PriceNotification');
const CustomerActivity = require('../models/CustomerActivity');

const getVendorShop = async (vendorId) => Shop.findOne({ vendor: vendorId });

const calculatePriceSummary = (prices) =>
  prices.length
    ? {
        lowest: Math.min(...prices),
        highest: Math.max(...prices),
        average: Number((prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2)),
      }
    : { lowest: null, highest: null, average: null };

const createListing = asyncHandler(async (req, res) => {
  const shop = await getVendorShop(req.user._id);
  if (!shop) return res.status(404).json({ message: 'Create a shop profile first' });
  if (shop.status !== 'Approved') {
    return res.status(403).json({ message: 'Shop must be approved before publishing listings' });
  }

  const product = await Product.findOne({ _id: req.body.product, status: 'Active' });
  if (!product) return res.status(400).json({ message: 'Select an active official product' });

  const listing = await Listing.create({
    shop: shop._id,
    product: product._id,
    price: req.body.price,
    unit: req.body.unit,
    stockStatus: req.body.stockStatus,
    isActive: req.body.isActive ?? true,
    priceHistory: [{ price: req.body.price, stockStatus: req.body.stockStatus, timestamp: new Date() }],
  });

  await listing.populate('product');
  return res.status(201).json({ listing });
});

const getMyListings = asyncHandler(async (req, res) => {
  const shop = await getVendorShop(req.user._id);
  if (!shop) return res.status(404).json({ message: 'Shop profile not found' });

  const listings = await Listing.find({ shop: shop._id })
    .populate('product')
    .sort({ updatedAt: -1 });
  return res.status(200).json({ listings });
});

const updateListing = asyncHandler(async (req, res) => {
  const shop = await getVendorShop(req.user._id);
  if (!shop) return res.status(404).json({ message: 'Shop profile not found' });

  const existing = await Listing.findOne({ _id: req.params.id, shop: shop._id });
  if (!existing) return res.status(404).json({ message: 'Listing not found' });

  const history = existing.priceHistory || [];
  if (existing.price !== req.body.price || existing.stockStatus !== req.body.stockStatus) {
    history.push({ price: req.body.price, stockStatus: req.body.stockStatus, timestamp: new Date() });
  }

  const listing = await Listing.findOneAndUpdate(
    { _id: req.params.id, shop: shop._id },
    {
      price: req.body.price,
      unit: req.body.unit,
      stockStatus: req.body.stockStatus,
      isActive: req.body.isActive,
      priceHistory: history,
    },
    { new: true, runValidators: true }
  ).populate('product');

  if (!listing) return res.status(404).json({ message: 'Listing not found' });

  const priceChanged = existing.price !== listing.price;
  const stockChanged = existing.stockStatus !== listing.stockStatus;
  const availabilityChanged = existing.isActive !== listing.isActive;
  if (priceChanged || stockChanged || availabilityChanged) {
    const subscriptions = await PriceAlert.find({ product: listing.product._id }).select('clientId');
    const parts = [];
    if (priceChanged) parts.push('price ' + (listing.price > existing.price ? 'increased' : 'decreased') + ' from $' + existing.price.toFixed(2) + ' to $' + listing.price.toFixed(2));
    if (stockChanged) parts.push('stock changed from ' + existing.stockStatus + ' to ' + listing.stockStatus);
    if (availabilityChanged) parts.push(listing.isActive ? 'listing is available again' : 'listing is no longer available');
    if (subscriptions.length) await PriceNotification.insertMany(subscriptions.map(({ clientId }) => ({
      clientId, product: listing.product._id, shop: shop._id, listing: listing._id,
      changeType: priceChanged ? (listing.price > existing.price ? 'price_increase' : 'price_decrease') : stockChanged ? 'stock_change' : 'availability_change',
      oldPrice: existing.price, newPrice: listing.price,
      oldStockStatus: existing.stockStatus, newStockStatus: listing.stockStatus,
      message: listing.product.name + ' at ' + shop.shopName + ': ' + parts.join('; ') + '.'
    })));
  }
  return res.status(200).json({ listing });
});

const deleteListing = asyncHandler(async (req, res) => {
  const shop = await getVendorShop(req.user._id);
  if (!shop) return res.status(404).json({ message: 'Shop profile not found' });

  const listing = await Listing.findOneAndDelete({ _id: req.params.id, shop: shop._id });
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  return res.status(200).json({ message: 'Listing deleted' });
});

const getComparisonData = async (productId) => {
  const product = await Product.findOne({ _id: productId, status: 'Active' });
  if (!product) return null;

  const approvedShopIds = await Shop.find({ status: 'Approved' }).distinct('_id');
  const listings = await Listing.find({
    product: product._id,
    shop: { $in: approvedShopIds },
    isActive: true,
  })
    .populate('shop', 'shopName phone address status latitude longitude')
    .sort({ price: 1 });

  const prices = listings.map((listing) => listing.price);
  const summary = calculatePriceSummary(prices);

  return { product, listings, summary };
};

const compareProduct = asyncHandler(async (req, res) => {
  const comparison = await getComparisonData(req.params.productId);
  if (!comparison) return res.status(404).json({ message: 'Active product not found' });
  await CustomerActivity.create({ type: 'compare', product: comparison.product._id });
  return res.status(200).json(comparison);
});


const recordListingView = asyncHandler(async (req, res) => {
  const listing = await Listing.findOne({ _id: req.params.id, isActive: true }).populate('shop', 'status');
  if (!listing || listing.shop?.status !== 'Approved') return res.status(404).json({ message: 'Active listing not found' });
  await CustomerActivity.create({ type: 'view', product: listing.product, shop: listing.shop._id, listing: listing._id, visitorId: req.body.visitorId || '' });
  return res.status(201).json({ recorded: true });
});
// Public landing-page deals: one cheapest active listing per active product,
// restricted to shops that have been approved by an administrator.
const getFeaturedListings = asyncHandler(async (req, res) => {
  const approvedShopIds = await Shop.find({ status: 'Approved' }).distinct('_id');
  const listings = await Listing.find({
    shop: { $in: approvedShopIds },
    isActive: true,
  })
    .populate({ path: 'product', match: { status: 'Active' } })
    .populate('shop', 'shopName phone address')
    .sort({ price: 1, updatedAt: -1 });

  const dealsByProduct = new Map();

  listings.forEach((listing) => {
    if (!listing.product) return;
    const productId = listing.product._id.toString();
    const existing = dealsByProduct.get(productId);

    if (existing) {
      existing.shopCount += 1;
      return;
    }

    dealsByProduct.set(productId, {
      product: listing.product,
      listing,
      shopCount: 1,
    });
  });

  return res.status(200).json({ deals: Array.from(dealsByProduct.values()) });
});

const getShopListings = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ _id: req.params.shopId, status: 'Approved' });
  if (!shop) return res.status(404).json({ message: 'Approved shop not found' });

  const listings = await Listing.find({ shop: shop._id, isActive: true })
    .populate({ path: 'product', match: { status: 'Active' } })
    .sort({ updatedAt: -1 });
  return res.status(200).json({ shop, listings: listings.filter((listing) => listing.product) });
});

const getAllListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find()
    .populate('shop', 'shopName status')
    .populate('product', 'name category status')
    .sort({ updatedAt: -1 });
  return res.status(200).json({ listings });
});

const extractCity = (address) => {
  if (!address) return 'Mogadishu';
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length > 0 && parts[0]) return parts[0];
  return address;
};

module.exports = {
  calculatePriceSummary,
  compareProduct,
  createListing,
  deleteListing,
  getAllListings,
  getComparisonData,
  getFeaturedListings,
  getMyListings,
  getShopListings,
  recordListingView,
  updateListing,
};
