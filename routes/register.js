const router = require("express").Router();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const mongoose = require("mongoose");
// const config = require("config");
const userLogins = require("../models/userLogin.model");

router.post("/", async (req, res) => {
  const {
    email,
    username,
    phone,
    organization,
    firstName,
    lastName,
    password,
    isAdmin,
    requestAdmin,
    mainAdmin,
  } = req.body;
  console.log(req.body);
  try {
    console.log("Entered");
    const user = await userLogins.findOne({ username: username });
    if (!user) {
      try {
        let newUser = new userLogins({
          email: email,
          username: username,
          phone: phone,
          organization: organization,
          password: password,
          firstName: firstName,
          lastName: lastName,
          projects: [],
          isAdmin: isAdmin,
          requestAdmin: requestAdmin,
          mainAdmin: mainAdmin,
        });
        await newUser.save();
        res.status(200).json("User registration successful");
      } catch (err) {
        return res.status(400).json({ err: "Error Registering User" });
      }
    } else {
      return res.status(200).json({ err: "UEXIST" });
    }
  } catch (err) {
    return res.status(400).json({ err: "Error Creating Room." });
  }
});
module.exports = router;
