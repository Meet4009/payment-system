const mongoose = require("mongoose");
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { generateToken, setCookie } = require('../utils/JWT_token');
const { registerValidation, loginValidation, profileUpdateValidation, updatePasswordValidation } = require('../middleware/validation');
const userProtect = require('../utils/userProtect');
const services = require('../services/userServices');


//////////////////////////////////////////// USER SIDE ////////////////////////////////////////////

// -------------------------------------------- 1 // Register a new user --------------------------------------------

exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validate request body
        const { error } = registerValidation(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // Check if user already exists
        if (await User.findOne({ $or: [{ email }, { phone }] })) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Determine user role
        const role = (await User.countDocuments()) === 0 ? "admin" : "user";

        // Hash password and create user
        const hashedPassword = await userProtect.doHash(password);
        const user = await new User({ name, email, phone, password: hashedPassword, role }).save();

        res.status(201).json({ success: true, message: "User created successfully", data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: `Server Error: ${err.message}` });
    }
};
// ------------------------------------------------------------------------------------------------------------------


// -------------------------------------------- 2 // Login a user ---------------------------------------------------

exports.login = async (req, res) => {
    try {
        const { login, password } = req.body;

        // Validate input
        const { error } = loginValidation(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        // Find user by email or phone
        const user = await User.findOne({ $or: [{ email: login }, { phone: login }] }).select('+password');
        if (!user || !(await userProtect.comparePassword(password, user.password))) {
            return res.status(400).json({ success: false, message: 'Invalid email/phone or password' });
        }

        // Update user login status & generate token
        user.loggedIn = true;
        await user.save();
        const token = generateToken(user._id);
        setCookie(res, token);

        // Respond with success
        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            // data: { _id: user._id, email: user.email, phone: user.phone },
            data: { user },
            token
        });
    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
};
// ------------------------------------------------------------------------------------------------------------------


// --------------------------------------------- 3 // Logout a user -------------------------------------------------

exports.logout = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { loggedIn: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.clearCookie("jwt");

        res.status(200).json({ success: true, message: `${user.name} logged out successfully` });
    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
};
// ------------------------------------------------------------------------------------------------------------------


// ---------------------------------------------- 4 // Get user profile ---------------------------------------------

exports.getProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(400).json({ success: false, message: "Invalid request" });
        }

        const user = await User.findById(req.user.id).select("-password").lean();

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
};
// ------------------------------------------------------------------------------------------------------------------


// ----------------------------------------------- 5 // Update user profile -----------------------------------------

exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.user;
        
        // Find existing user
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Only update fields that are provided in req.body
        const updatedData = {
            name: req.body.name || existingUser.name,
            email: req.body.email || existingUser.email,
            phone: req.body.phone || existingUser.phone,
        };

        // Validate updated data
        const { error } = profileUpdateValidation(updatedData);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        
        // Update user
        const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true });
        
        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error in updating user", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
// ------------------------------------------------------------------------------------------------------------------

// ------------------------------------------------ 6 // Update user password ---------------------------------------

exports.updatePassword = async (req, res) => {
    try {
        const { password, newPassword, confirmPassword } = req.body;

        // Validate request body
        const { error } = updatePasswordValidation(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // Find user and include password field
        const user = await User.findById(req.user.id).select("+password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if current password is correct
        const isMatch = await userProtect.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        // Check if new password is same as current password
        if (password === newPassword) {
            return res.status(400).json({ success: false, message: "Current password and new password must not match" });
        }

        // Check if new password matches confirm password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: "New password and confirm password do not match" });
        }

        // Hash and update new password
        user.password = await userProtect.doHash(newPassword);
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }   
};

// ------------------------------------------------------------------------------------------------------------------


// ------------------------------------------------- 7 // Delete user -----------------------------------------------

exports.deleteProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(400).json({ success: false, message: "Invalid request" });
        }

        // Find and delete the user
        const user = await User.findByIdAndDelete(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Clear authentication cookies (if applicable)
        res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "Strict" });

        res.status(200).json({ success: true, message: "User deleted successfully" });

    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
};
// ------------------------------------------------------------------------------------------------------------------


//////////////////////////////////////////// ADMIN SIDE ////////////////////////////////////////////


// ------------------------------------------------- 8 // Get all users --------------------------------------------

exports.getAllUsers = async (req, res) => {
    try {
        // Optional: Pagination & Sorting
        const limit = parseInt(req.query.limit) || 10; // Default: 10 users per page
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        // Fetch users, excluding passwords
        const users = await User.find({ role: "user" })
            .select("-password")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }) // Sort by newest users first
            .lean();

        res.status(200).json({ success: true, count: users.length, data: users });

    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
};
// ------------------------------------------------------------------------------------------------------------------


// ------------------------------------------------- 9 // Get user by id -------------------------------------------

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        // Fetch user and exclude password
        const user = await User.findById(id).select("-password").lean();

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });

    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });

    }
};
// ------------------------------------------------------------------------------------------------------------------


// ------------------------------------------------- 10 // Update user by id ---------------------------------------

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Find existing user
        const existingUser = await User.findOne({ _id:id });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Only update fields that are provided in req.body
        const updatedData = {
            name: req.body.name || existingUser.name,
            email: req.body.email || existingUser.email,
            phone: req.body.phone || existingUser.phone,
        };

        // Validate updated data
        const { error } = profileUpdateValidation(updatedData);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(existingUser.id, updatedData, { new: true });

        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error in updating user", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
// ------------------------------------------------------------------------------------------------------------------


// ------------------------------------------------- 11 // Delete user by id ---------------------------------------

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        // Find and delete user
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User deleted successfully" });

    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
};
// ------------------------------------------------------------------------------------------------------------------
