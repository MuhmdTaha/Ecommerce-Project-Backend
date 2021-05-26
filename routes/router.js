const express = require("express");

const Order = require("../models/order");
const CheckToken = require("../midlware/auth");







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