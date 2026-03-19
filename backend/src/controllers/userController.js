const User = require("../models/User");
const Policy = require("../models/Policy");
const Claim = require("../models/Claim");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../utils/errors");
const { updateWorkStatus } = require("../services/activityService");
const { validateLocation } = require("../services/locationService");
const { calculateRiskForUser } = require("../services/riskService");

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select("-passwordHash -otpCode -otpExpiresAt");
  if (!user) throw new ApiError(404, "User not found");

  const [activePolicy, lastClaim, risk] = await Promise.all([
    Policy.findOne({
      userId: user._id,
      status: "active",
      endDate: { $gte: new Date() }
    }).sort({ createdAt: -1 }),
    Claim.findOne({ userId: user._id }).sort({ createdAt: -1 }),
    calculateRiskForUser(user)
  ]);

  res.json({
    user,
    dashboard: {
      riskLevel: risk.riskLevel,
      riskScore: risk.riskScore,
      currentPlan: activePolicy
        ? `${activePolicy.planName} (Rs.${activePolicy.premium}/week)`
        : "No active plan",
      coverageAmount: activePolicy?.coverage || 0,
      lastPayout: lastClaim?.payout || 0,
      activePolicy
    },
    guardrails: {
      personaCategory: "FOOD_DELIVERY",
      pricingCycle: "WEEKLY",
      coverageScope: "INCOME_LOSS_ONLY",
      excluded: ["health", "life", "accident", "vehicle_repair"]
    }
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new ApiError(404, "User not found");

  Object.assign(user, req.validated.body);
  await user.save();
  res.json({ message: "Profile updated", user });
});

const setWorkStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new ApiError(404, "User not found");

  const validation = await validateLocation({
    lat: req.validated.body.lat,
    lng: req.validated.body.lng,
    city: req.validated.body.city || user.city
  });

  if (!validation.valid) {
    throw new ApiError(400, "Location validation failed. City/GPS mismatch.");
  }

  const updated = await updateWorkStatus(req.user.userId, req.validated.body);
  res.json({
    message: updated.isOnline ? "You are now ONLINE." : "You are now OFFLINE.",
    isOnline: updated.isOnline,
    city: updated.city,
    zone: updated.zone
  });
});

module.exports = { getMe, updateProfile, setWorkStatus };
