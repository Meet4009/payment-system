const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const { number, date } = require("joi");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    currency_code: {
        type: Number,
        default: 356,
    },
    role: {
        type: String,
        default: "user",
    },

    loggedIn: {
        type: Boolean,
        default: false,
    },

    password: {
        type: String,
        required: true,
    },
    create_At: {
        type: Date,
        default: Date.now(),
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

// Generates a secure, 10-minit expiration reset token for password reset
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

module.exports = mongoose.model("User", userSchema);