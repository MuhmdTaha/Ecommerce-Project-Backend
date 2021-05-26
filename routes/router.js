const express = require("express");

const Order = require("../models/order");






//view admin orders
router.get("/", async (req, res) => {
    const orders = await Order.find({});
    if (!orders) return res.status(404).send("No orders found");
    res.send(orders);
  });