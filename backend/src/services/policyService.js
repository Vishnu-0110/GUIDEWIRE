const Policy = require("../models/Policy");
const { PLAN_OPTIONS } = require("../config/constants");
const { calculateRiskForUser } = require("./riskService");
const { chargePremium } = require("./paymentService");

function getPlanByPremium(premium) {
  return PLAN_OPTIONS.find((plan) => plan.premium === premium);
}

async function suggestPlans(user) {
  const risk = await calculateRiskForUser(user);
  return {
    risk,
    plans: PLAN_OPTIONS.map((plan) => ({
      ...plan,
      aiSuggested: plan.premium >= risk.premium
    }))
  };
}

async function createWeeklyPolicy({ user, selectedPremium }) {
  const existing = await Policy.findOne({
    userId: user._id,
    status: "active",
    endDate: { $gte: new Date() }
  });

  if (existing) {
    return {
      error: "Active policy already exists. Renew only after expiry.",
      policy: existing
    };
  }

  const selectedPlan = getPlanByPremium(selectedPremium);
  if (!selectedPlan) {
    return { error: "Invalid plan selected." };
  }

  const risk = await calculateRiskForUser(user);
  const payment = await chargePremium({
    userId: user._id,
    amount: selectedPlan.premium
  });

  if (payment.status !== "paid") {
    return { error: "Payment failed." };
  }

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  const policy = await Policy.create({
    userId: user._id,
    city: user.city,
    zone: user.zone,
    premium: selectedPlan.premium,
    coverage: selectedPlan.coverage,
    premiumCycle: "WEEKLY",
    coverageScope: "INCOME_LOSS_ONLY",
    riskScore: risk.riskScore,
    riskLevel: risk.riskLevel,
    planName: selectedPlan.name,
    startDate,
    endDate,
    status: "active",
    paymentStatus: "paid",
    paymentReference: payment.reference
  });

  return { policy, risk };
}

async function expirePolicies() {
  const result = await Policy.updateMany(
    { status: "active", endDate: { $lt: new Date() } },
    { $set: { status: "expired" } }
  );
  return result.modifiedCount || 0;
}

async function getActiveAreas() {
  return Policy.aggregate([
    {
      $match: { status: "active", endDate: { $gte: new Date() } }
    },
    {
      $group: { _id: { city: "$city", zone: "$zone" }, users: { $sum: 1 } }
    }
  ]);
}

module.exports = { suggestPlans, createWeeklyPolicy, expirePolicies, getActiveAreas };
