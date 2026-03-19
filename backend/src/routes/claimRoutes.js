const express = require("express");
const { authRequired } = require("../middleware/auth");
const { getMyClaims } = require("../controllers/claimController");

const router = express.Router();

router.use(authRequired);
router.get("/my", getMyClaims);

module.exports = router;
