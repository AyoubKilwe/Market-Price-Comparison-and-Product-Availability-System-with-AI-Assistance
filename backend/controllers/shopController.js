const Listing = require('../models/Listing');
const Shop = require('../models/Shop');
const asyncHandler = require('../utils/asyncHandler');

const createShop = asyncHandler(async (req, res) => {
  const existingShop = await Shop.findOne({ vendor: req.user._id });
  if (existingShop) return res.status(409).json({ message: 'Vendor already has a shop' });

  const shop = await Shop.create({ ...req.body, vendor: req.user._id, status: 'Pending' });
  return res.status(201).json({ shop });
});

const getApprovedShops = asyncHandler(async (req, res) => {
  const shops = await Shop.find({ status: 'Approved' }).sort({ shopName: 1 });
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

module.exports = {
  createShop,
  getAllShops,
  getApprovedShops,
  getMyShop,
  getShop,
  updateMyShop,
  updateShopStatus,
};
