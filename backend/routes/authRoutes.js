const express = require('express');
const { login, registerVendor } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerVendor);
router.post('/login', login);

module.exports = router;
