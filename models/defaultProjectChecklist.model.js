const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var DefaultChecklist = mongoose.model(
  "defaultProjectChecklist",
  new Schema({}, { strict: false })
);
module.exports = DefaultChecklist;
