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


//get Product
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) return res.status(400).send("Invalid Product");
    //find->filter is delelted and by id
    const product = await Product.find({
        $and: [
            {
                _id: id,
            },
            {
                isDeleted: {
                    $ne: true,
                },
            },
        ],
    });
    if (!product) return res.status(404).send("Product not found");

    res.send(product);
});

//search for product
router.post("/search", async (req, res) => {
    const searchparams = {
        ...req.body,
    };
    if (searchparams.title) {
        await Product.find(
            {
                $and: [
                    {
                        title: new RegExp(".*" + searchparams.title + ".*"), //TODO : case sensitive???
                    },
                    {
                        isDeleted: { $ne: true },
                    },
                ],
            },
            (error, result) => {
                if (error) {
                    return res.send(error);
                }
                return res.send(result);
            }
        );
    } else if (searchparams.Brand) {
        await Product.find(
            {
                $and: [
                    {
                        "details.Brand": new RegExp(".*" + searchparams.Brand + ".*"), //TODO : case sensitive???
                    },
                    {
                        isDeleted: { $ne: true },
                    },
                ],
            },
            (error, result) => {
                if (error) {
                    return res.send(error);
                }
                return res.send(result);
            }
        );
    } else if (searchparams.Processor) {
        await Product.find(
            {
                $and: [
                    {
                        "details.Processor": new RegExp(
                            ".*" + searchparams.Processor + ".*"
                        ), //TODO : case sensitive???
                    },
                    {
                        isDeleted: { $ne: true },
                    },
                ],
            },
            (error, result) => {
                if (error) {
                    return res.send(error);
                }
                return res.send(result);
            }
        );
    } else {
        return res.status(404).send("No match found");
    }
    return res.status(404).send("No data sent for search");
});



module.exports = router;
