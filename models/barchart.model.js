const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var BarChart = mongoose.model("barcharts", new Schema({}, { strict: false }));
module.exports = BarChart;
