const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Cart = require("../models/cart");
const Order = require("../models/order");
const validateUser = require("../helpers/validateuser");
const validateObjectId = require("../helpers/validateobjectid");
const validateEmail = require("../helpers/validateemail");
const CheckToken = require("../midlware/auth");

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

//add profile image
router.post(
  "/upload/profile/:id",
  [CheckToken, upload.single("image")],
  async (req, res) => {
    const { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).send(error.details);
    const user = await User.findOne({
      _id: req.params.id,
    });
    if (!user) return res.status(404).send("user Not found");

    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      user.image = url + "/" + req.file.filename;
      await user.save();
    } else throw "no file";
    return res.status(203).send(user);
  }
);

//delete user method

router.delete("/:id", CheckToken, async (req, res) => {
  const { error } = validateObjectId(req.params.id);
  if (error) return res.status(400).send(error.details);
  const user = await User.findById({
    _id: req.params.id,
  });
  if (!user) return res.status(404).send("user not found");
  await Cart.deleteOne({
    _id: user.cart,
  });
  user.orders.forEach(async (element) => {
    await Order.deleteOne({
      _id: element,
    });
  });
  await User.deleteOne({
    _id: user._id,
  });
  return res.status(204).send();
});

//get user by id
router.get("/:id", CheckToken, async (req, res) => {
  const { error } = validateObjectId(req.params.id);
  if (error) {
    return res.status(400).send(error.details);
  }
  const user = await User.find({
    _id: req.params.id,
  });
  return res.send(user);
});

//edit user's data
router.patch("/:id", CheckToken, async (req, res) => {
  const { error } = validateObjectId(req.params.id);
  if (error) return res.status(400).send(error.details);
  let userInDB = await User.findOne({
    _id: req.params.id,
  });
  const user = {
    ...req.body,
  };
  if (user.email) {
    const { emailError } = validateEmail(user.email);
    if (emailError) return res.status(400).send("in valid email");
    userInDB.email = user.email;
  }
  userInDB.userName = user.userName ? user.userName : userInDB.userName;
  userInDB.gender = user.gender ? user.gender : userInDB.gender;
  if (user.password && user.password != "null") {
    const salt = await bcrypt.genSalt(10);
    userInDB.password = await bcrypt.hash(user.password, salt);
  }
  await userInDB.save();

  const payload = {
    user: {
      id: userInDB._id,
      userName: user.userName,
      isAdmin: user.isAdmin,
    },
  };

  jwt.sign(
    payload,
    "secret",
    {
      expiresIn: 10000,
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
  // return res.status(200).send(userInDB);
});

module.exports = router;