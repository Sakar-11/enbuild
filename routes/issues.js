const router = require("express").Router();
// const jwt = require("jsonwebtoken");
// const auth = require("../middleware/auth");
const config = require("config");
const Issue = require("../models/issues.model");
const axios = require("axios");
const Apartment = require("../models/apartment.model");
const Projects = require("../models/project.model");
const ObjectId = require("mongodb").ObjectID;
const userLogin = require("../models/userLogin.model");
const utils = require("./notificationsUtil");
//Get existing Project
const issuesNotifications = async (subprojectId, msg, notif_roles) => {
  console.log("hi buddy");
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

router.get("/getAllIssues", async (req, res) => {
  try {
    const response = await Issue.find();
    // console.log(response);
    res.json(response);
  } catch (error) {
    res.status(400).json("Error: " + error.message);
  }
});

router.get("/getIssueByProjectId/:subProjectId/:type", async (req, res) => {
  const { subProjectId, type } = req.params;
  // console.log(subProjectId, type);
  try {
    const response = await Issue.find({ subProjectId, type });
    res.json(response);
  } catch (error) {
    res.status(400).json("Error: " + error.message);
  }
});

router.get("/removeAllIssues", async (req, res) => {
  try {
    const response = await Issue.remove({});
    res.json(response);
  } catch (error) {
    res.status(400).json("Error: " + error.message);
  }
});

// Add new issue
router.post("/createIssue", async (req, res) => {
  const {
    section,
    priority,
    location,
    desc: description,
    date,
    id,
    images,
    subProjectId,
    type,
  } = req.body;
  // console.log(req.body);
  let newIssue = new Issue({
    issueId: id,
    section,
    priority,
    location,
    description,
    date,
    status: "pending",
    images,
    subProjectId,
    type,
  });
  issuesNotifications(
    subProjectId,
    `New ${type} Issue for priority . ${priority} at location ${location} Created ! Check it Out !`,
    [
      "junior_engineer",
      "senior_engineer",
      "project_manager",
      "quality_engineer",
      "safety_engineer",
      "chief_engineer",
      "technical_director",
    ]
  );
  try {
    const savedIsuue = await newIssue.save();

    // console.log("length", response.data.length);
    return res.status(200).json("Data saved");
  } catch (err) {
    return res.status(400).json({ err: "Error creating Issue" });
  }
});

router.post("/removeIssue", async (req, res) => {
  const { issueId, subprojectId } = req.body;
  try {
    await Issue.deleteOne({ issueId: issueId });
    try {
      const response = await axios.get(
        `${config.get("backendURL")}/issues/getAllIssues`
      );
      issuesNotifications(
        subprojectId,
        "An Issue is Approved ! Check out in the app !",
        [
          "junior_engineer",
          "senior_engineer",
          "project_manager",
          "quality_engineer",
          "safety_engineer",
          "chief_engineer",
          "technical_director",
        ]
      );
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(400).json({ msg: "Some Error Occured", err: error });
    }
  } catch (error) {
    res.status(400).json("Error: " + error.message);
  }
});

// ask client to whom to send notifications

router.post("/askApproval", async (req, res) => {
  const { issueId, subprojectId, approveImage } = req.body;
  // console.log(issueId, subprojectId, approveImage);
  try {
    await Issue.findOneAndUpdate(
      { issueId: issueId },
      { status: "Approved", approveImage }
    );
    try {
      const response = await axios.get(
        `${config.get("backendURL")}/issues/getAllIssues`
      );
      issuesNotifications(
        subprojectId,
        "Approval Requested for an Issue ! Check out in the app",
        ["quality_engineer", "safety_engineer"]
        //have to changw this as per type of issue
      );
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(400).json({ msg: "Some Error Occured", err: error });
    }
  } catch (err) {
    return res.status(400).json("Error: Something went wrong");
  }
});

module.exports = router;
