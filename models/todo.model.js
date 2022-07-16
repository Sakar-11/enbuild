const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose.model("todos", new Schema({}, { strict: false }));
