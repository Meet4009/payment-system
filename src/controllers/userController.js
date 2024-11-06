const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const { generateToken } = require('../middleware/auth');
const { registerValidation, loginValidation, profileUpdateValidation } = require('../middleware/validation');


// Register User
const register = async (req, res) => {

    // Validate registration data, return error if invalid
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({
        message: error.details[0].message
    });

    const { name, email, mobile, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({
        $or: [{ email }, { mobile }]
    });
    if (userExists) {
        return res.status(400).json({
            message: 'User already exists'
        });
    }

    // Create new user
    const user = new User({ name, email, mobile, password });

    try {
        await user.save();
        res.status(201).json({
            message: "User registered successfully",
            data: user,
        });

    } catch (err) {
        res.status(500).json({
            message: `Server Error, ${err.message}`
        });
    }
};


// Login User
const login = async (req, res) => {
    // Validate login data, return error if invalid
    const { error } = loginValidation(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    const { login, password } = req.body;

    try {
        // Check if user exists by email or mobile number
        const user = await User.findOne({
            $or: [{ email: login }, { mobile: login }],
        });
        if (!user) {
            return res.status(400).json({
                message: 'Invalid email/mobile or password'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid email/mobile or password'
            });
        }

        // Set loggedIn to true
        user.loggedIn = true;
        await user.save();

        // Generate token
        const token = generateToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });

        res.status(200).json({
            message: "User Login Successfully",
            data: user,
            token: token,
        });

    } catch (err) {
        res.status(500).json({
            message: `Server error ${err.message}`
        });
    }
};

// Logout User
const logout = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming req.user contains authenticated user

        // Find the user and set loggedIn to false
        const user = await User.findById(userId);
        if (user) {
            user.loggedIn = false;
            await user.save();
        } else {
            message: "User not found"
        }

        // Clear JWT cookie
        res.clearCookie('jwt');

        res.status(200).json({
            message: `${user.name} logged out successfully`
        });
    } catch (err) {
        res.status(500).json({
            message: `Server error ${err.message}`
        });
    }
};

module.exports = { register, login, logout };
