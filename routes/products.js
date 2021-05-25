const express = require("express");
const Product = require("../models/product");

const multer = require("multer");
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/products");
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split(".")[1];
        cb(null, "product" + "-" + Date.now() + "." + ext);
    },
});
const upload = multer({ storage: storage });

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

//get promoted products only
router.get("/promoted", async (req, res) => {
    const products = await Product.find({
        $and: [
            {
                ratioOfPromotion: { $gt: 0 },
            },
            {
                isDeleted: false,
            },
        ],
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

//delete product
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) return res.status(400).send("Invalid Product");
    const product = await Product.findByIdAndUpdate(id, {
        $set: {
            isDeleted: true,
        },
    });
    if (!product) return res.status(404).send("Product not found");
    const deleltedProduct = await Product.findById(id);
    res.send(deleltedProduct);
});

//edit product
router.patch("/:id", upload.array("images", 5), async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) return res.status(400).send(error.details);
    const product = {
        ...req.body,
    };

    let productFromDB = await Product.findOne({
        _id: id,
    });
    productFromDB.title = product.title ? product.title : productFromDB.title;
    productFromDB.price = product.price ? product.price : productFromDB.price;
    productFromDB.ratioOfPromotion = product.ratioOfPromotion
        ? product.ratioOfPromotion
        : productFromDB.ratioOfPromotion;
    productFromDB.quantity = product.quantity
        ? product.quantity
        : productFromDB.quantity;
    productFromDB.isDeleted = product.isDeleted
        ? product.isDeleted
        : productFromDB.isDeleted;
    if (!product.details) {
        productFromDB.details = productFromDB.details;
    } else {
        productFromDB.details.Brand = product.details.Brand
            ? product.details.Brand
            : productFromDB.details.Brand;
        productFromDB.details.Processor = product.details.Processor
            ? product.details.Processor
            : productFromDB.details.Processor;
        productFromDB.details.RAM = product.details.RAM
            ? product.details.RAM
            : productFromDB.details.RAM;
        productFromDB.details.HardDisk = product.details.HardDisk
            ? product.details.HardDisk
            : productFromDB.details.HardDisk;
        productFromDB.details.GPU = product.details.GPU
            ? product.details.GPU
            : productFromDB.details.GPU;
        productFromDB.details.Color = product.details.Color
            ? product.details.Color
            : productFromDB.details.Color;
    }
    if (req.files && req.files.length) {
        let images = [];
        req.files.forEach((image) => {
            const url = req.protocol + "://" + req.get("host");
            images.push(`${url}/${image.filename}`);
        });
        productFromDB.images = images;
    } else {
        productFromDB.images = productFromDB.images;
    }

    await productFromDB.save();
    res.send(productFromDB);
});

//add product
router.post("/", upload.array("images", 5), async (req, res) => {
    const { error } = validateProduct(req.body);
    if (error) return res.status(400).send(error.details);
    let product = new Product({
        ...req.body,
    });

    if (req.files && req.files.length) {
        req.files.forEach((image) => {
            const url = req.protocol + "://" + req.get("host");
            product.images.push(`${url}/${image.filename}`);
        });
    } else {
        product.images = [];
    }

    product.isDeleted = false;
    product = await product.save();
    res.send(product);
});

module.exports = router;
