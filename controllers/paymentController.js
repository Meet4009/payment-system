const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const { depositValidation } = require("../middleware/validation");
const { ErrorHandler } = require('../utils/errorHandler');


//////////////////////////////////////////// DEPOSIT ////////////////////////////////////////////

////////////////////// ---  USER SIDE --- //////////////////////

// -------------------------------------------- 12 // Deposit --------------------------------------------
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

// -------------------------------------------- 13 //pending Deposit --------------------------------------------
exports.pendingDeposit = async (req, res, next) => { // Fixed typo in function name
    try {
        const userId = req.user.id;

        // Check if user exists
        const userExists = await User.exists({ _id: userId });
        if (!userExists) return next(new ErrorHandler(`User does not exist`, 500));


        // Fetch pending deposits
        const payments = await Payment.find({
            userId: userExists._id,
            payment_type: "deposit", // Fixed typo
            status: "pending"
        });

        res.status(200).json({ success: true, message: "pending payment fatch successful", payments });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};

// -------------------------------------------- 14 // Deposit History --------------------------------------------
exports.history = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Check if user exists
        const userExists = await User.exists({ _id: userId });
        if (!userExists) return next(new ErrorHandler(`User does not exist`, 500));
        
        // Fetch payment history for deposits with success/failed status
        const payments = await Payment.find({
            userId, payment_type: "deposit", status: { $in: ["success", "failed"] }
        });
        
        res.status(200).json({
            success: true, message: " payment history fatch successful", payments
        });
        
    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};


////////////////////// ---  ADMIN SIDE --- //////////////////////


// -------------------------------------------- 15 // Get All Deposites --------------------------------------------
exports.getAllDeposits = async (req, res, next) => {
    
    try {
        // Fetch all deposits
        const payments = await Payment.find({ payment_type: 'deposit' }).populate('userId');
        
        res.status(200).json({
            success: true, message: "All deposit fatch successful", payments
        });
        
    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
        
    }
}

// -------------------------------------------- 16 // get stutuswise deposit --------------------------------------------

exports.getDepositStatusWise = async (req, res) => {
    try {
        const { status } = req.params;

        // Fetch all deposits
        const payments = await Payment.find({ payment_type: 'deposit', action_status: status }).populate('userId');

        res.status(200).json({
            success: true, message: `Deposit status ${status} fatch successful`, payments
        });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));

    }
}










