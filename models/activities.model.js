const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Activities = mongoose.model(
  "activities",
  new Schema({}, { strict: false })
);
module.exports = Activities;
