const Joi = require('joi');

// depositeValidation

const depositValidation = (data) => {
    const schema = Joi.object({
        amount: Joi.number().positive().required(),
        utr_no: Joi.string().min(12).required(),
    });
    return schema.validate(data);
};  


module.exports = { depositValidation };