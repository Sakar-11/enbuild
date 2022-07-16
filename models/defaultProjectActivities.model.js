const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var DefaultActivities = mongoose.model(
  "defaultProjectAcitvity",
  new Schema({}, { strict: false })
);
module.exports = DefaultActivities;
