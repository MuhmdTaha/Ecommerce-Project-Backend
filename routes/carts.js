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
