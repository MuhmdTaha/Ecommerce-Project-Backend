const express = require("express");

const Order = require("../models/order");
const CheckToken = require("../middleware/auth");
const validateObjectId = require("../helpers/validateobjectid");
const router = express.Router();
const Cart = require("../models/cart");
const User = require("../models/user");
const Product = require("../models/product");








//view admin orders
router.get("/", async (req, res) => {
    const orders = await Order.find({});
    if (!orders) return res.status(404).send("No orders found");
    res.send(orders);
  });

  //view user orders
router.get("/user/:id", CheckToken, async (req, res) => {
    const id = req.params.id;
    const { error } = validateObjectId(id);
    if (error) {
      return res.status(400).send("Invalid ID");
    }
    const orders = await Order.find({
      user: id,
    });
    if (!orders) {
      return res.status(400).send("No orders found");
    }
    res.send(orders);
  });

 
  //make order
router.post("/", CheckToken, async (req, res) => {
    const id = req.body.user;
    const { error } = validateObjectId(id);
    if (error) {
      return res.status(400).send(error.details);
    }
    const user = await User.findOne({
      _id: id,
    });
    if (!user) return res.status(404).send("user not found");
    const cart = await Cart.findById(user.cart);
    if (!cart.productsList.length) return res.status(400).send("cart is empty");
    var totalPrice = 0;
    let order = new Order({
      user: req.body.user,
      date: Date.now(),
      price: 0,
      products: [],
      status: "pending",
    });  

    for (var i = 0; i < cart.productsList.length; i++) {
        order.products.push({
          product: cart.productsList[i].productId,
          quantity: cart.productsList[i].quantity,
        });
        const product = await Product.findById(cart.productsList[i].productId);
        totalPrice +=
          (product.price - product.price * product.ratioOfPromotion) *
          cart.productsList[i].quantity;
        order.price = totalPrice;
      }
    
      await order.save();
      user.orders.push(order.id);
      await user.save();
      cart.productsList = []; 
      await cart.save(); 
      return res.send(order);
    });