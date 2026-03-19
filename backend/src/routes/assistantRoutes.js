const express = require("express");
const { authRequired } = require("../middleware/auth");
const { voiceAssist, offlineAlert } = require("../controllers/assistantController");

const router = express.Router();

router.get("/voice", authRequired, voiceAssist);
router.post("/offline-alert", authRequired, offlineAlert);

module.exports = router;
