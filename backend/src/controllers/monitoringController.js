const User = require("../models/User");
const Event = require("../models/Event");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../utils/errors");
const { fetchLiveConditions } = require("../services/externalDataService");
const { evaluateConditions } = require("../services/triggerService");

const getLiveMonitoring = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new ApiError(404, "User not found");

  const live = await fetchLiveConditions(user.city, user.zone, user.lastKnownLocation || {});
  const alerts = evaluateConditions(live);
  const recentEvents = await Event.find({ city: user.city, zone: user.zone })
    .sort({ timestamp: -1 })
    .limit(10);

  res.json({
    live,
    alerts,
    recentEvents,
    guardrails: {
      coverageScope: "INCOME_LOSS_ONLY",
      pricingCycle: "WEEKLY"
    }
  });
});

module.exports = { getLiveMonitoring };
