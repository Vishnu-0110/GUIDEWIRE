const express = require("express");
const { authRequired, adminOnly } = require("../middleware/auth");
const { getAdminDashboard } = require("../controllers/adminController");
const { triggerNow, triggerAreaNow } = require("../controllers/triggerController");

const router = express.Router();

router.use(authRequired);
router.use(adminOnly);
router.get("/dashboard", getAdminDashboard);
router.post("/trigger-now", triggerNow);
router.post("/trigger-area", triggerAreaNow);

module.exports = router;
