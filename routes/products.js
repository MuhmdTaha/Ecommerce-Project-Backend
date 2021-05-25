const express = require("express");
const Product = require("../models/product");

const router = express.Router();

//get all products
router.get("/", async (req, res) => {
    const products = await Product.find({
        isDeleted: {
            $ne: true,
        },
    });
    if (!products) return res.status(404).send("Product not found");
    res.send(products);
});

module.exports = router;
