// const router = require("express").Router();
// const Project = require("../models/project.model");
const userLogin = require("../models/userLogin.model");

const storeRoles = ["store_manager", "purchase_manager"];
const storePaths = ["/material", "/store"];

const planningRoles = ["planning_manager"];
const planningPaths = [
  "/plan",
  "/barchart",
  "/monitoring",
  "/subprojectList",
  "/dpr",
];

const qualityRoles = ["quality_engineer", "safety_engineer"];
const qualityPaths = [
  "/issues/:type",
  "/checklist/:type",
  "/checklist/:type/:defaultChecklist",
  "/checklist/:type/:defaultChecklist/addChecklist",
  "/subprojectList",
];

const mainRoles = ["project_manager", "chief_engineer", "super_admin"];
const mainPaths = ["/addMaterial", "/editUser", "/subprojectList"];

const universalPaths = ["/projectList", "/todo", "/support"];

const superAdminPaths = ["/addProject"];

const verifyRole = async (req, res, next) => {
  const path = req.body.headers["route"];
  const role = req.body.headers["role"];
  const projectId = req.body.headers["projectId"];
  const username = req.body.headers["username"];

  console.log({ path, role, projectId, username });

  if (universalPaths.find(item => item === path)) {
    next();
    return;
  }

  if (superAdminPaths.find(item => item === path)) {
    var user = await userLogin.findOne({ username: username });
    user = JSON.stringify(user);
    user = JSON.parse(user);
    if (user.isAdmin) {
      next();
      return;
    } else {
      res.status(400).send("Invalid route");
      return;
    }
  }

  if (
    mainRoles.find(item => item === role) &&
    !superAdminPaths.find(item => item === path)
  ) {
    next();
    return;
  }

  if (
    !verifyParticularRole(role, path, storeRoles, storePaths) ||
    !verifyParticularRole(role, path, qualityRoles, qualityPaths) ||
    !verifyParticularRole(role, path, planningRoles, planningPaths)
  ) {
    res.status(400).send("Invalid route");
    return;
  }

  next();
};

//Verify store roles
const verifyParticularRole = (role, path, roleArray, rolePath) => {
  if (
    roleArray.find(item => item === role) &&
    !rolePath.find(item => path === item)
  ) {
    return false;
  }
  return true;
};

module.exports = verifyRole;
