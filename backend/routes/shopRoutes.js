const express = require('express');
const { body, param } = require('express-validator');
const {
  createShop,
  getAllShops,
  getApprovedShops,
  getMyShop,
  getReportingStats,
  getShop,
  updateMyShop,
  updateShopStatus,
} = require('../controllers/shopController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();
const adminRouter = express.Router();
const shopRules = [
  body('shopName').trim().notEmpty().withMessage('Shop name is required'),
  body('phone').trim().notEmpty().withMessage('Shop phone is required'),
  body('address').trim().notEmpty().withMessage('Shop address is required'),
];

router.post('/', protect, authorize('Vendor'), shopRules, validate, createShop);
router.get('/', getApprovedShops);
router.get('/my-shop', protect, authorize('Vendor'), getMyShop);
router.put('/my-shop', protect, authorize('Vendor'), shopRules, validate, updateMyShop);
router.patch(
  '/:id/status',
  protect,
  authorize('Admin'),
  [
    param('id').isMongoId().withMessage('A valid shop ID is required'),
    body('status')
      .isIn(['Pending', 'Approved', 'Rejected', 'Suspended'])
      .withMessage('Invalid shop status'),
  ],
  validate,
  updateShopStatus
);
router.get('/:id', param('id').isMongoId().withMessage('A valid shop ID is required'), validate, getShop);

adminRouter.get('/shops', protect, authorize('Admin'), getAllShops);
adminRouter.get('/reporting', protect, authorize('Admin'), getReportingStats);

module.exports = { adminRouter, router };

