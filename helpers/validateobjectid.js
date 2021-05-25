const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validateObjectId = id => Joi.objectId().validate(id);

module.exports = validateObjectId;