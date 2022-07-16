const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userLogin = mongoose.model("userLogin", new Schema({}, { strict: false }));
//var User = mongoose.model('users', userSchema);
module.exports = userLogin;
