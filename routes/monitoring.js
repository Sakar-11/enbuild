const Monitoring = require("../models/monitoring.model");
const Barchart = require("../models/barchart.model");
const router = require("express").Router();
const Apartment = require("../models/apartment.model");
const Projects = require("../models/project.model");
const ObjectId = require("mongodb").ObjectID;
const userLogin = require("../models/userLogin.model");
const utils = require("./notificationsUtil");
const DefaultActivities = require("../models/defaultProjectActivities.model");
const Library = require("../models/library.model");
const Labour = require("../models/labour.model");
const Equipment = require("../models/equipment.model");
const Dpr = require("../models/dpr.model");
const _ = require("lodash");
const Activities = require("../models/activities.model");

// there are differnet functions for each of the notifications becasue the notifications may change later depending upon the type !
const monitoringNotifications = async (subprojectId) => {
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
          users = users.filter((element) => {
            return element != undefined;
          });
          await Apartment.findById(subprojectId, (err, resp_) => {
            // console.log(resp_._doc["subProjectName"]);
            utils.notify(
              users,
              resp_._doc["subProjectName"],
              "An Activity is Updated ! Check It Out in Monitoring Options !"
            );
          });
        }
      );
    }
  );
};

router
  .route("/getActivities/:subprojectId/:projectId")
  .get(async (req, res) => {
    const subprojectId = req.params.subprojectId;
    const projectId = req.params.projectId;
    try {
      var response = await Monitoring.findOne({ subprojectId });
      response = JSON.stringify(response);
      response = JSON.parse(response);
      response = response ? response.data : [];

      var barresponse = await Barchart.findOne({ subprojectId });
      // const bardata = barresponse[0]._doc.data;
      barresponse = JSON.stringify(barresponse);
      barresponse = JSON.parse(barresponse).data;

      // console.log(barresponse);

      var defaultActivities = await DefaultActivities.findOne({ projectId });
      defaultActivities = JSON.stringify(defaultActivities);
      defaultActivities = JSON.parse(defaultActivities).data;

      var library = await Library.find({ projectId: projectId });
      library = JSON.stringify(library);
      library = JSON.parse(library);

      var labour = await Labour.find({ projectId: projectId });
      labour = JSON.stringify(labour);
      labour = JSON.parse(labour);

      var equipment = await Equipment.find({ projectId: projectId });
      equipment = JSON.stringify(equipment);
      equipment = JSON.parse(equipment);

      var dpr = await Dpr.find({ projectId: projectId });
      dpr = JSON.stringify(dpr);
      dpr = JSON.parse(dpr);

      const labourMappedActivity = _(labour)
        .groupBy("activity")
        .map((labour, id) => ({
          activity: id,
          total: _.sumBy(labour, "labourAmount"),
        }))
        .value();

      const materialMappedActivity = _(library)
        .groupBy("activity")
        .map((material, id) => ({
          activity: id,
          total: _.sumBy(material, "materialAmount"),
        }))
        .value();

      const equipmentMappedActivity = _(equipment)
        .groupBy("activity")
        .map((equipment, id) => ({
          activity: id,
          total: _.sumBy(equipment, "equipmentAmount"),
        }))
        .value();

      const combinedArray = [
        ...labourMappedActivity,
        ...materialMappedActivity,
        ...equipmentMappedActivity,
      ];
      const expectedCost = _(combinedArray)
        .groupBy("activity")
        .map((combined, id) => ({
          activity: id,
          total: _.sumBy(combined, "total"),
        }))
        .value();

      const dprMappedActivity = [];
      dpr.forEach((data) => {
        let labourTotalCost = 0;
        let materialTotalCost = 0;
        let equipmentTotalCost = 0;
        console.log(data);
        data.labor.forEach((eachLabour) => {
          labour.forEach((lbr) => {
            if (lbr.labourName == eachLabour.labor)
              labourTotalCost += lbr.labourRate * eachLabour.number;
          });
        });

        data.material.forEach((eachMaterial) => {
          library.forEach((data) => {
            if (data.materialName == eachMaterial.material)
              materialTotalCost += data.materialRate * eachMaterial.number;
          });
        });

        data.equipment.forEach((eachEquipment) => {
          equipment.forEach((data) => {
            if (data.equipmentName == eachEquipment.equipment)
              equipmentTotalCost += data.equipmentRate * eachEquipment.number;
          });
        });
        dprMappedActivity.push({
          activity: data.activity,
          total: labourTotalCost + materialTotalCost + equipmentTotalCost,
        });
      });

      const actualCost = _(dprMappedActivity)
        .groupBy("activity")
        .map((combined, id) => ({
          activity: id,
          total: _.sumBy(combined, "total"),
        }))
        .value();
      // console.log(response, activity, barresponse);

      var activities = await Activities.findOne({ subprojectId });
      activities = JSON.stringify(activities);
      activities = JSON.parse(activities);

      let accName = [];
      let percentage = [];

      defaultActivities.forEach((activity) => {
        if (activities) {
          accName.push(activity.title);
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
          if (activity.visibility) {
            percentage.push(tempPer / subactivityPer.length);
          }
        } else {
          percentage.push(0);
        }
      });

      console.log({ per: percentage, accName: accName });

      var newData = defaultActivities.map((item) => {
        var tempData = [];
        var remarkMoni = response.find(
          (newItem) => item.title === newItem.title
        );
        remarkMoni = remarkMoni ? remarkMoni.remark : remarkMoni;
        var barItem = barresponse.find((newItem) => newItem[0] === item.title);
        library.map((ele) => {
          if (ele.activity === item.title) {
            tempData.push(ele);
          }
        });
        // console.log(barItem);
        // console.log(remarkMoni);
        var estimatedcompletion = "";
        var estimatedcompletion_by_cost = 0;
        if (!barItem) {
          estimatedcompletion = "Not available";
        } else if (barItem[1] == null || barItem[2] == null) {
          estimatedcompletion = "Not available";
        } else if (Date.now() <= Date.parse(barItem[1])) {
          estimatedcompletion = "Not started yet";
        } else if (Date.now() >= Date.parse(barItem[2])) {
          estimatedcompletion = 100 + "%";
        } else {
          estimatedcompletion =
            Math.ceil(
              ((Date.now() - Date.parse(barItem[1])) /
                (1000 * 3600 * 24) /
                barItem.pop()) *
                100
            ) + "%";
        }

        const expectedExist = expectedCost.find((data) => {
          if (data.activity == item.title) return data.total;
        });
        if (expectedExist != undefined)
          estimatedcompletion_by_cost = expectedExist.total;
        else estimatedcompletion_by_cost = "Not Available";

        const actualExist = actualCost.find((data) => {
          if (data.activity == item.title) return data.total;
        });
        if (actualExist != undefined)
          actualcompletion_by_cost = actualExist.total;
        else actualcompletion_by_cost = "Not Available";

        var actualcompletion = 0.0;
        var exist = accName.findIndex((data) => {
          return data === item.title;
        });
        if (exist != -1) actualcompletion = percentage[exist] + "%";
        // if(!barItem) {
        //   actualcompletion_by_cost = "Not Available";
        // } else {
        //   if (barItem[4] == "0" || barItem[4] == null || barItem[3] == null) {
        //     actualcompletion_by_cost = "Not Available";
        //   } else {
        //     actualcompletion_by_cost =
        //       parseFloat(barItem[3]) - parseFloat(barItem[4]);
        //     if (actualcompletion_by_cost < 0) {
        //       actualcompletion_by_cost = actualcompletion_by_cost * -1;
        //     }
        //   }
        // }
        // tempData.map((i) => {
        //   estimatedcompletion_by_cost += i.materialAmount;
        // });
        // if (estimatedcompletion_by_cost=="NaN%")
        // {
        //   estimatedcompletion_by_cost="Not Available";
        // }
        // console.log(estimatedcompletion_by_cost);
        return {
          visibility: item.visibility,
          title: item.title,
          estimatedcompletion,
          actualcompletion,
          estimatedcompletion_by_cost,
          actualcompletion_by_cost,
          remark: remarkMoni,
        };
      });

      // console.log(newData);

      // let dataArray = [];

      return res.status(200).json(newData);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  });

router.route("/getDate").get(async (req, res) => {
  try {
    const response = await Barchart.find();
    const data = response[0]._doc.data;
    return res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.route("/updateActivities").post(async (req, res) => {
  const { subprojectId, data } = req.body;
  try {
    // have't tested it
    monitoringNotifications(subprojectId);

    const doc = await Monitoring.findOne({ subprojectId });
    // console.log(doc);
    if (doc) {
      await Monitoring.updateOne(
        { subprojectId: subprojectId },
        { $set: { data: data } }
      );
    } else {
      const newData = new Monitoring({
        subprojectId,
        data,
      });
      await newData.save();
      // console.log(newData);
    }

    return res.status(200).json({ msg: "Activities updated", success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
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

module.exports = router;
