const express = require('express');
const { body, param } = require('express-validator');
const {
  compareProduct,
  createListing,
  deleteListing,
  getAllListings,
  getFeaturedListings,
  getMyListings,
  getShopListings,
  updateListing,
} = require('../controllers/listingController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();
const adminRouter = express.Router();
const stockRule = body('stockStatus')
  .isIn(['In Stock', 'Low Stock', 'Out of Stock'])
  .withMessage('Invalid stock status');

router.get('/featured', getFeaturedListings);

router.post(
  '/',
  protect,
  authorize('Vendor'),
  [
    body('product').isMongoId().withMessage('A valid product ID is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than zero').toFloat(),
    stockRule,
    body('isActive').optional().isBoolean().toBoolean(),
  ],
  validate,
  createListing
);
router.get('/my-listings', protect, authorize('Vendor'), getMyListings);
router.put(
  '/:id',
  protect,
  authorize('Vendor'),
  [
    param('id').isMongoId().withMessage('A valid listing ID is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than zero').toFloat(),
    stockRule,
    body('isActive').optional().isBoolean().toBoolean(),
  ],
  validate,
  updateListing
);
router.delete(
  '/:id',
  protect,
  authorize('Vendor'),
  param('id').isMongoId().withMessage('A valid listing ID is required'),
  validate,
  deleteListing
);
router.get(
  '/product/:productId',
  param('productId').isMongoId().withMessage('A valid product ID is required'),
  validate,
  compareProduct
);
router.get(
  '/shop/:shopId',
  param('shopId').isMongoId().withMessage('A valid shop ID is required'),
  validate,
  getShopListings
);

adminRouter.get('/listings', protect, authorize('Admin'), getAllListings);

module.exports = { adminRouter, router };
