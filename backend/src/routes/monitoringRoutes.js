const express = require("express");
const { authRequired } = require("../middleware/auth");
const { getLiveMonitoring } = require("../controllers/monitoringController");

const router = express.Router();

router.use(authRequired);
router.get("/live", getLiveMonitoring);

module.exports = router;
