const Listing = require('../models/Listing');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const CustomerActivity = require('../models/CustomerActivity');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getProducts = asyncHandler(async (req, res) => {
  const filter = { status: 'Active' };

  if (req.query.search) {
    await CustomerActivity.create({ type: 'search', query: req.query.search.trim() });
    const search = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ name: search }, { category: search }];
  }

  const products = await Product.find(filter).sort({ name: 1 });
  return res.status(200).json({ products });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, status: 'Active' });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await CustomerActivity.create({ type: 'view', product: product._id });
  return res.status(200).json({ product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  return res.status(201).json({ product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  return res.status(200).json({ product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const hasListings = await Listing.exists({ product: product._id });
  if (hasListings) {
    product.status = 'Inactive';
    await product.save();
    return res.status(200).json({ message: 'Product deactivated because listings reference it' });
  }

  await product.deleteOne();
  return res.status(200).json({ message: 'Product deleted' });
});

module.exports = { createProduct, deleteProduct, getProduct, getProducts, updateProduct };
