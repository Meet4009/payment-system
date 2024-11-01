const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const { registerValidation, loginValidation, profileUpdateValidation } = require('../middleware/validation');

// get API 

const dataGet = async (req, res) => {
    const users = await User.find();
    console.log(users);

    res.status(200).json({
        user: users,
        message: 'Logout successful'
    });
}


// Register User
const register = async (req, res) => {

    // Validate registration data, return error if invalid
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({
        message: error.details[0].message
    });

    const { name, email, password } = req.body;

    // Check if user already exists
    let userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            message: 'User already exists'
        });
    }

    // Create new user
    const user = new User({ name, email, password });

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

    if (error) return res.status(400).json({
        message: error.details[0].message
    });

    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });

        res.status(200).json({
            "message": "User Login Successfully",
            "data": user,
            "token": token,
        });

    } catch (err) {
        res.status(500).json({
            message: `Server error ${err.message}`
        });
    }
};

// Logout User
const logout = (req, res) => {

    res.cookie('jwt', '', { maxAge: 1 });

    res.status(200).json({
        message: 'Logout successful'
    });
};

module.exports = { register, login, logout, dataGet };
