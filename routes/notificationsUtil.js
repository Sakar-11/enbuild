const gcm = require("node-gcm");
var FCM = require("fcm-node");
var serverKey = require("../config/sds-construction-c1bc7-firebase-adminsdk-z8qw6-68e836b272.json"); //put the generated private key path here
// var fcm = new FCM(serverKey);
var admin = require("firebase-admin");

var serviceAccount = require("../config/sds-construction-c1bc7-firebase-adminsdk-z8qw6-68e836b272.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const messaging = admin.messaging();
const notify = (users, title, body) => {
  // console.log("users", users);
  try {
    users = Array.from(new Set(users));
    var payload = {
      notification: {
        title: title,
        body: body
      },
      tokens: users
    };

    messaging.sendMulticast(payload).then(result => {
      console.log(result);
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports = { notify };
