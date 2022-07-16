const router = require("express").Router();
const userLogin = require("../models/userLogin.model");
const config = require("config");
const gcm = require("node-gcm");
var FCM = require("fcm-node");
var serverKey = require("../config/sds-construction-c1bc7-firebase-adminsdk-z8qw6-68e836b272.json"); //put the generated private key path here
// var fcm = new FCM(serverKey);
var admin = require("firebase-admin");

var serviceAccount = require("../config/sds-construction-c1bc7-firebase-adminsdk-z8qw6-68e836b272.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

const messaging = admin.messaging();
router.get("/notify", (req, res) => {
  userLogin.find({}, function (err, users) {
    var user_ids = [];
    for (var user of users) {
      if (user._doc["notification_id"] != undefined)
        user_ids.push(...user._doc["notification_id"]);
    }
    user_ids = Array.from(new Set(user_ids));
    console.log(user_ids);
    var payload = {
      notification: {
        title: "This is a Notification",
        body: "This is the body of the notification message.",
      },
      tokens: user_ids,
    };

    messaging.sendMulticast(payload).then(result => {
      console.log(result);
    });
  });
});
router.post("/buzz", async (req, res) => {
  const { user_ids, title, body } = req.body;
  console.log(user_ids);
  var payload = {
    notification: {
      title: title,
      body: body,
    },
    tokens: user_ids,
  };

  await messaging.sendMulticast(payload).then(result => {
    console.log(result);
    res.status(200).json("success");
  });
  return;
});
module.exports = router;
