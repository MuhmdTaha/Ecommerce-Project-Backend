const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);


const orderSchema = Joi.object({
    user: Joi.objectId().required(),
    date: Joi.date().optional(),
    price: Joi.number(),
    products: Joi.array().items(Joi.object({
        productId: Joi.objectId().optional(),
        quantity: Joi.number().optional(),
    })).default([]),
    status: Joi.string().valid('cancelled', 'pending', 'accepted', 'rejected').required().default('pending'),
    isCancelled: Joi.boolean().optional().default(false)
});

const validateOrder = order => orderSchema.validate(order, {
    abortEarly: false
});

module.exports = validateOrder;