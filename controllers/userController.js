const mongoose = require("mongoose");
const User = require('../models/userModel');
const { generateToken, setCookie } = require('../utils/JWT_token');
const { registerValidation, loginValidation, profileUpdateValidation, updatePasswordValidation } = require('../middleware/validation');
const userProtect = require('../utils/userProtect');
const ErrorHandler = require("../utils/errorHandler"); // Import the custom error handler

//////////////////////////////////////////// USER SIDE ////////////////////////////////////////////

// -------------------------------------------- 1 // Register a new user --------------------------------------------
exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, upiId, password } = req.body;

        // Validate input (exclude profileImage from validation)
        const { error } = registerValidation(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) return next(new ErrorHandler("User already exists", 400));

        // Assign role (first user is admin)
        const role = (await User.countDocuments()) === 0 ? "admin" : "user";

        // Hash password & create user
        const hashedPassword = await userProtect.doHash(password);
        const profileImage = req.file ? req.file.filename : "default.jpg"; // Handle profileImage upload

        const user = await User.create({
            name, email, phone, upiId,
            password: hashedPassword,
            role, profileImage
        });

        res.status(200).json({ success: true, message: "User registered successfully", data: user });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};


// -------------------------------------------- 2 // Login a user ---------------------------------------------------

exports.login = async (req, res, next) => {
    try {
        const { login, password } = req.body;

        // Validate input
        const { error } = loginValidation(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        // Find user by email or phone
        const user = await User.findOne({ $or: [{ email: login }, { phone: login }] }).select("+password");
        if (!user || !(await userProtect.comparePassword(password, user.password))) {
            return next(new ErrorHandler("Invalid credentials", 401));
        }

        // Update login status & generate token
        user.loggedIn = true;
        await user.save();
        const token = generateToken(user._id);
        setCookie(res, token);

        // Remove password from response
        const { password: _, ...userData } = user.toObject();

        res.status(200).json({ success: true, message: "Login successful", data: userData, token });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};


// --------------------------------------------- 3 // Logout a user -------------------------------------------------

exports.logout = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { loggedIn: false }, { new: true });
        if (!user) return next(new ErrorHandler("User not found", 404));

        res.clearCookie("jwt");
        res.status(200).json({ success: true, message: "Logged out successfully" });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};


// ---------------------------------------------- 4 // Get user profile ---------------------------------------------

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password").lean();
        if (!user) return next(new ErrorHandler("User not found", 404));

        res.status(200).json({ success: true, data: user });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};


// ----------------------------------------------- 5 // Update user profile -----------------------------------------
exports.updateProfile = async (req, res, next) => {
    try {
        const { id } = req.user;

        // Validate input
        const { error } = profileUpdateValidation(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        // Update user
        const updatedUser = await User.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        }).select("-password");

        if (!updatedUser) return next(new ErrorHandler("User not found", 404));

        res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedUser });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};

// 

// ------------------------------------------------ 6 // Update user password ---------------------------------------
exports.updatePassword = async (req, res, next) => {
    try {
        const { password, newPassword, confirmPassword } = req.body;

        // Validate input
        const { error } = updatePasswordValidation(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        const user = await User.findById(req.user.id).select("+password");
        if (!user) return next(new ErrorHandler("User not found", 404));

        if (!(await userProtect.comparePassword(password, user.password))) {
            return next(new ErrorHandler("Incorrect current password", 401));
        }

        if (newPassword !== confirmPassword) {
            return next(new ErrorHandler("New password & confirm password do not match", 400));
        }

        // Update password
        user.password = await userProtect.doHash(newPassword);
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};

// ------------------------------------------------- 7 // Delete user -----------------------------------------------
exports.deleteProfile = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.user.id);

        res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "Strict" });
        res.status(200).json({ success: true, message: "Account deleted successfully" });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};

//////////////////////////////////////////// ADMIN SIDE ////////////////////////////////////////////


// ------------------------------------------------- 8 // Get all users --------------------------------------------
exports.getAllUsers = async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const skip = (page - 1) * limit;

        const totalUsers = await User.countDocuments({ role: "user" });
        const users = await User.find({ role: "user" }).select("-password").skip(skip).limit(limit).sort({ createdAt: -1 }).lean();

        res.status(200).json({ success: true, count: users.length, totalUsers, currentPage: page, totalPages: Math.ceil(totalUsers / limit), data: users });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};

// ------------------------------------------------- 9 // Get user by id -------------------------------------------
exports.getUserById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ErrorHandler("Invalid user ID", 400));

        const user = await User.findById(req.params.id).select("-password").lean();
        if (!user) return next(new ErrorHandler("User not found", 404));

        res.status(200).json({ success: true, data: user });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${err.message}`, 500));
    }
};

// -------------------------------------------- 10 // Update User --------------------------------------------
exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) return next(new ErrorHandler("Invalid user ID", 400));

        const { error } = profileUpdateValidation(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        const updatedUser = await User.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        }).select("-password").lean();

        if (!updatedUser) return next(new ErrorHandler("User not found", 404));

        res.status(200).json({ success: true, message: "User updated successfully", data: updatedUser });

    } catch (err) {
        next(new ErrorHandler(`Server error: ${err.message}`, 500));
    }
};

// -------------------------------------------- 11 // Delete User --------------------------------------------
exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) return next(new ErrorHandler("Invalid user ID", 400));

        if (req.user.id === id) return next(new ErrorHandler("You cannot delete your own account", 403));

        const user = await User.findByIdAndDelete(id);

        if (!user) return next(new ErrorHandler("User not found", 404));

        res.status(200).json({ success: true, message: "User deleted successfully" });

    } catch (err) {
        next(new ErrorHandler(`Server error: ${err.message}`, 500));
    }
};
