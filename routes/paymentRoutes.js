const express = require('express');
const router = express.Router();

// Import routes
const paymentController = require('../controllers/paymentController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
//api/v1/payment

// ------------ DEPOSIT ------------ //

// ---- USER ROUTES ---- //
router.post('/deposit', authMiddleware, paymentController.deposit);
router.get('/deposit/:status?', authMiddleware, paymentController.fetchDeposits);

// ---- ADMIN ROUTES ---- //

router.get('/:status?/deposits', authMiddleware, authorizeRoles("admin"), paymentController.getDeposits);
router.get('/deposit/approve/:id', authMiddleware, authorizeRoles("admin"), paymentController.setApprovePayment);
router.get('/deposit/reject/:id', authMiddleware, authorizeRoles("admin"), paymentController.setRejectPayment);

// ------------ WITHDRAW ------------ //

// ---- USER ROUTES ---- //
router.post('/withdraw', authMiddleware, paymentController.withdraw);
router.get('/withdraw/:status?', authMiddleware, paymentController.fetchWithdrawals);

// ---- ADMIN ROUTES ---- //

router.get('/:status?/withdrawals', authMiddleware, authorizeRoles("admin"), paymentController.getWithdrawals);
router.get('/withdrawal/approve/:id', authMiddleware, authorizeRoles("admin"), paymentController.setApprovePayment);
router.get('/withdrawal/reject/:id', authMiddleware, authorizeRoles("admin"), paymentController.setRejectPayment);

// ------------ TRANSFER ------------ //



module.exports = router;
