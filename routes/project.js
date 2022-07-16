const router = require("express").Router();
// const jwt = require("jsonwebtoken");
// const auth = require("../middleware/auth");
const config = require("config");
const Project = require("../models/project.model");
const Apartment = require("../models/apartment.model");
const DefaultActivities = require("../models/defaultProjectActivities.model");
const iterList = require("../config/activityData");
const UserLogins = require("../models/userLogin.model");
const store = require("../models/store.model");
const axios = require("axios");
const ObjectId = require("mongodb").ObjectID;
const mongoose = require("mongoose");
// const { ExceptionMap } = require("antd/lib/result");
const userLogin = require("../models/userLogin.model");
//Get existing Project
router.get("/deleteProjectById/:projectId/:username", async (req, res) => {
  const projectId = ObjectId(req.params.projectId);
  const username = req.params.username;
  // console.log(projectId.toString());
  let models = mongoose.connections[0].models;
  let projectIdModels = ["store", "materials"];
  let excludedModels = [
    "defaultProjectAcitvity",
    "defaultProjectChecklist",
    "projects",
    "userLogin",
    "apartments",
  ];

  let users = [];
  let apartments = [];
  let apartmentsIds = [];

  try {
    await Project.findOneAndDelete({ _id: projectId }, (err, resp) => {
      try {
        resp._doc.apartments.forEach((entry) => {
          apartments.push(ObjectId(entry));
          apartmentsIds.push(entry.toString());
        });
        resp._doc.totalUsers.forEach((entry) => {
          users.push(ObjectId(entry["user"]));
        });
        // console.log(apartments, users, apartmentsIds);
      } catch (err) {
        console.log(err);
        return res.status(400);
      }
    });
    await Apartment.deleteMany({ _id: { $in: apartments } }, (err, resp) => {
      console.log(resp);
    });
    Object.keys(models).forEach(async (model) => {
      if (excludedModels.includes(model)) return;
      if (projectIdModels.includes(model)) {
        await models[model].deleteMany(
          { projectId: projectId.toString() },
          (err, resp) => {
            console.log(resp);
          }
        );
      } else {
        await models[model].deleteMany(
          { subprojectId: { $in: apartmentsIds } },
          (err, resp) => {
            console.log(resp);
          }
        );
      }
    });
    for (let user of users) {
      console.log(user);
      await userLogin.findOne({ _id: user }, async (err, resp) => {
        console.log(resp);
        let projectIds = [];
        if (!resp._doc.projects) return;
        resp._doc.projects.forEach((project) => {
          projectIds.push(project.project.toString());
        });
        console.log(
          projectIds,
          typeof projectId.toString(),
          typeof projectIds[0],
          projectIds.includes(projectId)
        );
        if (projectIds.includes(projectId.toString())) {
          console.log("ITS HERE");
          var idx = resp._doc.projects.indexOf(projectId);
          resp._doc.projects.splice(idx, 1);
          resp.markModified("projects");
          await resp.save(function (err) {
            if (err) {
              return res.status(400).json(err);
            } else {
              console.log("SUCCESS");
            }
          });
        }
      });
    }
    res.status(200).json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.status(400).json("Error: " + err.message);
  }
});
router.get("/getProjectInfo/:id", async (req, res) => {
  try {
    const response = await Project.findOne({ _id: req.params.id });
    res.json(response);
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});
router.get("/getAllProjects", async (req, res) => {
  try {
    const response = await Project.find();
    res.json(response);
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

router.get("/removeAllProjects", async (req, res) => {
  try {
    await Project.remove({});
    await Apartment.remove({});
    await UserLogins.remove({});
    res.status(200).json({ msg: "Removed all projects" });
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// Add new project
router.post("/addProject", async (req, res) => {
  const subProjectIds = [];
  const {
    projectName,
    flatNumber,
    floorNumber,
    projectDescription,
    userNumber,
    totalUsers,
    subProjectName,
    numberOfProjects,
    projectType,
    // materials,
    organization,
  } = req.body;
  // console.log("printing in console deep", materials);
  try {
    const project = await Project.findOne({ projectName });
    if (!project) {
      let activities = {
        data: iterList,
      };
      // console.log(subProjectName);
      for (var i = 0; i < subProjectName.length; i++) {
        try {
          const newApartment = new Apartment({
            subProjectName: subProjectName[i],
            flatNumber: flatNumber[i],
            floorNumber: floorNumber[i],
          });
          const value = await newApartment.save();
          subProjectIds.push(value._id);
        } catch (err) {
          console.log(err);
          return res
            .status(400)
            .json({ err: "Error occured creating project !" });
        }
      }
      // console.log(subProjectIds);
      try {
        const newProject = new Project({
          projectName,
          projectType,
          organization,
          projectDescription,
          numberOfProjects,
          apartments: subProjectIds,
          userNumber,
          totalUsers,
        });
        const value = await newProject.save();
        try {
          activities["projectId"] = value._id.toString();
          const newActivities = new DefaultActivities(activities);
          await newActivities.save();
          // materials.forEach(material => {
          //   material.materialQuantity = 0;
          //   material.updateBalance = new Date();
          //   material.projectId = value._id.toString();
          // });
          // const response = await store.collection.insertMany(materials);
          // console.log("following materials inserted ", response);
        } catch (error) {
          return res.status(400).json({ error: "Error adding materials" });
        }
        await Promise.all(
          totalUsers.map(async (item, index) => {
            addProjectinUserSchema(item.user, item.role, value._id);
          })
        );
        return res.sendStatus(200);
      } catch (err) {
        console.log(err);
        return res.status(400).json({ err: "Error creating Project" });
      }
    } else {
      console.log("Project exists");
      return res.status(400).json({ err: "Project already Exists" });
    }
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ err: "Error ouccured creating project !" });
  }
});

router.post("/getUserProjects", async (req, res) => {
  const list = [];
  const { username } = req.body;
  // console.log(req.body);
  try {
    var response = await UserLogins.findOne({ username: username });
    response = JSON.stringify(response);
    response = JSON.parse(response);
    const { projects } = response;
    // console.log("projects", projects);
    try {
      if (projects.length === 0) {
        return res.status(200).json(list);
      }
      await projects.forEach(async (item, index) => {
        const project = await Project.findById(item.project);
        if (project) list.push(project);
        if (index === projects.length - 1) {
          return res.status(200).json(list);
        }
      });
    } catch (err) {
      console.log(err.message);
      return res.status(400).json({ err: "Error while retrieving project" });
    }
  } catch (e) {
    res.status(400).json({ error: "User does not exits" });
  }
});

//Adding projects to user
const addProjectinUserSchema = async (id, role, projectId) => {
  try {
    const value = await UserLogins.findById(id);
    if (value) {
      // console.log(value);
      var tempUser = JSON.stringify(value);
      tempUser = JSON.parse(tempUser);
      if (tempUser.projects === undefined) tempUser.projects = [];
      tempUser.projects.push({ project: projectId, role: role });
      try {
        await UserLogins.findByIdAndUpdate(id, tempUser);
      } catch (err) {
        throw err.message;
      }
    } else {
      throw Error("Invalid User");
    }
  } catch (err) {
    throw err.message;
  }
};

router.post("/getSubproject", async (req, res) => {
  let list = [];
  const { id } = req.body;
  // console.log(id);
  try {
    var project = await Project.findById(id);
    if (project) {
      project = JSON.stringify(project);
      project = JSON.parse(project);
      const { apartments } = project;
      try {
        const values = await Promise.all(
          apartments.map((item) => Apartment.findById(item))
        );
        list = [...list, ...values];
        res.status(200).json(list);
      } catch (e) {
        throw e;
      }
    } else {
      console.log("Project does not exist");
      return res.status(400).json({ err: "Project does not exist" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ err: err.message });
  }
});

router.get("/getAllSubProjectNames/:id", async (req, res) => {
  // let list = [];
  const id = req.params.id;
  try {
    var project = await Project.findById(id);
    if (project) {
      project = JSON.stringify(project);
      project = JSON.parse(project);
      const { apartments } = project;
      var values = await Promise.all(
        apartments.map((item) => Apartment.findById(item))
      );
      // console.log(values);

      res.status(200).json(values);
    } else {
      console.log("Project does not exist");
      return res.status(400).json({ err: "Project does not exist" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ err: err.message });
  }
});

router.route("/getSingleSubProject/:id").get(async (req, res) => {
  try {
    const response = await Apartment.findById(req.params.id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/getExcludedActivities/:projectId", async (req, res) => {
  try {
    const response = await Project.findOne({ _id: req.params.projectId });

    var data = response._doc.excludedActivities;
    // console.log("exlc", data);
    res.json(data === undefined ? [] : data);
  } catch (error) {
    console.log("error", error);
    res.status(400).json("Error: " + error.message);
  }
});
router.put("/updateActivities", async (req, res) => {
  const { payload, projectId } = req.body;
  // console.log(payload, projectId);
  try {
    await Project.findOneAndUpdate(
      { _id: projectId },
      { excludedActivities: payload }
    );
    try {
      const response = await axios.get(
        `${config.get("backendURL")}/project/getExcludedActivities/${projectId}`
      );
      console.log("response", response.data);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(400).json({ msg: "Some  Error Occured", err: error });
    }
  } catch (err) {
    return res.status(401).json("Error: Something went wrong");
  }
});
router.post("/addmaterials", async (req, res) => {
  const { payload, projectId } = req.body;
  console.log("mat", payload, "proj", projectId);
  try {
    payload.forEach((material) => {
      material.materialQuantity = 0;
      material.projectId = projectId.toString();
    });
    const response = await store.collection.insertMany(payload);
    console.log("more materials inserted ", response);
    console.log("response", response);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ error: "Error adding materials" });
  }
});
router.route("/getUserRolesByProjectId/:projectId").get(async (req, res) => {
  try {
    var response = await Project.findById(req.params.projectId);
    response = JSON.stringify(response);
    response = JSON.parse(response);

    const { userNumber, totalUsers } = response;
    // console.log(totalUsers);
    const usersRole = { userNumber: userNumber, totalUsers: totalUsers };
    // console.log("Total user", usersRole);

    return res.status(200).json(usersRole);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.route("/getUsers/:projectId").get(async (req, res) => {
  try {
    var response = await Project.findById(req.params.projectId);
    response = JSON.stringify(response);
    response = JSON.parse(response);

    const { totalUsers } = response;
    var temp = [];
    temp = await Promise.all(
      totalUsers.map(async (item) => {
        const user = await UserLogins.findById(item.user);
        return user;
      })
    );
    console.log(temp);
    res.status(200).send(temp);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error.message);
  }
});

//Route to edit users
router.post(`/editUsers/:projectId`, async (req, res) => {
  try {
    const { userNumber, totalUsers } = req.body;
    // console.log(totalUsers, userNumber);
    // return res.status(200).send("Users updated successfully");
    const projectId = req.params.projectId;
    var response = await Project.findById(projectId);
    response = JSON.stringify(response);
    response = JSON.parse(response);

    // Remove the existing user
    await removeProjectFromUser(response.totalUsers, projectId);

    //Add new users
    await addNewProjectInUser(totalUsers, projectId);

    //Update the users again in project
    const response2 = await Project.findByIdAndUpdate(projectId, {
      $set: {
        totalUsers: totalUsers,
        userNumber: userNumber,
      },
    });

    // console.log("Aata aala");
    res.status(200).send("Users updated successfully");
  } catch (error) {
    console.log(error);
    return res.status(200).send({ error: "Something went wrong" });
  }
});

const removeProjectFromUser = async (users, projectId) => {
  await Promise.all(
    users.map(async (item) => {
      var user = await UserLogins.findById(item.user);
      // console.log(user);
      user = JSON.stringify(user);
      user = JSON.parse(user);
      var temp = user.projects;
      var index = temp.findIndex((item) => item.project == projectId);
      // console.log(index);
      if (index === -1) {
        return;
      }
      // console.log(temp);
      temp.splice(index, 1);
      // console.log(temp);
      const response = await UserLogins.findByIdAndUpdate(item.user, {
        $set: {
          projects: temp,
        },
      });
    })
  );
};

const addNewProjectInUser = async (users, projectId) => {
  await Promise.all(
    users.map(async (item) => {
      // console.log(item);
      var user = await UserLogins.findById(item.user);
      user = JSON.stringify(user);
      user = JSON.parse(user);
      var temp = user.projects ? user.projects : [];
      // console.log(temp);
      temp.push({ project: projectId, role: item.role });
      // console.log(temp);
      const res = await UserLogins.findByIdAndUpdate(item.user, {
        $set: {
          projects: temp,
        },
      });
    })
  );
};

// const response = await Project.findByIdAndUpdate(req.params.id, {
//   $set: { data: newActivity },
// });
module.exports = router;
