const express = require("express");
const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const Cart = require("../models/cart");
const validateOrder = require("../helpers/validateorder");
const CheckToken = require("../midlware/auth");
const validateObjectId = require("../helpers/validateobjectid");
const router = express.Router();







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

    //update state only: accepted (decrease quantity from product) - rejected

router.patch("/:id", CheckToken, async (req, res) => {
    const id = req.params.id;
    const { error } = validateObjectId(id);
    if (error) {
      return res.status(400).send("Invalid ID");
    }
    const order = await Order.findById(id);
    if (!order) return res.status(404).send("Order Not Found");
  
    const status = req.body.status;
    //update
    if (
      (order.status === "pending" &&
        (status === "accepted" || status === "rejected")) ||
      status === "cancelled"
    ) {
      order.status = status;
      order.products.forEach(async (element) => {
        const product = await Product.findById(element.product);
        if (product.quantity < element.quantity) {
          return res.status(400).send(`run out of stock product ${element}`);
        }
        if (status === "rejected" || status === "cancelled") {
          //plus qty if rejected
          product.quantity += element.quantity;
        }
        await product.save();
      });
    }
    order.save();
    return res.send(order);
  });

  //cancel order if pending:
router.delete("/:id", CheckToken, async (req, res) => {
    const id = req.params.id;
    const { error } = validateObjectId(id);
    if (error) {
      return res.status(400).send("Invalid ID");
    }
    oldOrder = await Order.findById(id);
    if (!oldOrder) {
      return res.status(400).send("Order not found");
    }
    if (oldOrder.status == "pending") {
      const deletedOrder = await Order.findByIdAndUpdate(
        id,
        {
          status: "cancelled",
        },
        {
          new: true,
        }
      );
      res.send(deletedOrder);
    } else {
      return res
        .status(400)
        .send(
          "Cannot cancel order. Orders can be cancelled only if they are pending."
        );
    }
  });
  
  module.exports = router;