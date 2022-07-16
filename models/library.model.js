const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Library = mongoose.model("libraries", new Schema({}, { strict: false }));
module.exports = Library;
