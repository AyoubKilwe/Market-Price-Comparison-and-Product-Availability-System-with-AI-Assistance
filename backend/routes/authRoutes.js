const express = require('express');
const { body, param } = require('express-validator');
const { getAllVendors, getMe, login, registerVendor, updateVendorStatus } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();
const adminRouter = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  registerVendor
);
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);
router.get('/me', protect, getMe);

adminRouter.get('/vendors', protect, authorize('Admin'), getAllVendors);
adminRouter.patch(
  '/vendors/:id/status',
  protect,
  authorize('Admin'),
  [
    param('id').isMongoId().withMessage('A valid vendor ID is required'),
    body('status').isIn(['Active', 'Suspended']).withMessage('Invalid status'),
  ],
  validate,
  updateVendorStatus
);

module.exports = { adminRouter, router };
