const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Checklist = mongoose.model("checklists", new Schema({}, { strict: false }));
module.exports = Checklist;
