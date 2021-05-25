const express = require("express");
const User = require("../models/user");

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
