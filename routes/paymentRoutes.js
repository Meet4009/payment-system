const express = require('express');
const router = express.Router();

// Import routes
const paymentController = require('../controllers/paymentController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const {validPaymentStatus} = require('../middleware/validPaymentStatus');

// ------------ DEPOSIT ------------ //

// ---- USER ROUTES ---- //

router.post('/deposit', authMiddleware, paymentController.deposit);
router.get('/pending-deposit', authMiddleware, paymentController.pendingDeposit);
router.get('/history', authMiddleware, paymentController.history);

// ---- ADMIN ROUTES ---- //

router.get('/deposits', authMiddleware, authorizeRoles("admin"), paymentController.getAllDeposits);
router.get('/:status/deposits', authMiddleware, authorizeRoles("admin"), validPaymentStatus, paymentController.getDepositStatusWise);




module.exports = router;
