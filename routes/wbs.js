const router = require("express").Router();
const Activities = require("../models/activities.model");

const ActivityUpdates = require("../models/activityUpdates.model");
const DefaultActivities = require("../models/defaultProjectActivities.model");

router
  .route("/getAllMis/:projectId/:subprojectId/:activityName/:sDate/:eDate")
  .get(async (req, res) => {
    const subprojectId = req.params.subprojectId;
    const projectId = req.params.projectId;
    const activityName = req.params.activityName;
    const dateFrom = req.params.sDate;
    const dateTo = req.params.eDate;
    try {
      let activities = await Activities.findOne({ subprojectId });
      activities = JSON.stringify(activities);
      activities = JSON.parse(activities);
      activities = activities["0"];

      let defaultActivities = await DefaultActivities.findOne({ projectId });
      defaultActivities = JSON.stringify(defaultActivities);
      defaultActivities = JSON.parse(defaultActivities);
      defaultActivities = defaultActivities.data[0].data;

      let allSubActivity = [];
      defaultActivities.forEach((subacc) => {
        if (subacc.activity == activityName) {
          subacc.content.forEach((element) => {
            allSubActivity.push(element.link);
          });
        }
      });
      let taskperArr = {};
      for (const singleSubAcc of allSubActivity) {
        if (activities[singleSubAcc]) {
          let length = 0;
          let per = 0;
          let taskper = [];
          for (const subtask of activities[singleSubAcc]) {
            taskper = await getTaskPer(subtask, dateFrom, dateTo).then(
              function (result) {
                length = length + 1;
                per = per + result;
                return per / length;
              }
            );
            if (taskper) taskperArr[singleSubAcc] = taskper;
          }
        }
      }
      let tot = 0;
      for (var key in taskperArr) {
        if (taskperArr.hasOwnProperty(key)) {
          priv = taskperArr[key];
          tot = taskperArr[key] + tot;
        }
      }
      console.log(allSubActivity.length);
      let ff = { total: tot / allSubActivity.length, taskperArr: taskperArr };
      return res.status(200).json(ff);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });

async function getTaskPer(subtask, dateFrom, dateTo) {
  let taskper = 0;
  let len = 0;

  if (subtask.subTask) {
    let temp = 0.0;
    for (let index = 0; index < subtask.subTask.length; index++) {
      let records = await ActivityUpdates.find({
        randomid: subtask.subTask[index].randomid,
      })
        .sort({
          updatedAt: "desc",
        })
        .exec();
      records = JSON.stringify(records);
      records = JSON.parse(records);

      records.forEach((record) => {
        record.data.forEach((details) => {
          let sdate = dateFrom.replace(/[^a-zA-Z0-9]/g, "/");
          let edate = dateTo.replace(/[^a-zA-Z0-9]/g, "/");
          let check = gfg_Run(sdate, edate, details.date);
          if (check) {
            temp = temp + details.updatedPercentage;
          }
        });
        len = len + 1;
      });
    }
    taskper = taskper + temp;
  }
  // console.log(taskper, len);
  return taskper / len;
}

function gfg_Run(dateFrom, dateTo, Date_to_check) {
  D_1 = dateFrom.split("/");
  D_2 = dateTo.split("/");
  D_3 = Date_to_check.split("/");

  var d1 = new Date(D_1[2], parseInt(D_1[1]) - 1, D_1[0]);
  var d2 = new Date(D_2[2], parseInt(D_2[1]) - 1, D_2[0]);
  var d3 = new Date(D_3[2], parseInt(D_3[1]) - 1, D_3[0]);

  if (d3 > d1 && d3 < d2) {
    // console.log("Date is in between the " + "Date 1 and Date 2");
    return true;
  } else {
    // console.log("Date is not in between " + "the Date 1 and Date 2");
    return false;
  }
}
module.exports = router;
