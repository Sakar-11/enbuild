// const auth = require("../middleware/auth");
const Material = require("../models/material.model");
const Store = require("../models/store.model");
const router = require("express").Router();
const ObjectId = require("mongodb").ObjectID;
// const Apartment = require("../models/apartment.model");
const userLogin = require("../models/userLogin.model");
const utils = require("./notificationsUtil");
const Projects = require("../models/project.model");

const materialNotifications = async (projectId, msg) => {
  console.log("hi buddy");
  var notif_roles = [
    "store_manager",
    "senior_engineer",
    "project_manager",
    "purchase_manager",
    "chief_engineer",
    "technical_director",
  ];
  console.log(projectId);
  await Projects.findOne({ _id: ObjectId(projectId) }, async (err, resp) => {
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

        utils.notify(users, resp._doc["projectName"], msg);
      }
    );
  });
};
router.route("/addMaterial").post(async (req, res) => {
  try {
    console.log(req.body);
    const { materialQuantity, materialName, expectedDate } = req.body;
    var msg = `${
      req.body.materialQuantity
    } quantities of ${materialName} are ordered and expected to be delivered on ${new Date(
      expectedDate
    ).toDateString()}! Check it out in Delivery Options!`;
    console.log(msg);
    materialNotifications(req.body.projectId, msg);
    const material = new Material(req.body);
    await material.save();
    return res.status(200).json(material);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.route("/getMaterial/:id").get(async (req, res) => {
  try {
    const response = await Material.find({ projectId: req.params.id });
    return res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.route("/updateMaterial/:id").put(async (req, res) => {
  // console.log(req.body);
  try {
    await Material.updateOne(
      { materialID: Number(req.params.id) },
      { $set: req.body }
    );
    materialNotifications(
      req.body.projectId,
      "Material Quantities are Updated ! Check them out !"
    );
    return res.status(200).json({ msg: "chemical Updated", success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.route("/addDeliveryDate/:id/:projectId").patch(async (req, res) => {
  const {
    materialName,
    deliveryDate,
    materialQuantity,
    projectId,
    openingBalance,
    closingBalance,
    issue,
  } = req.body.material;
  // console.log(materialQuantity);
  try {
    // console.log(req.body.material);
    await Material.findOneAndUpdate(
      { materialID: Number(req.params.id) },
      { deliveryDate: deliveryDate }
    );
    var item = await Store.findOne({
      materialName: materialName,
      projectId: projectId,
    });
    item = JSON.stringify(item);
    item = JSON.parse(item);
    // console.log(item);
    if (item.openingBalance) {
      item.openingBalance =
        parseInt(item.openingBalance) + parseInt(materialQuantity);
    } else {
      item.openingBalance = parseInt(materialQuantity);
    }
    if (item.closingBalance) {
      item.closingBalance =
        parseInt(item.closingBalance) + parseInt(materialQuantity);
    }
    item.materialQuantity = materialQuantity;
    await Store.findByIdAndUpdate(item._id, item);
    var msg = `${materialQuantity} quantities of ${materialName} are delivered on ${new Date(
      deliveryDate
    ).toDateString()}! Check it out in Delivery Options!`;
    materialNotifications(projectId, msg);
    return res.status(200).json({ msg: "date added", success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.route("/deleteMaterial/:id").delete(async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    materialNotifications(
      req.params.projectId,
      "Material Quantities are Updated ! Check them out !"
    );
    return res.status(200).json({ msg: "Chemical Deleted", success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
