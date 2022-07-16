const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Issue = mongoose.model("issues", new Schema({}, { strict: false }));
module.exports = Issue;
