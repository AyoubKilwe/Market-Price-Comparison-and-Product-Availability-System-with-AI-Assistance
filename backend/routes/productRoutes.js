const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} = require('../controllers/productController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();
const idRule = param('id').isMongoId().withMessage('A valid product ID is required');
const productRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('image').optional().isString().withMessage('Image must be a string'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Invalid product status'),
];

router.get('/', query('search').optional().trim().isLength({ max: 100 }), validate, getProducts);
router.get('/:id', idRule, validate, getProduct);
router.post('/', protect, authorize('Admin'), productRules, validate, createProduct);
router.put('/:id', protect, authorize('Admin'), idRule, productRules, validate, updateProduct);
router.delete('/:id', protect, authorize('Admin'), idRule, validate, deleteProduct);

module.exports = router;
