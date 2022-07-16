const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");
// const db = config.get("mongoAtlas");

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      dbName: "Construction",
    });

    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("Error in Connection", err.message);
    // Exit process with failure
    process.exit(1);
  }
};

//"mongoURI": "mongodb+srv://rootUser:rootUserPa$$word@sss-x10cv.mongodb.net/Construction?retryWrites=true&w=majority"

module.exports = connectDB;
