const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date
    },
    price: {
        type: Number,
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number
        }
    }],
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "cancelled"],
        required: true
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;