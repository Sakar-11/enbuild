const router = require("express").Router();
const Activities = require("../models/activities.model");

const ActivityUpdates = require("../models/activityUpdates.model");
// const DefaultActivities = require("../models/defaultProjectActivities.model");
const DefaultChecklist = require("../models/defaultProjectChecklist.model");
const _ = require("lodash");
const Project = require("../models/project.model");
const Issue = require("../models/issues.model");

router.route("/getAllUpdatesDetails/:subprojectId").get(async (req, res) => {
  const subprojectId = req.params.subprojectId;

  try {
    let activities = await Activities.findOne({ subprojectId });

    activities = JSON.stringify(activities);
    activities = JSON.parse(activities);
    // activities = activities["0"];

    let taskData = [];
    Object.keys(activities).forEach(function (key) {
      if (key != "_id" && key != "subprojectId" && key != "__v") {
        taskData.push(activities[key]);
      }
    });

    let finalSubtask = [];
    taskData.forEach((subtaskData) => {
      subtaskData.forEach((element, i) => {
        finalSubtask.push(element.subTask);
      });
    });

    let ids = getIds(finalSubtask);

    console.log("ids " + ids);
    const records = await ActivityUpdates.find()
      .where("randomid")
      .in(ids)
      .sort({
        updatedAt: "desc",
      })
      .exec();

    return res.status(200).json(records);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router
  .route("/getAllStatisticalData/:projectId/:subProjectId")
  .get(async (req, res) => {
    const projectId = req.params.projectId;
    const subProjectId = req.params.subProjectId;

    try {
      let response = await DefaultChecklist.find({ projectId });
      const checklistData = { type: "checklist", safety: 0, quality: 0 };
      response.forEach((data) => {
        tempData = JSON.stringify(data);
        tempData = JSON.parse(tempData);
        if (tempData.type === "safety") {
          checklistData.safety += 1;
        } else if (tempData.type === "quality") {
          checklistData.quality += 1;
        }
      });

      const issueData = { type: "issue", safety: 0, quality: 0 };
      response = await Issue.find({ subProjectId });
      response.forEach((data) => {
        tempData = JSON.stringify(data);
        tempData = JSON.parse(tempData);
        if (tempData.type === "safety") {
          issueData.safety += 1;
        } else if (tempData.type === "quality") {
          issueData.quality += 1;
        }
      });

      const userData = { type: "users", total: 0 };
      response = await Project.findOne({ _id: projectId });
      response = JSON.stringify(response);
      response = JSON.parse(response);
      let total = response.totalUsers.length;
      userData.total += total;

      const totalData = [
        { ...checklistData },
        { ...issueData },
        { ...userData },
      ];
      return res.status(200).json(totalData);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });

function getIds(finalSubtask) {
  let ids = [];
  finalSubtask.forEach((elements) => {
    // console.log("elements" + JSON.stringify(elements));
    elements.forEach((element) => {
      ids.push(element.randomid);
    });
  });
  return ids;
}
module.exports = router;
