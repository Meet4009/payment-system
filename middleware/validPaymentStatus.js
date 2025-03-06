const ErrorHandler = require("../utils/errorHandler");

exports.validPaymentStatus = (req, res, next) => {
    try {
        validStatus = ['approved', 'rejected', 'pending']
        const status = req.params.status;

        if (!validStatus.includes(status)) {
            return next(new ErrorHandler('Invalid payment status', 400));
        }
        next();
    }
    catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};