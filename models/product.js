const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        //required: true
    }],
    price: {
        type: Number,
        required: true
    },
    details: {
        Brand: {
            type: String
        },
        Processor: {
            type: String
        },
        RAM: {
            type: String
        },
        HardDisk: {
            type: String
        },
        GPU: {
            type: String
        },
        Color: {
            type: String
        }
    },
    ratioOfPromotion: {
        type: Number
    },
    quantity: {
        type: Number,
        required: true
    },
    isDeleted: {
        type: Boolean
    }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;