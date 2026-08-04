const express = require('express');
const { body } = require('express-validator');
const { ask } = require('../controllers/aiController');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.post(
  '/ask',
  [
    body('question').trim().isLength({ min: 3, max: 500 }).withMessage('Question must be 3-500 characters'),
    body('productId').optional().isMongoId().withMessage('A valid product ID is required'),
  ],
  validate,
  ask
);

module.exports = router;
