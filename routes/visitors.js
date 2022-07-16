const router = require("express").Router();
const visitors = require("../models/visitors.model");

router.post("/", async (req, res) => {
  const {
    fullname,
    email,
    mobile,
  } = req.body;
  console.log(req.body);
  try {
    console.log("Entered");
    let newVisitor = new visitors({
          fullname: fullname,
          email: email,
          mobile: mobile,
    });
    await newVisitor.save();
    res.status(200).json("Form Saved successful");
    }catch (err) {
        return res.status(400).json({ err: "Error saving information" });
      }
});
module.exports = router;
