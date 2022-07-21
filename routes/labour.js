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






router.post("/editLabour/:editId", async (req, res) => {
  const editId = req.params.editId.toString().trim();;
  const {
    projectId,
    labourName,
    labourRate,
    activity,
    number_of_labourers,
    labourAmount,
    unit,
  } = req.body;

  const newLib = {
    projectId,
    labourName,
    number_of_labourers: parseInt(number_of_labourers),
    labourAmount: parseInt(labourAmount),
    labourRate: parseInt(labourRate),
    activity,
    unit,
  };

  try {
    // const Equipment = await newLib.save();
    const response = await Labour.findByIdAndUpdate({ '_id': editId }, newLib);
    response.status(201).send({
      lib: Labour._doc,
      msg: "Succesfully edited to Equipment",
    });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ msg: "Error while saving to Equipment. Please try again later" });
  }
});

router.post("/deleteLabour/:deleteId", async (req, res) => {
  const deleteId = req.params.deleteId.toString().trim();

  try {
    // const Equipment = await newLib.save();
    if (deleteId != undefined) {
      console.log('deleteId' + deleteId)
      const response = await Labour.findByIdAndDelete({ '_id': deleteId });
      return res.status(200).json({ msg: "Labour Deleted", success: true });

    }
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ msg: "Error while saving to Equipment. Please try again later" });
  }
});

module.exports = router;
