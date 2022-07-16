const router = require("express").Router();
const Dpr = require("../models/dpr.model");

router.post("/getAllDpr", async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).send({ msg: "Invalid request" });

  try {
    const result = await Dpr.find({ projectId: projectId }).sort({ date: -1 });
    let resObj = {};
    result.forEach(elem => {
      let date = elem._doc.date.toDateString();
      resObj[date] ? resObj[date].push(elem) : (resObj[date] = [elem]);
    });
    res.status(200).send(resObj);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ msg: "Error while getting DPR. Please try again later" });
  }
});

router.post("/addDpr", async (req, res) => {
  const { material, activity, work_desc, quantity_work, labor, projectId, date, equipment, miscellaneous} =
    req.body;
  const newDpr = new Dpr({
    date: new Date(date.split('T')[0]),
    material,
    activity,
    work_desc,
    quantity_work,
    labor,
    equipment,
    projectId,
    miscellaneous,
  });

  try {
    const dpr = await newDpr.save();
    res.status(200).send({
      date: dpr._doc.date.toDateString(),
      dpr: newDpr,
      msg: "Succesfully added Daily Progress Report",
    });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ msg: "Error while saving DPR. Please try again later" });
  }
});

router.post("/deleteDpr", async (req, res) => {
  const { id } = req.body;

  try {
    await Dpr.findOneAndDelete({ _id: id });

    return res.status(200).send({ msg: "DPR Deleted Successfully" });
  } catch (err) {
    return res.status(400).send({ msg: "Error while deleting" });
  }
});

module.exports = router;
