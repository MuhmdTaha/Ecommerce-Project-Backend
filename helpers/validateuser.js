const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const userSchema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().email().required(),
    image: Joi.string(),
    gender: Joi.string().valid('female', 'male'),
    isAdmin: Joi.boolean().default(false),
    orders: Joi.array().items(Joi.objectId()).default([]),
    cart: Joi.objectId()
});
const validatUser = user => userSchema.validate(user, {
    abortEarly: false
});
module.exports = validatUser;