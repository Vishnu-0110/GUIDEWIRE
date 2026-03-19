const Claim = require("../models/Claim");
const asyncHandler = require("../utils/asyncHandler");
const { getDashboardMetrics } = require("../services/adminService");

const getAdminDashboard = asyncHandler(async (req, res) => {
  const metrics = await getDashboardMetrics();
  const fraudAlerts = await Claim.find({ status: { $in: ["flagged", "rejected"] } })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("userId", "name city platform");

  res.json({ metrics, fraudAlerts });
});

module.exports = { getAdminDashboard };
