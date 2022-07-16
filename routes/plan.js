const Plan = require("../models/plan.model");
const router = require("express").Router();
const Apartment = require("../models/apartment.model");
const Projects = require("../models/project.model");
const ObjectId = require("mongodb").ObjectID;
const userLogin = require("../models/userLogin.model");
const utils = require("./notificationsUtil");
const planingNotifications = async (subprojectId, msg) => {
  console.log("hi buddy");
  var notif_roles = [
    "senior_engineer",
    "project_manager",
    "planning_manager",
    "chief_engineer",
    "technical_director",
  ];
  console.log(subprojectId);
  await Projects.findOne(
    { apartments: { $in: [ObjectId(subprojectId)] } },
    async (err, resp) => {
      if (err) {
        throw err;
      }
      console.log(resp._doc["totalUsers"]);
      var notif_array = [];
      for (var user of resp._doc["totalUsers"]) {
        console.log(user);
        if (notif_roles.includes(user["role"])) notif_array.push(user["user"]);
      }
      console.log(notif_array);
      await userLogin.find(
        {
          _id: { $in: notif_array },
        },
        async function (err, docs) {
          var users = [];
          for (var doc of docs) {
            users = users.concat(doc._doc["notification_id"]);
          }
          users = users.filter(element => {
            return element != undefined;
          });
          await Apartment.findById(subprojectId, (err, resp_) => {
            // console.log(resp_._doc["subProjectName"]);
            utils.notify(users, resp_._doc["subProjectName"], msg);
          });
        }
      );
    }
  );
};

router.route("/addPlan").post(async (req, res) => {
  console.log(req.body);
  try {
    planingNotifications(
      req.body.subprojectId,
      `New Plan Created ! Check It Out !\nPlan: ${req.body.planTitle}\nDeadline: ${req.body.deadline}`
    );
    const plan = new Plan(req.body);
    await plan.save();
    return res.status(200).json(plan);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.route("/getPlan/:id").get(async (req, res) => {
  try {
    const response = await Plan.find({ subprojectId: req.params.id });
    return res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.route("/deletePlan/:id/:subprojectId").delete(async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    planingNotifications(req.params.subprojectId, "A plan is deleted !");
    return res.status(200).json({ msg: "Deleted", success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.route("/updatePlan/:id").put(async (req, res) => {
  try {
    planingNotifications(
      req.body.subprojectId,
      "A plan is Completed ! Check it out !"
    );
    await Plan.updateOne({ planId: Number(req.params.id) }, { $set: req.body });
    return res.status(200).json({ msg: "Updated", success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
