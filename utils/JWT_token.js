const jwt = require('jsonwebtoken');


// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

// Set cookie in response

const setCookie = (res, token) => {
    const options = {
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 day
        httpOnly: true,
    };
    res.cookie('jwt', token, options);

};
module.exports = { generateToken, setCookie };