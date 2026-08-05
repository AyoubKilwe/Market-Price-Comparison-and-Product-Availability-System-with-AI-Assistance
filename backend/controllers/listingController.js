const Listing = require('../models/Listing');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const asyncHandler = require('../utils/asyncHandler');

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

  const listing = await Listing.findOneAndUpdate(
    { _id: req.params.id, shop: shop._id },
    {
      price: req.body.price,
      unit: req.body.unit,
      stockStatus: req.body.stockStatus,
      isActive: req.body.isActive,
    },
    { new: true, runValidators: true }
  ).populate('product');

  if (!listing) return res.status(404).json({ message: 'Listing not found' });
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
    .populate('shop', 'shopName phone address status')
    .sort({ price: 1 });

  const prices = listings.map((listing) => listing.price);
  const summary = calculatePriceSummary(prices);

  return { product, listings, summary };
};

const compareProduct = asyncHandler(async (req, res) => {
  const comparison = await getComparisonData(req.params.productId);
  if (!comparison) return res.status(404).json({ message: 'Active product not found' });
  return res.status(200).json(comparison);
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
  updateListing,
};
