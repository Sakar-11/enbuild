const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Labour = mongoose.model("labour", new Schema({}, { strict: false }));
module.exports = Labour;
