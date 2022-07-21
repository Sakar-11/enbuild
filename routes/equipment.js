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
router.post("/editEquipment/:editId", async (req, res) => {
  const editId = req.params.editId.toString().trim();;
  const {
    projectId,
    equipmentName,
    equipmentRate,
    equipmentAmount,
    unit,
    equipmentQuantity,
    activity,
  } = req.body;

  const newLib = {
    projectId,
    equipmentName,
    equipmentAmount: parseInt(equipmentAmount),
    equipmentQuantity: parseInt(equipmentQuantity),
    unit,
    equipmentRate: parseInt(equipmentRate),
    activity,
  };

  try {
    // const Equipment = await newLib.save();
    const response = await Equipment.findByIdAndUpdate({ '_id': editId }, newLib);
    response.status(201).send({
      lib: Equipment._doc,
      msg: "Succesfully edited to Equipment",
    });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ msg: "Error while saving to Equipment. Please try again later" });
  }
});

router.post("/deleteEquipment/:deleteId", async (req, res) => {
  const deleteId = req.params.deleteId.toString().trim();

  try {
    // const Equipment = await newLib.save();
    if (deleteId != undefined) {
      console.log('deleteId' + deleteId)
      const response = await Equipment.findByIdAndDelete({ '_id': deleteId });
      return res.status(200).json({ msg: "Chemical Deleted", success: true });

    }
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ msg: "Error while saving to Equipment. Please try again later" });
  }
});

module.exports = router;
