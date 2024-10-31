const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const { registerValidation, loginValidation } = require('../middleware/validation');


// Signup
const register = async (req, res) => {
    const { error } = registerValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({ name, email, password });
        await user.save();

        // Generate token
        // const token = generateToken(user._id);

        res.status(201).json({
            "message": "Registration Successfully",
            "data": user,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Signin
const login = async (req, res) => {
    const { error } = loginValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            "message": "User Login Successfully",
            "data": user,
            "token": token,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Signout (Clear JWT token)
const logout = (req, res) => {
    res.status(200).json({ message: 'User signed out' });
};

module.exports = { signup, signin, signout };
