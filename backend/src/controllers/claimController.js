const Claim = require("../models/Claim");
const asyncHandler = require("../utils/asyncHandler");

const getMyClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find({ userId: req.user.userId })
    .populate("eventId", "eventType city zone triggerValue severityPercent timestamp")
    .sort({ createdAt: -1 });

  res.json({ claims });
});

module.exports = { getMyClaims };
