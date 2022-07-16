const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Apartment = mongoose.model("apartments", new Schema({}, { strict: false }));
module.exports = Apartment;
