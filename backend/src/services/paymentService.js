const env = require("../config/env");

function generateReference(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

async function chargePremium({ userId, amount, method = "mock_upi" }) {
  if (env.paymentProvider === "mock") {
    return {
      status: "paid",
      reference: generateReference("PREMIUM"),
      provider: method
    };
  }

  return {
    status: "paid",
    reference: generateReference("LIVE"),
    provider: env.paymentProvider
  };
}

async function sendPayout({ userId, amount }) {
  if (env.paymentProvider === "mock") {
    return {
      status: "paid",
      reference: generateReference("PAYOUT"),
      provider: "mock_upi"
    };
  }

  return {
    status: "paid",
    reference: generateReference("PAYOUT_LIVE"),
    provider: env.paymentProvider
  };
}

module.exports = { chargePremium, sendPayout };
