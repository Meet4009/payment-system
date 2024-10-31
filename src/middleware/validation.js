const Joi = require('joi');

// Validate user registration input
const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(4).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
};

// Validate user login input
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
};

// Validate profile update
const profileUpdateValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(4),
        email: Joi.string().min(6).email(),
    });
    return schema.validate(data);
};

module.exports = { registerValidation, loginValidation, profileUpdateValidation };