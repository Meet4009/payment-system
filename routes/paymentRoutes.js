const express = require('express');
const router = express.Router();

// Import routes
const paymentController = require('../controllers/paymentController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const { validPaymentStatus } = require('../middleware/validPaymentStatus');

// ------------ DEPOSIT ------------ //

// ---- USER ROUTES ---- //

router.post('/deposit', authMiddleware, paymentController.deposit);
router.get('/deposit/:status?', authMiddleware, paymentController.fetchDeposits);

// ---- ADMIN ROUTES ---- //

router.get('/:status?/deposits', authMiddleware, authorizeRoles("admin"), paymentController.getDeposits);
router.get('/deposit/approve/:id', authMiddleware, authorizeRoles("admin"), paymentController.setApprove);
router.get('/deposit/reject/:id', authMiddleware, authorizeRoles("admin"), paymentController.setreject);




module.exports = router;
