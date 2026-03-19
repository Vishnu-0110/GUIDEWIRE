const ActivityLog = require("../models/ActivityLog");
const Claim = require("../models/Claim");
const { detectFraud } = require("./aiService");

async function evaluateFraud({ user, event }) {
  const flags = [];
  let reject = false;
  let flagged = false;

  const recentActivity = await ActivityLog.findOne({
    userId: user._id,
    timestamp: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) }
  }).sort({ timestamp: -1 });

  if (!recentActivity || !recentActivity.online) {
    flags.push("no_delivery_activity");
    reject = true;
  }

  const lastLocation = user.lastKnownLocation || {};
  const cityMismatch =
    lastLocation.city &&
    lastLocation.city.toLowerCase() !== event.city.toLowerCase();
  const zoneMismatch =
    lastLocation.zone &&
    lastLocation.zone.toLowerCase() !== event.zone.toLowerCase();

  if (cityMismatch || zoneMismatch) {
    flags.push("gps_mismatch");
    reject = true;
  }

  const recentClaimsCount = await Claim.countDocuments({
    userId: user._id,
    createdAt: { $gte: new Date(Date.now() - 4 * 60 * 60 * 1000) }
  });

  if (recentClaimsCount > 0) {
    flags.push("multiple_claims_same_window");
    flagged = true;
  }

  const aiResult = await detectFraud({
    claimFrequency: recentClaimsCount + 1,
    locationDistance: cityMismatch || zoneMismatch ? 10 : 0.5,
    activityScore: recentActivity?.deliveriesCompleted || 0,
    onlineDurationMinutes: user.onlineSince
      ? Math.floor((Date.now() - new Date(user.onlineSince).getTime()) / 60000)
      : 0
  });

  if (aiResult.isAnomaly) {
    flags.push("ai_anomaly_detected");
    flagged = true;
  }

  return {
    flags,
    status: reject ? "rejected" : flagged ? "flagged" : "clean",
    ai: aiResult
  };
}

module.exports = { evaluateFraud };
