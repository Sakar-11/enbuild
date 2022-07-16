const router = require("express").Router();
const Apartment = require("../models/apartment.model");
const Checklist = require("../models/checklist.model");
const DefaultChecklist = require("../models/defaultProjectChecklist.model");
const Projects = require("../models/project.model");
const ObjectId = require("mongodb").ObjectID;
const userLogin = require("../models/userLogin.model");
const utils = require("./notificationsUtil");
// const { Check } = require("@material-ui/icons");
// const config = require("config");
// const axios = require("axios");

// DEFAULT CHECKLIST ROUTES

router.route("/getDefaultChecklist/:projectId/:type").get(async (req, res) => {
  const projectId = req.params.projectId;
  const type = req.params.type;
  // console.log("Aala re baba");
  try {
    if (projectId) {
      const response = await DefaultChecklist.findOne({ projectId, type });
      return res.status(200).send(response);
    } else {
      throw Error("No CheckList Found for provided ID");
    }
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.route("/updateDefaultChecklist/:id").post(async (req, res) => {
  const id = req.params.id;
  try {
    const { data, projectId, type } = req.body;
    console.log(req.body);
    const defaultProject = await DefaultChecklist.findOne({ projectId, type });
    console.log(defaultProject);
    if (!defaultProject) {
      const checklist = new DefaultChecklist({ data, projectId, type });
      const response = await checklist.save();
      return res
        .status(200)
        .send({ result: "Checklist added successfully", response });
    } else {
      const response = await DefaultChecklist.findByIdAndUpdate(id, {
        $set: {
          data,
          projectId,
          type,
        },
      });
      return res.status(200).json({ msg: "Checklist updated", response });
    }
  } catch (error) {
    return res.status(400).send(error);
  }
});

// NEW CHECKLIST ROUTES

// now only quality person is added : To add : safety person depending upon type of checklist
const checkListNotifications = async (subprojectId, msg, type = null) => {
  console.log("hi buddy");
  var notif_roles = [
    "junior_engineer",
    "senior_engineer",
    "project_manager",
    "chief_engineer",
    "technical_director",
  ];
  if (type !== null) {
    if (type === "quality") notif_roles.push("quality_engineer");
    else if (type === "safety") notif_roles.push("safety_engineer");
  }
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
            return element !== undefined;
          });
          await Apartment.findById(subprojectId, (err, resp_) => {
            // console.log(resp_._doc["subProjectName"]);
            // axios
            //   .post(`${config.get("backendURL")}/notifications/buzz`, {
            //     user_ids: users,
            //     title: resp_._doc["subProjectName"],
            //     body: "New CheckList Added !",
            //   })
            //   .then(_resp_ => {
            //     console.log(_resp_.data);
            //   });
            utils.notify(users, resp_._doc["subProjectName"], msg);
          });
        }
      );
    }
  );
};
router.route("/addChecklist").post(async (req, res) => {
  try {
    const item = req.body;
    item["approved"] = false;
    item["checked"] = false;
    let newChecklist = new Checklist(item);
    const response = await newChecklist.save();
    checkListNotifications(
      req.body.subprojectId,
      `New ${newChecklist["activityName"]} checklist Added ! Check it out !`,
      req.body.type
    );
    return res.status(200).json({ result: "checklist added successfully" });
  } catch (error) {
    return res.status(400).send(error);
  }
});
router.route("/:id").get((req, res) => {
  Checklist.findById(req.params.id)
    .then((checklist) => res.json(checklist))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/getChecklist/:checklistID").get(async (req, res) => {
  const id = req.params.checklistID;
  try {
    const response = await Checklist.findById(id);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

router
  .route("/getChecklist/:activityName/:subprojectId")
  .get(async (req, res) => {
    const id = req.params.subprojectId;
    const activityName = req.params.activityName;
    try {
      let checklist = await Checklist.find({ subprojectId: id });
      if (checklist) {
        checklist = JSON.parse(JSON.stringify(checklist));
        let requiredChecklist = checklist.filter((eachChecklist) =>
          eachChecklist.hasOwnProperty(activityName)
        );
        return res.status(200).json(requiredChecklist);
      } else {
        throw Error("Invalid Data");
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send(error);
    }
  });

router.route("/updateChecklist/:checklistID").put(async (req, res) => {
  const id = req.params.checklistID;
  const newChecklist = req.body;
  try {
    const response = await Checklist.findByIdAndUpdate(id, {
      $set: newChecklist,
    });
    return res.status(200).json({ msg: "Checklist updated", response });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

// OLD CHECKLIST ROUTES
router.post("/updateChecklistTasks", async (req, res) => {
  const { id, list } = req.body;
  try {
    var apartment = await Apartment.findById(id);
    if (apartment) {
      apartment = JSON.stringify(apartment);
      apartment = JSON.parse(apartment);
      //   console.log(apartment);
      const newApartment = {
        ...apartment,
        checklist: list,
      };
      console.log(newApartment);
      const response = await Apartment.findByIdAndUpdate(id, newApartment);
      return res.status(200).send("Checklist Updated");
    } else {
      throw Error("Invalid id");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/getChecklistTasks/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    var apartment = await Apartment.findById(id);
    // console.log(apartment);
    if (apartment) {
      apartment = JSON.stringify(apartment);
      apartment = JSON.parse(apartment);
      console.log(apartment);
      const list = apartment["checklist"] ? apartment["checklist"] : [];
      console.log(list);
      return res.status(200).send(list);
    } else {
      throw Error("Invalid id");
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});
router.post("/getCheckListBySubProjectId", async (req, res) => {
  const { subprojectId, subActivity, type } = req.body;
  // console.log("ss" + subActivity);
  try {
    // console.log(apartment);
    if (subprojectId) {
      const data = await Checklist.find({
        subprojectId: subprojectId,
        activityName: subActivity,
        type: type,
      });

      return res.status(200).send(data);
    } else {
      throw Error("No CheckList Found for provided ID");
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.post("/approveCheckList", async (req, res) => {
  const { id, subprojectId, forApproval, approveImage } = req.body;
  console.log(id);
  try {
    var response = await Checklist.findById(id);
    response = JSON.stringify(response);
    response = JSON.parse(response);
    console.log(response);
    await Checklist.updateOne({ _id: id }, { approved: true, approveImage });
    checkListNotifications(
      subprojectId,
      `${response.checklistTitle} Checklist Approved ! View in App !`
    );
    res.status(200).send("Success");
  } catch (error) {
    res.status(400).json("Error: " + error.message);
  }
});

router.post("/checkChecklist", async (req, res) => {
  const { id, subprojectId } = req.body;
  console.log(req.body);
  console.log(id);
  try {
    var response = await Checklist.findById(id);
    response = JSON.stringify(response);
    response = JSON.parse(response);
    console.log(response);
    await Checklist.updateOne({ _id: id }, { checked: true });
    checkListNotifications(
      subprojectId,
      `${response.checklistTitle} checklist sent for Approval ! View in App !`
    );
    res.status(200).send("Success");
  } catch (error) {
    console.log(error);
    res.status(400).json("Error: " + error.message);
  }
});
module.exports = router;
