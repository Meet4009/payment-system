const express = require("express");
const router = express.Router();

// Import controllers & middleware
const paymentController = require("../controllers/paymentController");
const { authMiddleware, authorizeRoles } = require("../middleware/auth");

// Apply authMiddleware to all routes
router.use(authMiddleware);

// ------------ DEPOSIT ROUTES ------------ //

// User deposit routes
router.route("/deposit/:status?")
    .post(paymentController.deposit)
    .get(paymentController.fetchDeposits);

router.route("/:status?/deposits")
    .get(authorizeRoles("admin"), paymentController.getDeposits);

// Admin deposit approval/rejection routes
router.route("/deposit/approve/:id")
    .get(authorizeRoles("admin"), paymentController.setApprovePayment);

router.route("/deposit/reject/:id")
    .get(authorizeRoles("admin"), paymentController.setRejectPayment);

// ------------ WITHDRAWAL ROUTES ------------ //

// User withdrawal routes
router.route("/withdraw/:status?")
    .post(paymentController.withdraw)
    .get(paymentController.fetchWithdrawals);

router.route("/:status?/withdrawals")
    .get(authorizeRoles("admin"), paymentController.getWithdrawals);

// Admin withdrawal approval/rejection routes
router.route("/withdrawal/approve/:id")
    .get(authorizeRoles("admin"), paymentController.setApprovePayment);

router.route("/withdrawal/reject/:id")
    .get(authorizeRoles("admin"), paymentController.setRejectPayment);

module.exports = router;
