const express = require("express");
const Cart = require("../models/cart");
const User = require("../models/user");
const Product = require("../models/product");
const CheckToken = require("../midlware/auth");
const validateObjectId = require("../helpers/validateobjectid");
const validateCart = require("../helpers/validatecart");

const router = express.Router();

//Get User's Cart
router.get("/user/:id", CheckToken, async (req, res) => {
  const id = req.params.id;
  const { error } = validateObjectId(req.params.id);
  if (error) return res.status(400).send("User id is not valid");
  const cart = await Cart.find({
    userId: id,
  });
  if (!cart) return res.status(404).send("Cart is not found for this user.");
  res.status(200).send(cart);
});

//Post product to user's cart
router.post("/user/:id", [CheckToken, validateCart], async (req, res) => {
  const { error } = validateObjectId(req.params.id);
  if (error) return res.status(400).send("User id is not valid");

  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("User is not found");

  const userCart = await Cart.findById(user.cart); //elcart beta3t eluser dah
  if (!userCart) return res.status(400).send("User's cart is not found");

  const product = await Product.findById(req.body.productsList[0].productId);
  if (!product) return res.status(400).send("Product is not found");

  const indexFound = userCart.productsList.findIndex((item) => {
    return item.productId == req.body.productsList[0].productId;
  });

  if (indexFound !== -1 && product.quantity >= 0) {
    //here
    if (product.quantity - req.body.productsList[0].quantity >= 0) {
      //available enough qty
      userCart.productsList[indexFound].quantity = //plus in userCart
        parseInt(userCart.productsList[indexFound].quantity) +
        parseInt(req.body.productsList[0].quantity);
      product.quantity = product.quantity - req.body.productsList[0].quantity; //minus in products
    } else {
      //products < desired qty
      return res.status(400).send("More than available quantity");
    }
  } else if (product.quantity > 0) {
    //not in cart yet
    if (product.quantity - req.body.productsList[0].quantity >= 0) {
      userCart.productsList.push({
        productId: req.body.productsList[0].productId,
        quantity: req.body.productsList[0].quantity,
      });
      product.quantity = product.quantity - req.body.productsList[0].quantity;
    } else {
      //products < desired qty
      return res.status(400).send("More than available quantity");
    }
  } else {
    return res.status(400).send("More than available quantity");
  }

  await userCart.save();
  await product.save();
  res.status(200).send(userCart);
});

//Delete a product is user's cart
router.delete(
  "/user/:id/product/:productId",
  [CheckToken],
  async (req, res) => {
    const { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).send("User id is not valid");

    const { error2 } = validateObjectId(req.params.productId);
    if (error2) return res.status(400).send("Product id is not valid");

    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).send("User is not found");

    let cart = await Cart.find({ userId: req.params.id });
    if (!cart) return res.status(400).send("User's cart is not found");

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(400).send("Product ID is not found");

    const indexFound = cart[0].productsList.findIndex((item) => {
      return item.productId == req.params.productId;
    });
    if (indexFound !== -1) {
      //found

      product.quantity =
        product.quantity + cart[0].productsList[indexFound].quantity;

      cart[0].productsList.splice(indexFound, 1);
    }

    await cart[0].save();
    await product.save();
    res.status(200).send(cart);
  }
);

//Checkout => Empty Cart
router.get("/user/:id/checkout", [CheckToken], async (req, res) => {
  const { id } = req.params;
  const { error } = validateObjectId(req.params.id);
  if (error) return res.status(400).send("User id is not valid");

  const user = await User.findById(id);
  if (!user) return res.status(400).send("User is not found");

  let cart = await Cart.find({ userId: id });
  if (!cart) return res.status(400).send("User's cart is not found");

  cart[0].productsList.splice(0, cart[0].productsList.length);

  await cart[0].save();

  res.status(200).send(cart);
});

module.exports = router;
