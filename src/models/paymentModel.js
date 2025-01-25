const mongoose = require('mongoose');

// payment schema

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    utr_no: {
        type: String,
    },
    upi_id: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency_code: {
        type: String,
        required: true,
    },
    payment_type: {
        type: String,
        required: true,
        enum : ['deposite', 'withdrawal'],
    },
    status: {
        type: String,
        required: true,
        enum : ['success', 'failed', 'pending'],
        default: 'pending',
    },
    action_status: {    
        type: String,
        required: true,
        enum : ['approve', 'reject', 'pending'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Payment', paymentSchema);




