const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Cart = require("../models/cart");
const validateUser = require("../helpers/validateuser");
const validateEmail = require("../helpers/validateemail");

const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/users");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".")[1];
    cb(null, "user" + "-" + Date.now() + "." + ext);
  },
});
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", async (req, res) => {
  const users = await User.find({});
  res.send(users);
});

//signup method

router.post("/signup", async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).send(error.details);
    }
    try {
      const { email, userName, password, gender, isAdmin, image } = req.body;
  
      const userExists = await User.findOne({
        email,
      });
  
      if (userExists) return res.status(400).send("email already exist");
      let user = new User({
        userName,
        email,
        gender,
        isAdmin,
        password,
        image,
      });
  
      let cart = new Cart({
        userId: user._id,
        productsList: [],
      });
      user.cart = cart._id;
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      await cart.save();
      const payload = {
        user: {
          id: user._id,
          userName: user.userName,
          isAdmin: user.isAdmin,
        },
      };
      jwt.sign(
        payload,
        "secret",
        {
          expiresIn: "24h",
        },
        (err, token) => {
          if (err) return res.status(500).send("token creation error");
          return res
            .status(200)
            .json({
              token,
              user,
            })
            .send();
        }
      );
    } catch (error) {
      return res.status(500).send("seving error");
    }
  });


  //login methos

router.post("/login", async (req, res) => {
    const { error } = validateEmail(req.body.email);
    if (error) {
      return res.status(400).send("invalid Email");
    }
  
    const { email, password } = req.body;
    try {
      let user = await User.findOne({
        email,
      });
      if (!user) return res.statusCode(404).send("email not found");
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.statusCode(400).send("password is incorrect");
      const payload = {
        user: {
          id: user._id,
          userName: user.userName,
          isAdmin: user.isAdmin,
        },
      };
      jwt.sign(
        payload,
        "secret",
        {
          expiresIn: "24h",
        },
        (error, token) => {
          if (error) return res.statusCode(400).send("error in token creation");
          return res
            .status(200)
            .json({
              token,
              user,
            })
            .send();
        }
      );
    } catch (error) {
      return res.status(400).send("error");
    }
  });
  
  
