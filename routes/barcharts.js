const router = require("express").Router();
const BarChart = require("../models/barchart.model");
const Apartment = require("../models/apartment.model");
const Projects = require("../models/project.model");
const ObjectId = require("mongodb").ObjectID;
const userLogin = require("../models/userLogin.model");
const utils = require("./notificationsUtil");
const DefaultActivities = require("../models/defaultProjectActivities.model");
// there are differnet functions for each of the notifications becasue the notifications may change later depending upon the type !
const barchartNotifications = async (subprojectId) => {
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
      // console.log(resp._doc["totalUsers"]);
      var notif_array = [];
      for (var user of resp._doc["totalUsers"]) {
        console.log(user);
        if (notif_roles.includes(user["role"])) notif_array.push(user["user"]);
      }
      // console.log(notif_array);
      await userLogin.find(
        {
          _id: { $in: notif_array },
        },
        async function (err, docs) {
          var users = [];
          for (var doc of docs) {
            users = users.concat(doc._doc["notification_id"]);
          }
          users = users.filter((element) => {
            return element != undefined;
          });
          await Apartment.findById(subprojectId, (err, resp_) => {
            // console.log(resp_._doc["subProjectName"]);
            utils.notify(
              users,
              resp_._doc["subProjectName"],
              "A new Bar Chart is added ! Check It Out !"
            );
          });
        }
      );
    }
  );
};
router.route("/add").post(async (req, res) => {
  console.log(req.body.data);
  try {
    var bar = await BarChart.findOne({ subprojectId: req.body.subprojectId });
    var mainData = req.body.data;
    var dataWithDuration = mainData.map((item) => {
      var days = -1;
      if (item[2] != null && item[1] != null) {
        days =
          new Date(item[2].toString()).getTime() -
          new Date(item[1].toString()).getTime();
        days = days / (1000 * 3600 * 24);
      }

      return [...item, Math.ceil(days)];
    });

    if (bar) {
      bar = JSON.stringify(bar);
      bar = JSON.parse(bar);
      let newData = req.body.data;

      console.log(bar._id);
      const response = await BarChart.findByIdAndUpdate(bar._id, {
        $set: { data: dataWithDuration },
      });
      res.status(200).send("Success");
    } else {
      console.log("Saving as new");
      var data = req.body.data;
      let newData = {
        subprojectId: req.body.subprojectId,
        data: dataWithDuration,
      };
      var barchart = new BarChart(newData);
      barchart.save();
      barchartNotifications(req.body.subprojectId);
      res.status(200).send("Success");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error.message });
  }
});

router.route("/:subprojectId/:projectId").get(async (req, res) => {
  const subprojectId = req.params.subprojectId;
  const projectId = req.params.projectId;
  try {
    var response = await BarChart.findOne({ subprojectId });
    response = JSON.stringify(response);
    response = JSON.parse(response);
    response = response && response.data ? response.data : [];

    var activity = await DefaultActivities.findOne({ projectId });
    activity = JSON.stringify(activity);
    activity = JSON.parse(activity).data;
    console.log(activity);
    activity = activity.filter((item) => item.visibility);
    var newData = activity.map((item) => {
      var newRes = response.find((newItem) => newItem[0] === item.title);
      if (newRes) {
        return newRes;
      } else {
        return [item.title, null, null];
      }
    });

    // console.log(newData);

    res.status(200).send(newData);
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: err.message });
  }
});

module.exports = router;
