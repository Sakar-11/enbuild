// const auth = require("../middleware/auth");
const Store = require("../models/store.model");
const router = require("express").Router();
const ObjectId = require("mongodb").ObjectID;
// const Apartment = require("../models/apartment.model");
const userLogin = require("../models/userLogin.model");
const utils = require("./notificationsUtil");
const Projects = require("../models/project.model");
const storeNotifications = async (projectId, msg) => {
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
    // console.log(resp);
    // console.log(resp._doc["totalUsers"]);
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
          return element !== undefined;
        });

        utils.notify(users, resp._doc["projectName"], msg);
      }
    );
  });
};
router.route("/getStore/:id").get(async (req, res) => {
  try {
    const response = await Store.find({ projectId: req.params.id });
    var result = JSON.stringify(response);
    result = JSON.parse(result);
    var result2 = await Promise.all(
      result.map(async item => {
        if (!item.openingBalance && !item.closingBalance) {
          return item;
        }
        if (!item.closingBalance && item.openingBalance) {
          item.closingBalance = item.openingBalance;
          item.updateDate = new Date();
          // return item
        } else {
          if (item.updateDate) {
            var date1 = new Date(item.updateDate);
            var condition =
              date1.getFullYear() === new Date().getFullYear() &&
              date1.getDate() === new Date().getDate() &&
              date1.getMonth() === new Date().getMonth();
            if (!condition) {
              item.updateDate = new Date();
              item.openingBalance = item.closingBalance;
            }
          } else {
            item.updateDate = new Date();
          }
        }
        // console.log(item);
        await Store.findByIdAndUpdate(item._id, item);
        return item;
      })
    );
    return res.status(200).json(result2);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

router.route("/updateStore").post(async (req, res) => {
  console.log("store of", req.body);
  const { id, data } = req.body;
  try {
    storeNotifications(
      data.projectId,
      `${req.body.data.materialName} Quantities in store updated!\nOpening Balance: ${req.body.data.openingBalance}\nClosing Balance: ${req.body.data.closingBalance}`
    );
    await Store.findByIdAndUpdate(id, data);
    return res.status(200).json({ msg: "store Updated", success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

router.route("/issueHistory").post(async (req, res) => {
  const { id, data } = req.body;
  // console.log(data);
  var quanity = data["quantity"];
  try {
    var item = await Store.findById(id);
    item = JSON.stringify(item);
    item = JSON.parse(item);
    var arr = [];
    var his = item["issueHistory"];
    if (his) {
      arr = his;
    }
    // console.log(item);
    arr.push(data);
    var msg = `${quanity} quantities of ${item.materialName} are issued to ${data["subProjectName"]}! Check it out`;
    console.log(msg);
    await Store.findByIdAndUpdate(id, {
      issueHistory: arr,
      closingBalance: parseInt(item.closingBalance) - parseInt(quanity),
    });
    storeNotifications(item.projectId, msg);
    return res.status(200).send("Request successful");
  } catch (err) {
    console.log(err);
    res.status(400).send({ msg: err.message });
  }
});

// @ROUTE /store/approveRequisition
// @PARAMS id, data
// @DESC Approves a pending requisition and adds it to the history
router.post("/approveRequisition", async (req, res) => {
  const { id, data } = req.body;
  let quanity = data["quantity"];
  let request_id = data["id"];
  try {
    var item = await Store.findById(id);
    item = JSON.stringify(item);
    item = JSON.parse(item);
    var arr = [];
    var his = item["issueHistory"];
    if (his) {
      arr = his;
    }
    arr.push(data);

    let request_array = item["materialReqIssues"];
    let index = request_array.findIndex(item => item.id === request_id);
    request_array.splice(index, 1);

    if (parseInt(item.closingBalance) - parseInt(quanity) < 0) {
      return res.status(400).send("Not successful");
    }

    var msg = `${quanity} quantities of ${item.materialName} are issued to ${data["subProjectName"]}! Check it out`;
    await Store.findByIdAndUpdate(id, {
      issueHistory: arr,
      closingBalance: parseInt(item.closingBalance) - parseInt(quanity),
      materialReqIssues: request_array,
    });

    storeNotifications(item.projectId, msg);
    return res.status(200).send("Request successful");
  } catch (err) {
    console.log(err);
    res.status(400).send({ msg: err.message });
  }
});

router.route("/issueHistory/:id").get(async (req, res) => {
  var id = req.params.id;
  console.log(id);
  try {
    var item = await Store.findById(id);
    item = JSON.stringify(item);
    item = JSON.parse(item);
    var arr = [];
    if (item["issueHistory"]) {
      arr = item["issueHistory"];
    }
    console.log(arr);
    res.status(200).send(arr);
  } catch (err) {
    res.status(400).send({ msg: err.message });
  }
});

router.route("/materialReqIssues").post(async (req, res) => {
  const { id, data } = req.body;
  // console.log(data);
  var quanity = data["quantity"];
  try {
    var item = await Store.findById(id);
    item = JSON.stringify(item);
    item = JSON.parse(item);
    var arr = [];
    var his = item["materialReqIssues"];
    if (his) {
      arr = his;
    }
    let request_id = ObjectId();
    data["id"] = request_id;
    // console.log(item);
    arr.push(data);
    var msg = `${quanity} quantities of ${item.materialName} are sent for approval ${data["subProjectName"]}! Check it out`;
    console.log(msg);
    await Store.findByIdAndUpdate(id, {
      materialReqIssues: arr,
    });
    storeNotifications(item.projectId, msg);
    return res.status(200).send("Request successful");
  } catch (err) {
    console.log(err);
    res.status(400).send({ msg: err.message });
  }
});

router.route("/materialReqIssues/:id").get(async (req, res) => {
  var id = req.params.id;
  try {
    var item = await Store.findById(id);
    item = JSON.stringify(item);
    item = JSON.parse(item);
    var arr_req = [];
    if (item["materialReqIssues"]) {
      arr_req = item["materialReqIssues"];
    }
    res.status(200).send(arr_req);
  } catch (err) {
    res.status(400).send({ msg: err.message });
  }
});

router.post("/rejectRequisition", async (req, res) => {
  const { id, data } = req.body;
  let request_id = data["id"];
  try {
    var item = await Store.findById(id);
    item = JSON.stringify(item);
    item = JSON.parse(item);

    let request_array = item["materialReqIssues"];
    let index = request_array.findIndex(item => item.id === request_id);
    request_array.splice(index, 1);

    await Store.findByIdAndUpdate(id, {
      materialReqIssues: request_array,
    });
    return res.status(200).send("Request successful");
  } catch (err) {
    console.log(err);
    res.status(400).send({ msg: err.message });
  }
});

/*router.route("/materialReqIssues/:id").delete(async (req, res) => {
  try {
    console.log(req.params.id);
    await Store.findById(req.params.id, (err, res) => {
      storeNotifications(
        res._doc["subprojectId"],
        res._doc["userId"],
        `The material requisition was removed!`
      );
    });
    await Store.findByIdAndDelete(req.params.id);
    return res.status(200).json({ msg: "Deleted", success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});*/

module.exports = router;
