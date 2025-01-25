const jwt = require('jsonwebtoken');
require('dotenv').config();
// Add the following line to require cookie-parser
const cookieParser = require('cookie-parser');
const User = require('../models/userModel');

exports.authMiddleware = async (req, res, next) => {
    let token;

    // get the token from header.authorization->Bearer Token
    // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //     token = req.headers.authorization.split(' ')[1];

    // } else if (req.cookies.jwt) {
    //     token = req.cookies.jwt; // Check in cookies if not in header

    // } else {
    //     return res.status(401).json({ message: 'No token, authorization denied' });
    // }

    // get the token from cookie
    if (req.cookies.jwt) {
        token = req.cookies.jwt; // Check in cookies if not in header

    } else {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decodeData =  jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodeData.id); // Attach decoded token (user) to req
        next();
    } catch (err) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Authorize roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to access this route' });
        }
        next();
    };
}
