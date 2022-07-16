const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Monitoring = mongoose.model(
  "monitoring",
  new Schema({}, { strict: false })
);
module.exports = Monitoring;
