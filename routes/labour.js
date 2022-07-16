const router = require("express").Router();
const Labour = require("../models/labour.model");

router.post("/getLabour", async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).send({ msg: "Invalid request" });

  try {
    const result = await Labour.find({ projectId: projectId });
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ msg: "Error while getting Labour. Please try again later" });
  }
});

router.post("/addToLabour", async (req, res) => {
  const {
    projectId,
    labourName,
    labourRate,
    activity,
    number_of_labourers,
    labourAmount,
    unit,
  } = req.body;

  const newLib = new Labour({
    projectId,
    labourName,
    number_of_labourers: parseInt(number_of_labourers),
    labourAmount: parseInt(labourAmount),
    labourRate: parseInt(labourRate),
    activity,
    unit,
  });

  try {
    const Labour = await newLib.save();
    res.status(200).send({
      lib: Labour._doc,
      msg: "Succesfully added to Labour",
    });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ msg: "Error while saving to Labour. Please try again later" });
  }
});

module.exports = router;
