const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Dpr = mongoose.model("dpr", new Schema({}, { strict: false }));
module.exports = Dpr;
