const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Project = mongoose.model("projects", new Schema({}, { strict: false }));
module.exports = Project;
