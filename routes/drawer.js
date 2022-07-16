const router = require("express").Router();

router.get("/:role", async (req, res) => {
  const role = req.params.role;
  console.log(role);
});
