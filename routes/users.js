const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const config = require("config");
const User = require("../models/user.model");
const userLogin = require("../models/userLogin.model");
const Project = require("../models/project.model");
const verifyRole = require("../middleware/verifyRole");

router.get("/test", (req, res) => {
  res.send("Route Initiated");
});

router.get("/removeAllUsers", async (req, res) => {
  try {
    await User.remove({});
    await userLogin.remove({});
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json("Error: " + error.message);
  }
});

router.get("/getUsers", async (req, res) => {
  try {
    var users = await userLogin.find();
    users = JSON.stringify(users);
    users = JSON.parse(users);
    users = users.filter((item) => !item.isAdmin);
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json("Error: " + error.message);
  }
});

router.get("/getRoleByProjectId", async (req, res) => {
  const { projectId, username } = req.query;
  // console.log(projectId, username);
  //   var role;
  const userDoc = await userLogin.findOne({ username });
  for (const item of userDoc._doc.projects) {
    if (projectId.localeCompare(item.project) === 0) {
      console.log(item.role);
      return res.status(200).send(item.role);
    }
  }
});

router.post("/verify", verifyRole, async (req, res) => {
  const token = req.body.headers["construction-auth-token"];
  console.log(token);
  if (!token) {
    console.log("token is invalid");
    return res.status(400).json({ res: false });
  }
  try {
    jwt.verify(token, config.get("jwtSecret"));
    // console.log("valid");
    return res.status(200).json({ res: true });
  } catch (e) {
    console.log("err");
    return res.status(400).json({ res: false });
  }
});
router.post("/removeNotificationId", async (req, res) => {
  // console.log(
  //   "----------------GOT INTO HERE-----------------------------------------------------------------------"
  // );
  const { username, notification_id } = req.body;
  // console.log(username, notification_id);
  if (!username || !notification_id) {
    return res.status(400).json("parameters missing");
  }
  try {
    await userLogin.findOne({ username: username }, async (err, resp) => {
      if (
        resp._doc.notification_id &&
        resp._doc.notification_id.includes(notification_id)
      ) {
        // console.log("ITS HERE");
        var idx = resp._doc.notification_id.indexOf(notification_id);
        resp._doc.notification_id.splice(idx, 1);
        // console.log(resp);
        resp.markModified("notification_id");
        await resp.save(function (err) {
          if (err) {
            return res.status(400).json(err);
          } else {
            // console.log("SUCCESS");
          }
        });
      }
      return res.status(200);
    });
  } catch (err) {
    console.log(err);
    return res.status(200).json(err);
  }
});
router.post("/addToNotificationsList", async (req, res) => {
  const { notification_id, username } = req.body;
  try {
    await userLogin.findOneAndUpdate(
      { username: username },
      { $push: { notification_id: notification_id } }
    );
    return res.status(200).json("Error: Notification Id Added");
  } catch (err) {
    return res.status(400).json("Error: Something went wrong", err);
  }
});
router.put("/approveAdmin", async (req, res) => {
  const { id, approved } = req.body;
  try {
    await userLogin.findOneAndUpdate(
      { _id: id },
      { $set: { requestAdmin: false, isAdmin: approved } }
    );
    return res.status(200).json("User information updated");
  } catch (err) {
    return res.status(400).json("Error: Something went wrong", err);
  }
});
router.get("/getOrganizations", async (req, res) => {
  try {
    var users = await userLogin.find();
    let organizations = [];
    users = JSON.stringify(users);
    users = JSON.parse(users);
    users = users.filter((item) => item.requestAdmin);
    users.map((user) => {
      organizations.push(user.organization);
    });
    let temporganizations = [...new Set(organizations)];
    organizations = [];
    temporganizations.map((organization) => {
      organizations.push({ title: organization });
    });
    res.status(200).send(organizations);
  } catch (error) {
    res.status(400).json("Error: " + error.message);
  }
});
module.exports = router;
