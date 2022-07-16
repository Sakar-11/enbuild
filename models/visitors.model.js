const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var visitors = mongoose.model("visitors", new Schema({}, { strict: false }));
module.exports = visitors;