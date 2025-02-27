const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { generateToken, setCookie } = require('../utils/JWT_token');
const { registerValidation, loginValidation, profileUpdateValidation, updatePasswordValidation } = require('../middleware/validation');
const userProtect = require('../utils/userProtect');
const services = require('../services/userServices');


//////////////////////////////// USER SIDE ////////////////////////////////

// ----------------------------------------------------------------
// Register a new user
// POST http://localhost:5656/api/v1/user/register
// ----------------------------------------------------------------
exports.register = async (req, res) => {

    const { name, email, phone, password, } = req.body;

    try {
        const { error } = registerValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const userExists = await User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const hashedPassword = await userProtect.doHash(password);
        const newUser = new User({ name, email, phone, password: hashedPassword, });

        const user = await newUser.save();
        newUser.password = undefined;

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Server Error, ${err.message}`
        });
    }
};

// ----------------------------------------------------------------
// Login a user
// POST http://localhost:5656/api/v1/user/login
// ----------------------------------------------------------------

exports.login = async (req, res, next) => {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).json({
        success: false,
        message: error.details[0].message
    });

    const { login, password } = req.body;
    try {
        const user = await User.findOne({ $or: [{ email: login }, { phone: login }] }).select('+password');

        if (!user || !(await userProtect.comparePassword(password, user.password))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email/phone or password'
            });
        }

        user.loggedIn = true;
        await user.save();

        const token = generateToken(user._id);
        setCookie(res, token);

        res.status(200).json({
            Success: true,
            message: "User Login Successfully",
            data: user,
            token
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Server error ${err.message}`
        });
    }
};

// ----------------------------------------------------------------
// Logout a user
// GET http://localhost:5656/api/v1/user/logout
// ----------------------------------------------------------------

exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.clearCookie('jwt');

        user.loggedIn = false;
        await user.save();

        res.status(200).json({
            success: true,
            message: `${user.name} logged out successfully`
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Server error ${err.message}`
        });
    }
};

// ----------------------------------------------------------------
// Get user profile
// GET http://localhost:5656/api/v1/user/profile
// ----------------------------------------------------------------

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: `Server error ${err.message}`
        });
    }
}

// ----------------------------------------------------------------
// Update user profile
// PUT http://localhost:5656/api/v1/user/profile-update
// ----------------------------------------------------------------

exports.updateProfile = async (req, res) => {
    const { error } = profileUpdateValidation(req.body);
    if (error) return res.status(400).json({
        success: false,
        message: error.details[0].message
    });

    try {
        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: `Server error ${err.message}`
        });
    }
}

// ----------------------------------------------------------------
// Update user password
// PUT http://localhost:5656/api/v1/user/update-password
// ----------------------------------------------------------------

exports.updatePassword = async (req, res) => {
    const { password, newPassword, confrimPassword } = req.body;
    const { error } = updatePasswordValidation(req.body);
    if (error) return res.status(400).json({
        success: false,
        message: error.details[0].message
    });


    try {
        const user = await User.findById(req.user.id).select('+password');
        if (!user || !(await userProtect.comparePassword(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        const hashedPassword = await userProtect.doHash(newPassword);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Server error ${err.message}`
        });
    }
}

// ----------------------------------------------------------------
// Delete user
// DELETE http://localhost:5656/api/v1/user/delete-user/:id

// Note: This route is protected by the userProtect middleware. It requires a valid JWT token to access.

exports.deleteProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Server error ${err.message}`
        });
    }
};

//////////////////////////////// ADMIN SIDE ////////////////////////////////

// ----------------------------------------------------------------
// Get all users
// GET http://localhost:5656/api/v1/user/users
// ----------------------------------------------------------------

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' });
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Server error ${err.message}`
        });
    }
};

// ----------------------------------------------------------------
// Get user by id
// GET http://localhost:5656/api/v1/user/user/:id
// ----------------------------------------------------------------


exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: `Server error ${err.message}`
        });
    }
}


// ----------------------------------------------------------------
// Update user by id
// PUT http://localhost:5656/api/v1/user/update-user/:id
// ----------------------------------------------------------------

exports.updateUser = async (req, res) => {
    const { error } = profileUpdateValidation(req.body);
    if (error) return res.status(400).json({
        success: false,
        message: error.details[0].message
    });

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const updateUser = await User.findByIdAndUpdate(user.id, req.body, {
            new: true, runValidators: true
        });
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updateUser
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Server error ${err.message}`
        });
    }

}

// ----------------------------------------------------------------
// Delete user by id
// DELETE http://localhost:5656/api/v1/user/delete-user/:id
// ----------------------------------------------------------------

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Server error ${err.message}`
        });
    }
}

