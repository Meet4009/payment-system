
const Payment = require('../models/paymentModel')
const User = require('../models/userModel')
const ErrorHandler = require('./errorHandler')

exports.paymentApprove = async (payment, statusCode, res, next) => {
    try {
        const userID = payment.userId;
        const user = await User.findById(userID);
        if (!user) return next(new ErrorHandler('User not found', 404));

        const userBalance = user.balance;

        if ('deposit' === payment.payment_type) {
            const newBalance = userBalance + payment.amount;
            user.balance = newBalance;
            await user.save();

            payment.action_status = 'approved'
            payment.status = 'success';
            payment.save();

            res.status(statusCode).json({
                success: true,
                message: 'Payment approved successfully',
                data: {
                    user: user,
                    payment: payment
                }
            });
        }
    } catch (error) {
        next(new ErrorHandler(error.message, error.statusCode));
    }

}

exports.paymentReject = async (payment, statusCode, res, next) => {
    try {
        const userID = payment.userId;
        const user = await User.findById(userID);
        if (!user) return next(new ErrorHandler('User not found', 404));
        const userBalance = user.balance;

        if ('deposit' === payment.payment_type) {

            payment.action_status = 'rejected'
            payment.status = 'failed';
            payment.save();

            res.status(statusCode).json({
                success: true,
                message: 'Payment rejected successfully',
                data: {
                    user: user,
                    payment: payment    
                }
            });
        }
    } catch (error) {
        next(new ErrorHandler(error.message, error.statusCode));
    }

}

