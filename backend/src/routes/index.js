const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const policyRoutes = require("./policyRoutes");
const monitoringRoutes = require("./monitoringRoutes");
const claimRoutes = require("./claimRoutes");
const adminRoutes = require("./adminRoutes");
const dataRoutes = require("./dataRoutes");
const assistantRoutes = require("./assistantRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "gigshield-backend" });
});
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/policies", policyRoutes);
router.use("/monitoring", monitoringRoutes);
router.use("/claims", claimRoutes);
router.use("/admin", adminRoutes);
router.use("/", dataRoutes);
router.use("/assistant", assistantRoutes);

module.exports = router;
