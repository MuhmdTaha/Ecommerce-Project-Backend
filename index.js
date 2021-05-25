const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const usersRouter = require("./routes/users");
const ordersRouter = require("./routes/orders");
const productRouter = require("./routes/products");
const cartsRoutser = require("./routes/carts");
var cors = require("cors");
const app = express();

const mongoURL = "mongodb+srv://mohamed-admin:mohamed-admin@cluster0.9hgm2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const port = 4001;

mongoose
    .connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.log("Failed to connect to Mongodb,", err.message));

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

app.listen(port, () => console.log(`Server is listening on port ${port}`));
