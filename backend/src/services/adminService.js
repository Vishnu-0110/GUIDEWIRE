const User = require("../models/User");
const Policy = require("../models/Policy");
const Claim = require("../models/Claim");

async function getDashboardMetrics() {
  const [totalUsers, activePolicies, totalClaims, fraudAlerts, paidClaims, revenue] =
    await Promise.all([
      User.countDocuments(),
      Policy.countDocuments({ status: "active", endDate: { $gte: new Date() } }),
      Claim.countDocuments(),
      Claim.countDocuments({ status: { $in: ["flagged", "rejected"] } }),
      Claim.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, avgPayout: { $avg: "$payout" } } }
      ]),
      Policy.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, weeklyRevenue: { $sum: "$premium" } } }
      ])
    ]);

  return {
    totalUsers,
    activePolicies,
    claimsTriggered: totalClaims,
    fraudAlerts,
    averagePayout: Math.round(paidClaims[0]?.avgPayout || 0),
    weeklyRevenue: revenue[0]?.weeklyRevenue || 0
  };
}

module.exports = { getDashboardMetrics };
