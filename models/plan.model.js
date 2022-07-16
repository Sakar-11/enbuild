const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose.model("plans", new Schema({}, { strict: false }));
