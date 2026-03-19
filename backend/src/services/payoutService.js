const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const User = require("../models/User");
const Event = require("../models/Event");
const { evaluateFraud } = require("./fraudService");
const { calculateLostHours, calculatePayout } = require("./incomeLossService");
const { sendPayout } = require("./paymentService");
const { notifyUser } = require("./notificationService");

async function createRejectedClaim({ user, policy, event, reason, fraudFlags = [] }) {
  return Claim.create({
    userId: user._id,
    policyId: policy._id,
    eventId: event._id,
    coverageScope: "INCOME_LOSS_ONLY",
    payout: 0,
    lostHours: 0,
    reason,
    status: "rejected",
    fraudFlags,
    triggerSnapshot: {
      eventType: event.eventType,
      severityPercent: event.severityPercent,
      triggerValue: event.triggerValue
    }
  });
}

async function processPayoutForUserEvent({ userId, eventId }) {
  const [user, event] = await Promise.all([User.findById(userId), Event.findById(eventId)]);
  if (!user || !event) return null;

  const policy = await Policy.findOne({
    userId: user._id,
    status: "active",
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });
  if (!policy) return null;

  const existingClaim = await Claim.findOne({
    userId: user._id,
    eventId: event._id
  });
  if (existingClaim) return existingClaim;

  if (!user.isOnline) {
    return createRejectedClaim({
      user,
      policy,
      event,
      reason: "User offline during disruption"
    });
  }

  const fraud = await evaluateFraud({ user, event });
  if (fraud.status === "rejected") {
    return createRejectedClaim({
      user,
      policy,
      event,
      reason: "Claim rejected due to fraud checks",
      fraudFlags: fraud.flags
    });
  }

  const lostHours = calculateLostHours(event.severityPercent, event.eventType);
  const payoutCalc = calculatePayout({
    dailyIncome: user.dailyIncome,
    workingHours: user.workingHours,
    lostHours,
    coverage: policy.coverage,
    demandDropPercent: event.metadata?.demandDropPercent || 0
  });

  if (fraud.status === "flagged") {
    return Claim.create({
      userId: user._id,
      policyId: policy._id,
      eventId: event._id,
      coverageScope: "INCOME_LOSS_ONLY",
      payout: payoutCalc.payout,
      lostHours,
      reason: `Flagged claim for ${event.eventType} disruption`,
      status: "flagged",
      fraudFlags: fraud.flags,
      triggerSnapshot: {
        eventType: event.eventType,
        severityPercent: event.severityPercent,
        triggerValue: event.triggerValue
      }
    });
  }

  const payment = await sendPayout({
    userId: user._id,
    amount: payoutCalc.payout
  });

  const claim = await Claim.create({
    userId: user._id,
    policyId: policy._id,
    eventId: event._id,
    coverageScope: "INCOME_LOSS_ONLY",
    payout: payoutCalc.payout,
    lostHours,
    reason: `${event.eventType.toUpperCase()} threshold breach auto-trigger`,
    status: payment.status === "paid" ? "paid" : "flagged",
    paymentReference: payment.reference,
    fraudFlags: [],
    triggerSnapshot: {
      eventType: event.eventType,
      severityPercent: event.severityPercent,
      triggerValue: event.triggerValue,
      threshold: event.threshold,
      demandMultiplier: payoutCalc.demandMultiplier
    }
  });

  await notifyUser(
    user,
    `${event.eventType.toUpperCase()} detected in ${event.city}. Rs.${claim.payout} credited instantly.`
  );

  return claim;
}

module.exports = { processPayoutForUserEvent };
