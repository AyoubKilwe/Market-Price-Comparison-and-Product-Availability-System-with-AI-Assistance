const express = require('express');
const { body, header, param } = require('express-validator');
const validate = require('../middleware/validateMiddleware');
const controller = require('../controllers/priceAlertController');

const router = express.Router();
const clientRule = header('x-marketeye-client-id').trim().isLength({ min: 8, max: 100 }).withMessage('A valid customer browser ID is required');

router.get('/notifications', clientRule, validate, controller.listNotifications);
router.patch('/notifications/read', clientRule, validate, controller.markNotificationsRead);
router.get('/', clientRule, validate, controller.listAlerts);
router.post('/', [clientRule, body('productId').isMongoId()], validate, controller.createAlert);
router.delete('/:productId', [clientRule, param('productId').isMongoId()], validate, controller.removeAlert);

module.exports = router;
