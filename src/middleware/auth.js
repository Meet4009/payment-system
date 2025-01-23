const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
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
        const decodeData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodeData; // Attach decoded token (user) to req
        next();
    } catch (err) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};
module.exports = { authMiddleware, generateToken };
