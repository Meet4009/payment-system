const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Handle specific MongoDB and JWT errors
    const errorTypes = {
        CastError: `Resource not found. Invalid: ${err.path}`,
        JsonWebTokenError: "Invalid JSON Web Token, please try again.",
        TokenExpiredError: "JSON Web Token has expired, please login again.",
    };

    if (errorTypes[err.name]) {
        err = new ErrorHandler(errorTypes[err.name], 400);
    }

    if (err.code === 11000) {
        err = new ErrorHandler(`Duplicate ${Object.keys(err.keyValue)} entered`, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
