const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { generateToken, setCookie } = require('../middleware/auth');
const { registerValidation, loginValidation, profileUpdateValidation, updatePasswordValidation } = require('../middleware/validation');
const userProtect = require('../utils/userProtect');

const register = async (req, res) => {

    const { name, email, mobile, password } = req.body;

    try {
        const { error } = registerValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const userExists = await User.findOne({ $or: [{ email }, { mobile }] });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const hashedPassword = await userProtect.doHash(password);
        const user = new User({ name, email, mobile, password: hashedPassword });

        await user.save();
        user.password = undefined;

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Server Error, ${err.message}`
        });
    }
};

const login = async (req, res, next) => {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).json({
        success: false,
        message: error.details[0].message
    });

    const { login, password } = req.body;
    try {
        const user = await User.findOne({ $or: [{ email: login }, { mobile: login }] }).select('+password');

        if (!user || !(await userProtect.comparePassword(password, user.password))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email/mobile or password'
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

const logout = async (req, res) => {
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

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id
        );
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


const updateProfile = async (req, res) => {
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

const updatePassword = async (req, res) => {
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

module.exports = { register, login, logout, updateProfile, getProfile, updatePassword };
