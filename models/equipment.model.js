const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Equipment = mongoose.model("equipment", new Schema({}, { strict: false }));
module.exports = Equipment;
