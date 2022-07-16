const router = require("express").Router();
const Library = require("../models/library.model");

router.post("/getLibrary", async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).send({ msg: "Invalid request" });

  try {
    const result = await Library.find({ projectId: projectId });
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ msg: "Error while getting Library. Please try again later" });
  }
});

router.post("/addToLibrary", async (req, res) => {
  const {
    projectId,
    materialName,
    materialQuantity,
    materialUnit,
    materialRate,
    materialAmount,
    activity,
  } = req.body;

  const newLib = new Library({
    projectId,
    materialName,
    materialQuantity: parseInt(materialQuantity),
    materialRate: parseInt(materialRate),
    materialUnit,
    materialAmount: parseInt(materialAmount),
    activity,
  });

  try {
    const library = await newLib.save();
    res.status(200).send({
      lib: library._doc,
      msg: "Succesfully added to Library",
    });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ msg: "Error while saving to Library. Please try again later" });
  }
});

module.exports = router;
