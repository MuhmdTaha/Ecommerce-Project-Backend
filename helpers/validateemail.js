const Joi = require('joi');
const emailSchema = email => Joi.string().email().required().validate(email);
module.exports = emailSchema;