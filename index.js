const express = require("express");

const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

// prod
const path = require("path");

(async function () {
  await connectDB();
})();

const port = process.env.PORT || 5000;
const routes = [
  "users",
  "login",
  "register",
  "project",
  "issues",
  "material",
  "activities",
  "todo",
  "checklist",
  "plan",
  "dpr",
  "stores",
  "barcharts",
  "monitoring",
  "notifications",
  "visitors",
  "library",
  "labour",
  "equipment",
  "overview",
  "wbs",
];

app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => res.send("Hello World!"));

routes.forEach((route) =>
  app.use(`/api/${route}`, require(`./routes/${route}`))
);
// prod
// if (process.env.NODE_ENV == "production") {
app.use(express.static("client/build"));

app.get("/service-worker.js", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "public", "worker.js"));
});
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});
// }
app.listen(port, () => {
  console.log(`Server Listening on port ${port}`);
});
