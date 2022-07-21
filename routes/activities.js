const router = require("express").Router();
const Activities = require("../models/activities.model");
const ActivityUpdates = require("../models/activityUpdates.model");
const DefaultActivities = require("../models/defaultProjectActivities.model");
const Apartment = require("../models/apartment.model");
const Projects = require("../models/project.model");
const ObjectId = require("mongodb").ObjectID;
const userLogin = require("../models/userLogin.model");
const utils = require("./notificationsUtil");
router.route("/getDefaultActivities/:projectId").get(async (req, res) => {
  const projectId = req.params.projectId;
  try {
    let defaultActivities = await DefaultActivities.findOne({ projectId });
    return res.status(200).json(defaultActivities);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.route("/updateDefaultSubActivityName").post(async (req, res) => {
  const { projectId, activityIndex, subActivityIndex, title } = req.body;
  // console.log(req.body);
  try {
    var defaultActivities = await DefaultActivities.findOne({ projectId });
    defaultActivities = JSON.stringify(defaultActivities);
    defaultActivities = JSON.parse(defaultActivities);
    // console.log(defaultActivities);
    var newData = defaultActivities["data"];
    if (subActivityIndex === -1) {
      newData[activityIndex]["title"] = title;
    } else {
      newData[activityIndex]["content"][subActivityIndex]["subTitle"] = title;
    }

    const response = await DefaultActivities.findByIdAndUpdate(
      defaultActivities._id,
      {
        $set: { data: newData },
      }
    );
    return res.status(200).send("Subactivity name updated successfully");
  } catch (error) {
    // console.log(error);
    res.status(400).send(error.message);
  }
});

router.route("/getDeaultActivityNames/:projectId").get(async (req, res) => {
  const projectId = req.params.projectId;
  try {
    let defaultActivities = await DefaultActivities.findOne({ projectId });
    // console.log(defaultActivities);
    defaultActivities = JSON.stringify(defaultActivities);
    defaultActivities = JSON.parse(defaultActivities);
    var names = defaultActivities.data.map((item) => item.title);
    // console.log(names);
    return res.status(200).json(names);
  } catch (error) {
    // console.log(error);
    res.status(400).send({ error: error.message });
  }
});

router.route("/updateDefaultActivities/:id").put(async (req, res) => {
  const newActivity = req.body;
  try {
    // console.log(newActivity);
    const response = await DefaultActivities.findByIdAndUpdate(req.params.id, {
      $set: { data: newActivity },
    });
    return res.status(200).json({ msg: "Activities Updated", error: false });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.route("/getActivity").get(async (req, res) => {
  // const { id } = req.body;
  const { activity, subprojectId } = req.query;
  try {
    var activityFound = await Activities.findOne({ subprojectId });

    if (activityFound) {
      activityFound = JSON.stringify(activityFound);
      activityFound = JSON.parse(activityFound);
      let list;
      list = activityFound ? activityFound[activity] : [];
      // list = activityFound[activity] ? activityFound[activity] : [];
      if (list) {
        res.status(200).json(list);
      } else {
        res.status(200).json([]);
      }
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
});

router.route("/getAllActivity").post(async (req, res) => {
  // const { id } = req.body;
  const { subprojectId } = req.body;
  // console.log(subprojectId);
  try {
    let activityFound = await Activities.findOne({ subprojectId });
    return res.status(200).send(activityFound);
  } catch (error) {
    res.status(400).send({ error: error });
  }
});

const activityNotifications = async (subprojectId, msg) => {
  // console.log("hi buddy");
  var notif_roles = [
    "junior_engineer",
    "senior_engineer",
    "project_manager",
    "planning_manager",
    "chief_engineer",
    "technical_director",
  ];
  // console.log(subprojectId);
  await Projects.findOne(
    { apartments: { $in: [ObjectId(subprojectId)] } },
    async (err, resp) => {
      if (err) {
        throw err;
      }
      // console.log(resp._doc["totalUsers"]);
      var notif_array = [];
      for (var user of resp._doc["totalUsers"]) {
        // console.log(user);
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
            return element !== undefined;
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
router.route("/updateActivity").post(async (req, res) => {
  console.log("IN UpdateActvity");
  // console.log(req.body);
  const { subprojectId, activity, checkedArray } = req.body;
  // console.log(subprojectId, activity, floorNumber, checkedArray);

  // console.log("response", resp);
  // console.log(req.query);
  // Structure
  try {
    var activityFound = await Activities.findOne({ subprojectId });
    // console.log("activityFound" + activityFound);
    var act = req.body.activity;
    act = act.charAt(0).toUpperCase() + act.slice(1);
    if (activityFound) {
      // TODO: Update existing activity
      activityFound = JSON.stringify(activityFound);
      activityFound = JSON.parse(activityFound);
      // console.log("NOOOOB", checkedArray);
      var newActivity = {
        ...activityFound,
        [activity]: checkedArray,
      };

      if (Object.keys(newActivity).includes("")) delete newActivity[""];
      // console.log("NOOOOB", newActivity);
      const response = await Activities.findByIdAndUpdate(
        activityFound._id,
        newActivity
      );

      // activityNotifications(
      //   subprojectId,
      //   `${act} activity on floor ${floor} is Updated ! Check it out in the app`
      // );
      return res.send({ msg: "Updated" });
    } else {
      // console.log("ss");
      // TODO: create new activity
      // const data = checkedArray;
      const obj = {
        [activity]: checkedArray,
        subprojectId: subprojectId,
      };

      const activityObj = new Activities(obj);
      const res = await activityObj.save();

      // activityNotifications(
      //   subprojectId,
      //   `${act} activity on floor ${floor} is Added ! Check it out in the app`
      // );
      res.status(200).send({ msg: "created" });
    }
  } catch (err) {
    // console.log(err);
    res.status(400).send({ err: err });
  }
});

router.route("/getUpdateDetails").get(async (req, res) => {
  // const { id } = req.body;
  const { randomid } = req.query;
  var activityFound = await ActivityUpdates.findOne({ randomid });
  try {
    if (activityFound) {
      return res.status(200).send(activityFound);
    } else {
      return res.status(200).send(data = ['No Activities']);
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
});
router.route("/updateDetails").post(async (req, res) => {
  console.log("IN UpdateDetails");
  const { randomid, updatedPercentage, user, date, activityName, panaroma } =
    req.body;
  try {
    var activityFound = await ActivityUpdates.findOne({ randomid });

    if (activityFound) {
      // activityFound[data].length
      activityFound = JSON.stringify(activityFound);
      activityFound = JSON.parse(activityFound);
      let data = activityFound["data"];
      let newNum = activityFound["data"].length;

      data[newNum] = { panaroma, updatedPercentage, activityName, user, date };
      var newDetails = {
        randomid,
        data,
        activityName,
      };
      const response = await ActivityUpdates.findByIdAndUpdate(
        activityFound._id,
        newDetails
      );
      return res.send({ msg: "Updated" });
    } else {
      let data = { panaroma, updatedPercentage, activityName, user, date };
      const obj = {
        data: [data],
        randomid,
        activityName,
      };
      const activityObj = new ActivityUpdates(obj);
      const res = await activityObj.save();
      res.status(200).send({ msg: "created" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ err: err });
  }
});

router
  .route("/getPercentage/:projectId/:subprojectId")
  .get(async (req, res) => {
    const subprojectId = req.params.subprojectId;
    const projectId = req.params.projectId;
    try {
      var defaultActivities = await DefaultActivities.findOne({ projectId });
      defaultActivities = JSON.stringify(defaultActivities);
      defaultActivities = JSON.parse(defaultActivities);
      defaultActivities = defaultActivities["data"];
      // defaultActivities = defaultActivities[activeActivityIndex].data;

      var activities = await Activities.findOne({ subprojectId });
      activities = JSON.stringify(activities);
      activities = JSON.parse(activities);

      let accName = [];
      let percentage = [];

      defaultActivities.forEach((activity) => {
        if (activities) {
          let subactivityPer = [];
          let tempPer = 0.0;
          activity.content.forEach((subacc) => {
            // subactivityPer.push(
            //   getActivityWisePer(activeActivityIndex, activities, subacc.link)
            // );
            if (subacc.visibility) {
              tempPer += getActivityWisePer(activities, subacc.link).Percentage;
              subactivityPer.push(
                getActivityWisePer(activities, subacc.link).Activity
              );
            }
            // console.log(subacc.visibility);
          });
          accName.push(activity.title);
          if (!activity.visibility) {
            percentage.push(0.0);
          }
          if (activity.visibility) {
            percentage.push(tempPer / subactivityPer.length);
          }
        } else {
          percentage.push(0);
        }
      });

      console.log({ per: percentage, accName: accName });

      res.status(200).send({ per: percentage, accName: accName });
    } catch (err) {
      // console.log(err);
      res.status(400).send(err.message);
    }
  });

function getActivityWisePer(activities, activity) {
  let TaskPercentage = {};
  let defaultPer = {
    task: [0, 0, 0],
    subtask: [[0, 0]],
  };

  let Taskdata = [];
  let STaskdata = [];
  // console.log(activities);
  if (activities != undefined) {
    if (activities[activity] != undefined) {
      // console.log(activities[activeActivityIndex][subactivity]);

      const activityData = activities[activity];
      for (let i = 0; i < activityData.length; i++) {
        let Sdata = [];
        let sinTotalPercentage = 0;
        let sinTotal = 0;
        // console.log(activityData[i].subTask);
        if (activityData[i].subTask != undefined) {
          for (
            let subTaskdata = 0;
            subTaskdata < activityData[i].subTask.length;
            subTaskdata++
          ) {
            sinTotalPercentage =
              sinTotalPercentage +
              parseInt(activityData[i].subTask[subTaskdata].percentage);
            sinTotal = sinTotal + 1;
            Sdata.push(activityData[i].subTask[subTaskdata].percentage);
          }
          STaskdata.push(Sdata);
        } else {
          STaskdata.push([0]);
        }
        Taskdata.push(sinTotalPercentage / sinTotal);
      }
      if (STaskdata == []) {
        TaskPercentage = defaultPer;
      } else {
        TaskPercentage = {
          task: Taskdata,
          subtask: STaskdata,
        };
      }
    } else {
      TaskPercentage = defaultPer;
    }
  } else {
    TaskPercentage = defaultPer;
  }

  let totalPer = 0.0;

  TaskPercentage.task.forEach((per) => {
    if (per >= 0) {
      totalPer += per;
    }
  });
  return {
    Percentage: totalPer / TaskPercentage.task.length,
    Activity: activity,
  };
}

router
  .route("/getFloorsPercentage/:projectId/:subprojectId")
  .get(async (req, res) => {
    const subprojectId = req.params.subprojectId;
    const projectId = req.params.projectId;
    try {
      var subproject = await Apartment.findById(subprojectId);
      subproject = JSON.stringify(subproject);
      subproject = JSON.parse(subproject);
      var count = parseInt(subproject["flatNumber"]);
      var floor = parseInt(subproject["floorNumber"]);
      // console.log("dds", count, floor);

      var activities = await Activities.findOne({ subprojectId });
      activities = JSON.stringify(activities);
      activities = JSON.parse(activities);
      console.log("ACTIVITIES", activities);

      // console.log(activities);

      var defaultActivities = await DefaultActivities.findOne({ projectId });
      defaultActivities = JSON.stringify(defaultActivities);
      defaultActivities = JSON.parse(defaultActivities);
      defaultActivities = defaultActivities["data"];
      // console.log("Default activities", defaultActivities);
      let floorPercentage = [];

      // console.log(defaultActivities);
      for (let i = 0; i < floor; i++) {
        let tempPercentage = [];
        defaultActivities.forEach((activity) => {
          let tempPerc = floorPercentageUtil(activities, activity, count, i);

          if (tempPerc.length > 1) {
            for (let j = 0; j < tempPerc.length; j++) {
              tempPercentage.push(tempPerc[j]);
            }
          } else {
            tempPercentage.push(tempPerc);
          }
        });
        floorPercentage.push(tempPercentage);
      }

      // console.log("floor per", floorPercentage);
      res.status(200).send(floorPercentage);
    } catch (err) {
      // console.log(err);
      res.status(400).send(err.message);
    }
  });

const floorPercentageUtil = (activities, activity, count, index) => {
  if (checkEmpty(activity["content"])) {
    let item = activity.activity;
    // console.log("asda", item);
    return floorCalcPercentage(activities, item, count, index);
  } else if (
    activity["content"].length === 1 &&
    activity["content"][0].link === "null"
  ) {
    let item = activity.activity;
    if (!activity.visibility) {
      return 0.0;
    }
    // console.log(activity);
    return floorCalcPercentage(activities, item, count, index);
  } else {
    let tempFloorPerc = [];
    activity["content"].forEach((item) => {
      var total = 0.0;
      var link = item.link;
      if (item.visibility) {
        total = floorCalcPercentage(activities, link, count, index);
      }
      tempFloorPerc.push(total);
    });
    // console.log("cdds", tempFloorPerc);
    return tempFloorPerc;
  }
};
const floorCalcPercentage = (activities, item, count, index) => {
  let percentageObject = { activity: "null", percentage: 0.0 };
  if (activities && activities[item]) {
    var p = activities[item][index];
    var perc = 0.0;
    // console.log("floor details", p);
    if (p) {
      var len = p.filter((item) => item === "complete").length;
      perc += parseFloat(len / count) * 100;
    }
    percentageObject["activity"] = item;
    percentageObject["percentage"] = perc;

    return percentageObject;
  } else {
    return percentageObject;
  }
};

router
  .route("/getTaskPercentage/:projectId/:subprojectId/:subactivity/")
  .get(async (req, res) => {
    const subprojectId = req.params.subprojectId;
    const projectId = req.params.projectId;
    const subactivity = req.params.subactivity;
    try {
      var activities = await Activities.findOne({ subprojectId });
      activities = JSON.stringify(activities);
      activities = JSON.parse(activities);
      let TaskPercentage = {};

      let defaultPer = {
        task: [0],
        subtask: [[0]],
      };
      if (activities == null) {
        TaskPercentage = defaultPer;
      } else {
        let Taskdata = [];
        let STaskdata = [];
        if (activities != undefined) {
          if (activities[subactivity] != undefined) {
            const activityData = activities[subactivity];

            for (let i = 0; i < activityData.length; i++) {
              let Sdata = [];
              let sinTotalPercentage = 0;
              let sinTotal = 0;
              if (activityData[i].subTask != undefined) {
                for (
                  let subTaskdata = 0;
                  subTaskdata < activityData[i].subTask.length;
                  subTaskdata++
                ) {
                  sinTotalPercentage =
                    sinTotalPercentage +
                    parseInt(activityData[i].subTask[subTaskdata].percentage);
                  sinTotal = sinTotal + 1;
                  Sdata.push(activityData[i].subTask[subTaskdata].percentage);
                }
                STaskdata.push(Sdata);
              } else {
                STaskdata.push([0]);
              }
              Taskdata.push(sinTotalPercentage / sinTotal);
            }
            if (STaskdata == []) {
              TaskPercentage = defaultPer;
            } else {
              TaskPercentage = {
                task: Taskdata,
                subtask: STaskdata,
              };
            }
          } else {
            TaskPercentage = defaultPer;
          }
        } else {
          TaskPercentage = defaultPer;
        }
      }

      // let TaskPercentage = {
      //   task: Taskdata,
      //   subtask: STaskdata,
      // // };

      // console.log("floor per", TaskPercentage);
      res.status(200).send(TaskPercentage);
    } catch (err) {
      // console.log(err);
      res.status(400).send(err.message);
    }
  });

module.exports = router;
