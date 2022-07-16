const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var roads = mongoose.model("roads", new Schema({}, { strict: false }));
module.exports = roads;
