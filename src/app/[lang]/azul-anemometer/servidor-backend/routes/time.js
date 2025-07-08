const express = require("express");
const router  = express.Router();

router.get("/", (req, res) => {
  const now = Math.floor(Date.now() / 1000); // UNIX time (segundos)
  res.json({ unixtime: now });
});

module.exports = router;