const router = require("express").Router();
const Equipment = require("../models/equipment.model");

router.post("/getEquipment", async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).send({ msg: "Invalid request" });

  try {
    const result = await Equipment.find({ projectId: projectId });
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ msg: "Error while getting Equipment. Please try again later" });
  }
});

router.post("/addToEquipment", async (req, res) => {
  const {
    projectId,
    equipmentName,
    equipmentRate,
    equipmentAmount,
    unit,
    equipmentQuantity,
    activity,
  } = req.body;

  const newLib = new Equipment({
    projectId,
    equipmentName,
    equipmentAmount: parseInt(equipmentAmount),
    equipmentQuantity: parseInt(equipmentQuantity),
    unit,
    equipmentRate: parseInt(equipmentRate),
    activity,
  });

  try {
    const Equipment = await newLib.save();
    res.status(200).send({
      lib: Equipment._doc,
      msg: "Succesfully added to Equipment",
    });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ msg: "Error while saving to Equipment. Please try again later" });
  }
});

module.exports = router;
