const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        utr_no: {
            type: String,
            default:null,
            trim: true,
        },
        upi_id: {
            type: String,
            default:null,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        currency_code: {
            type: String,
            required: true,
            trim: true,
        },
        payment_type: {
            type: String,
            required: true,
            enum: ['deposit', 'withdrawal'],
        },
        status: {
            type: String,
            enum: ['success', 'failed', 'pending'],
            default: 'pending',
        },
        action_status: {
            type: String,
            enum: ['approved', 'rejected', 'pending'],
            default: 'pending',
        },
    },
    { timestamps: true } // Automatically adds createdAt & updatedAt
);

module.exports = mongoose.model('Payment', paymentSchema);
