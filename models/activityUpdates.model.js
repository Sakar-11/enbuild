const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var ActivityUpdates = mongoose.model(
  "activityUpdates",
  new Schema({}, { strict: false, timestamps: true })
);
module.exports = ActivityUpdates;
