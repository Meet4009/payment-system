const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const { depositValidation } = require("../middleware/validation");
const { ErrorHandler } = require('../utils/errorHandler');
const { paymentApprove, paymentReject } = require('../utils/payment');


//////////////////////////////////////////// DEPOSIT ////////////////////////////////////////////

////////////////////// ---  USER SIDE --- //////////////////////

// -------------------------------------------- 12 // post Deposit --------------------------------------------
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

// -------------------------------------------- 13 //get All Deposit and ststus wise --------------------------------------------
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
        console.log(query);
        if (status) query.status = status;
        console.log(query);

        const payments = await Payment.find(query).lean();

        res.status(200).json({
            success: true,
            message: `${status || "All"} payment fetch successful`,
            count: payments.length,
            payments
        });

    } catch (err) {
        next( ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};

////////////////////// ---  ADMIN SIDE --- //////////////////////

// -------------------------------------------- 14 // Get All deposit and action_status Wise --------------------------------------------

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


// -------------------------------------------- 17 // set Approve --------------------------------------------


exports.setApprove = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch payment
        const payment = await Payment.findOne({ payment_type: 'deposit', status: 'pending', _id: id })
        if (!payment) return next(new ErrorHandler('Payment not found', 404));

        paymentApprove(payment, 200, res);

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
}

// -------------------------------------------- 18 // set Reject --------------------------------------------
exports.setreject = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Fetch payment
        const payment = await Payment.findOne({ payment_type: 'deposit', status: 'pending', _id: id })
        if (!payment) return next(new ErrorHandler('Payment not found', 404));

        paymentReject(payment, 200, res);

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
}