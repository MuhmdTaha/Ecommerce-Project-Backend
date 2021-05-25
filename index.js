const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

var cors = require("cors");
const app = express();

const port = 4001;


app.use(express.static("./uploads/users"));
app.use(express.static("./uploads/products"));
app.use(express.static("./uploads/logo"));
app.use(express.static("./uploads/slider"));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());
app.options("*", cors());

app.use("/products", productRouter);
app.use("/orders", ordersRouter);
app.use("/users", usersRouter);
app.use("/carts", cartsRoutser);

app.listen(port, () => console.log(`Server listens on port ${port}`));
