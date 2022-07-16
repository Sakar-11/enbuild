const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose.model("materials", new Schema({}, { strict: false }));
