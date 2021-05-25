const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const cartSchema = Joi.object({
    userId: Joi.objectId().required(),
    productsList: Joi.array()
        .items({
            productId: Joi.objectId().required(),
            quantity: Joi.number().required().default(1),
        }).default([])
});


const validateCart = (req, res, next) => {
    const {
        value,
        error
    } = cartSchema.validate(req.body, {
        abortEarly: false
    });

    if (error) {
        res.status(422).send(error.details[0].message);
    } else {
        next();
    }
};

module.exports = validateCart;