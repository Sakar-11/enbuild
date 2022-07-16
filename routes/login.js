const router = require("express").Router();
const jwt = require("jsonwebtoken");
const config = require("config");
const userLogin = require("../models/userLogin.model");
const axios = require("axios");
router.get("/getKey", (req, res) => {
  return res.send(config.get("encryptKey"));
});

router.post("/", async (req, res) => {
  const { username, password, notification_id } = req.body;
  console.log(req.body);
  try {
    let user = await userLogin.findOne({ username: username });
    if (!user) throw new Error("User not found");
    // console.log(user);
    user = JSON.parse(JSON.stringify(user));
    if (password === user.password) {
      const payload = {
        user: { id: user.username },
      };
      try {
        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: 36000 },
          (err, token) => {
            if (err) throw err;
            if (
              user.notification_id &&
              user.notification_id.includes(notification_id)
            ) {
              console.log("YEAH ! IT EXISTS !!");
              res.status(200).json({
                token,
                user,
              });
            } else {
              axios
                .post(
                  `${config.get("backendURL")}/users/addToNotificationsList`,
                  {
                    notification_id: notification_id,
                    username: username,
                  }
                )
                .then(resp => {
                  res.status(200).json({
                    token,
                    user,
                  });
                })
                .catch(err => {
                  res.status(400).json({ err });
                });
            }
          }
        );
      } catch (err) {
        res.status(400).json({ err });
      }
    } else {
      return res.status(400).json({ err: "Invalid Credentials" });
    }
  } catch (err) {
    return res.status(400).json({ err: "Invalid Credentials" });
  }
});
module.exports = router;
