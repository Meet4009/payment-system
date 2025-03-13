const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const { depositValidation, withdrawValidation } = require("../middleware/validation");
const ErrorHandler = require("../utils/errorHandler");
const { paymentApprove, paymentReject } = require('../utils/payment');



////////////////////// ---  USER SIDE --- //////////////////////

// -------------------------------------------- 12 // post Deposit -------------------------------------------
// -
exports.deposit = async (req, res, next) => {
    try {
        // Validate input
        const { error } = depositValidation(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        // Extract required fields
        const { amount, utr_no } = req.body;
        const { id, currency_code } = req.user;

        // Ensure user exists (optional, if `req.user` is always present)
        const user = await User.findById(id);
        if (!user) return next(new ErrorHandler("User not found", 404));

        // Create & save payment
        const payment = await Payment.create({ userId: id, amount, utr_no, currency_code, payment_type: "deposit" });

        res.status(201).json({ success: true, message: "Payment successful", payment });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};

// -------------------------------------------- 13 // post Withdraw --------------------------------------------

exports.withdraw = async (req, res, next) => {
    try {
        // Validate input
        const { error } = withdrawValidation(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        const { amount, upi_id: bodyUpiId } = req.body;
        const { id, currency_code } = req.user;

        // Ensure user exists
        const user = await User.findById(id);
        if (!user) return next(new ErrorHandler("User not found", 404));

        // Use UPI ID from request body, or fallback to user's stored UPI ID
        const upi_id = bodyUpiId || user.upiId;
        if (!upi_id) return next(new ErrorHandler("UPI ID is required", 400));

        // Check if user has enough balance
        if (user.balance < amount) return next(new ErrorHandler("Insufficient balance", 400));

        // Create & save payment
        const payment = await Payment.create({
            userId: id,
            amount,
            upi_id,
            currency_code,
            payment_type: "withdrawal"
        });

        // Update user balance
        user.balance -= amount;
        await user.save();

        res.status(201).json({ success: true, message: "Withdrawal successful", payment });
    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};


// -------------------------------------------- 14 //get All Deposit and ststus wise --------------------------------------------

exports.fetchDeposits = async (req, res, next) => {
    try {
        const { status } = req.params;
        const userId = req.user.id;

        // Validate status if provided
        if (status && !["pending", "success", "failed"].includes(status)) {
            return next(new ErrorHandler("Invalid status provided", 400));
        }

        // Fetch deposits with optional status filter
        const query = { userId, payment_type: "deposit" };
        if (status) query.status = status;

        const payments = await Payment.find(query).lean();

        res.status(200).json({
            success: true,
            message: `${status || "All"} payment fetch successful`,
            count: payments.length,
            payments
        });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};
// -------------------------------------------- 15 // get All Withdraw and status wise --------------------------------------------

exports.fetchWithdrawals = async (req, res, next) => {
    try {
        const { status } = req.params;
        const userId = req.user.id;
        // Validate status if provided
        if (status && !["pending", "success", "failed"].includes(status)) {
            return next(new ErrorHandler("Invalid status provided", 400));
        }
        // Fetch withdrawals with optional status filter
        const query = { userId, payment_type: "withdrawal" };
        if (status) query.status = status;

        const payments = await Payment.find(query).populate('userId');

        res.status(200).json({
            success: true,
            message: `${status || "All"} payment fetch successful`,
            count: payments.length,
            payments
        });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
}




////////////////////// ---  ADMIN SIDE --- //////////////////////

// -------------------------------------------- 16 // Get All deposit and action_status Wise --------------------------------------------

exports.getDeposits = async (req, res, next) => {
    try {
        const { status } = req.params;

        // Validate status if provided
        const validStatus = ['approved', 'rejected', 'pending'];
        if (status && !validStatus.includes(status)) {
            return next(new ErrorHandler('Invalid payment status', 400));
        }

        // Construct query with optional status filter
        const query = { payment_type: 'deposit' };
        if (status) query.action_status = status;

        // Fetch deposits
        const payments = await Payment.find(query).populate('userId');

        res.status(200).json({
            success: true,
            message: `Deposit status ${status || "all"} fetch successful`,
            count: payments.length,
            payments
        });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};

// -------------------------------------------- 17 // Get All withdrawal and action_status wise --------------------------------------------

exports.getWithdrawals = async (req, res, next) => {
    try {
        const { status } = req.params;
        // Validate status if provided
        const validStatus = ['approved', 'rejected', 'pending'];
        if (status && !validStatus.includes(status)) {
            return next(new ErrorHandler('Invalid payment status', 400));
        }
        // Construct query with optional status filter
        const query = { payment_type: 'withdrawal' };
        if (status) query.action_status = status;

        // Fetch withdrawals
        const payments = await Payment.find(query).populate('userId');

        res.status(200).json({
            success: true,
            message: `Withdrawal status ${status || "all"} fetch successful`,
            count: payments.length,
            payments
        });
    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
}


// -------------------------------------------- 18 // set Approve --------------------------------------------

exports.setApprovePayment = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch payment
        const payment = await Payment.findOne({ _id: id, status: 'pending' });
        if (!payment) return next(new ErrorHandler('Payment not found or already processed', 404));

        // Approve payment
        paymentApprove(payment, 200, res);

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};

// -------------------------------------------- 19 // set Reject --------------------------------------------

exports.setRejectPayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Fetch payment
        const payment = await Payment.findOne({ status: 'pending', _id: id })
        if (!payment) return next(new ErrorHandler('Payment not found', 404));

        paymentReject(payment, 200, res);

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
}