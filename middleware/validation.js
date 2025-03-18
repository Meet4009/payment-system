const Joi = require("joi");

// Register Validation Function
const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(255).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
        upiId: Joi.string().required(),
        password: Joi.string().min(4).max(255).required(),
        // Do NOT include profileImage here
    });
    return schema.validate(data);
};


// Login Validation Function
const loginValidation = (data) => {
    const schema = Joi.object({
        login: Joi.string().required(), // Can be email or phone number
        password: Joi.string().min(4).required(),
    });
    return schema.validate(data);
};

// Validate profile update
const profileUpdateValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(4),
        email: Joi.string().min(6).email(),
        phone: Joi.string().length(10).pattern(/^[0-9]+$/),
    });
    return schema.validate(data);
};

// Validate password reset
const updatePasswordValidation = (data) => {
    const schema = Joi.object({
        password: Joi.string().min(4).required(),
        newPassword: Joi.string().min(4).required(),
        confirmPassword: Joi.string().required(),
    });
    return schema.validate(data);
};


// Validate deposit
const depositValidation = (data) => {
    const schema = Joi.object({
        amount: Joi.number().positive().required(),
        utr_no: Joi.string().min(12).required(),
    });
    return schema.validate(data);
};

const withdrawValidation = (data) => {
    const schema = Joi.object({
        amount: Joi.number().positive().required(),
        upi_id: Joi.string().min(8)
    });
    return schema.validate(data);
};

module.exports = { registerValidation, loginValidation, profileUpdateValidation, updatePasswordValidation, depositValidation, withdrawValidation };