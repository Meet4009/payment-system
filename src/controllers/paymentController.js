const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const { depositValidation } = require("../middleware/paymentValidation");

// deposite request

exports.deposite = async (req, res) => {
    const {error} = depositValidation(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    try {
        const { amount, utr_no } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const payment = new Payment({
            userId: user.id,
            amount,
            utr_no,
            currency_code: user.currency_code,
            payment_type: "deposite",
        });

        await payment.save();
        res.status(201).json({
            success: true,
            message: "Payment success",
            payment
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// withdrawal request