const express = require('express');
const router = express.Router();

// Import routes
const { deposite } = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

router.post('/deposite',authMiddleware, deposite);

module.exports = router;
    