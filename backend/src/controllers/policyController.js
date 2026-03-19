const User = require("../models/User");
const Policy = require("../models/Policy");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../utils/errors");
const { suggestPlans, createWeeklyPolicy } = require("../services/policyService");

const getPlanSuggestions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new ApiError(404, "User not found");

  const suggestions = await suggestPlans(user);
  res.json(suggestions);
});

const buyPolicy = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new ApiError(404, "User not found");

  const { premium } = req.validated.body;
  const result = await createWeeklyPolicy({ user, selectedPremium: premium });
  if (result.error) throw new ApiError(400, result.error);

  res.status(201).json({
    message: "Policy activated for 7 days",
    policy: result.policy,
    risk: result.risk,
    guardrails: {
      pricingCycle: "WEEKLY",
      coverageScope: "INCOME_LOSS_ONLY",
      excluded: ["health", "life", "accident", "vehicle_repair"]
    }
  });
});

const getMyPolicies = asyncHandler(async (req, res) => {
  const policies = await Policy.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json({ policies });
});

module.exports = { getPlanSuggestions, buyPolicy, getMyPolicies };
