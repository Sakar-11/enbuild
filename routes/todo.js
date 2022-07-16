const Todo = require("../models/todo.model");
const router = require("express").Router();
const Apartment = require("../models/apartment.model");
const userLogin = require("../models/userLogin.model");
const utils = require("./notificationsUtil");
// const Projects = require("../models/project.model");
// const ObjectId = require("mongodb").ObjectID;
const todoNotifications = async (subprojectId, userId, msg) => {
  if (userId == undefined) return;
  console.log("hi buddy");
  console.log(subprojectId, userId);
  await userLogin.find(
    {
      _id: Object(userId),
    },
    async function (err, docs) {
      var users = [];
      console.log("docs", docs);

      for (var doc of docs) {
        users = users.concat(doc._doc["notification_id"]);
      }
      users = users.filter(element => {
        return element !== undefined;
      });
      if (users.length === 0) return;
      await Apartment.findById(subprojectId, (err, resp_) => {
        console.log(resp_);
        utils.notify(users, resp_._doc["subProjectName"], msg);
      });
    }
  );
};

router.route("/addTodo").post(async (req, res) => {
  console.log(req.body);
  try {
    todoNotifications(
      req.body.subprojectId,
      req.body.userId,
      `New Task assigned to you !\nTask: ${req.body.taskTitle}\nDeadline:${req.body.deadline}`
    );
    const todo = new Todo(req.body);
    await todo.save();
    return res.status(200).json(todo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.route("/getTodo/:id").get(async (req, res) => {
  try {
    console.log(req.params.id);
    const response = await Todo.find({ subprojectId: req.params.id });
    return res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.route("/deleteTodo/:id").delete(async (req, res) => {
  try {
    console.log(req.params.id);
    await Todo.findById(req.params.id, (err, res) => {
      todoNotifications(
        res._doc["subprojectId"],
        res._doc["userId"],
        `A Task Assigned to you was removed !\nTask: ${res._doc["taskTitle"]}`
      );
    });
    await Todo.findByIdAndDelete(req.params.id);
    return res.status(200).json({ msg: "Deleted", success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.route("/updateTodo/:id").put(async (req, res) => {
  try {
    await Todo.findByIdAndUpdate({ _id: req.params.id }, { $set: req.body });
    return res.status(200).json({ msg: "Todo Updated", success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
