const axios = require("axios");
const env = require("../config/env");

function generateReference(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function toMinorUnits(amount) {
  return Math.max(0, Math.round(Number(amount || 0) * 100));
}

function normalizeStatus(status) {
  const normalized = `${status || ""}`.toLowerCase();
  if (["paid", "captured", "succeeded", "success", "processed", "completed"].includes(normalized)) {
    return "paid";
  }
  if (["pending", "processing", "queued", "created", "initiated", "authorized"].includes(normalized)) {
    return "pending";
  }
  return "failed";
}

function finalStatus(status) {
  if (status === "pending" && env.paymentAcceptPendingAsPaid === "true") {
    return "paid";
  }
  return status;
}

function buildUrl(baseUrl, path) {
  return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

function mockPremium(method = "mock_upi") {
  return {
    status: "paid",
    reference: generateReference("PREMIUM"),
    provider: method
  };
}

function mockPayout() {
  return {
    status: "paid",
    reference: generateReference("PAYOUT"),
    provider: "mock_upi"
  };
}

function providerError(provider, error) {
  return {
    status: "failed",
    reference: generateReference("PAYMENT_FAIL"),
    provider,
    error: error.message
  };
}

function providerHeaders() {
  const headers = {};
  if (env.paymentApiKey) {
    headers.Authorization = `Bearer ${env.paymentApiKey}`;
  }
  return headers;
}

async function callCustomProvider(path, payload) {
  if (!env.paymentApiBaseUrl) {
    throw new Error("PAYMENT_API_BASE_URL missing for custom provider.");
  }

  const response = await axios.post(buildUrl(env.paymentApiBaseUrl, path), payload, {
    headers: providerHeaders(),
    timeout: env.paymentTimeoutMs
  });

  const data = response.data || {};
  return {
    status: finalStatus(normalizeStatus(data.status)),
    reference: data.reference || data.id || generateReference("EXT"),
    provider: data.provider || "custom_api"
  };
}

function razorpayAuthHeader() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new Error("Razorpay credentials missing.");
  }
  const token = Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

async function chargeWithRazorpay({ userId, amount }) {
  const response = await axios.post(
    "https://api.razorpay.com/v1/orders",
    {
      amount: toMinorUnits(amount),
      currency: env.paymentCurrency,
      receipt: `premium_${userId}_${Date.now()}`,
      notes: {
        userId: `${userId}`
      }
    },
    {
      headers: razorpayAuthHeader(),
      timeout: env.paymentTimeoutMs
    }
  );

  return {
    status: finalStatus(normalizeStatus(response.data?.status || "created")),
    reference: response.data?.id || generateReference("RZP_ORDER"),
    provider: "razorpay"
  };
}

async function payoutWithRazorpay({ userId, amount }) {
  if (!env.razorpayAccountNumber || !env.razorpayFundAccountId) {
    throw new Error("Razorpay payout account settings missing.");
  }

  const response = await axios.post(
    "https://api.razorpay.com/v1/payouts",
    {
      account_number: env.razorpayAccountNumber,
      fund_account_id: env.razorpayFundAccountId,
      amount: toMinorUnits(amount),
      currency: env.paymentCurrency,
      mode: "UPI",
      purpose: "payout",
      queue_if_low_balance: true,
      narration: "GigShield instant payout",
      reference_id: `claim_${userId}_${Date.now()}`
    },
    {
      headers: razorpayAuthHeader(),
      timeout: env.paymentTimeoutMs
    }
  );

  return {
    status: finalStatus(normalizeStatus(response.data?.status)),
    reference: response.data?.id || generateReference("RZP_PAYOUT"),
    provider: "razorpay"
  };
}

async function chargePremium({ userId, amount, method = "mock_upi" }) {
  const provider = (env.paymentProvider || "mock").toLowerCase();
  if (provider === "mock") return mockPremium(method);

  try {
    if (provider === "custom_api") {
      return callCustomProvider(env.paymentPremiumPath, { userId, amount, method });
    }
    if (provider === "razorpay") {
      return chargeWithRazorpay({ userId, amount });
    }
    if (env.paymentApiBaseUrl) {
      return callCustomProvider(env.paymentPremiumPath, { userId, amount, method });
    }
    throw new Error(`Unsupported PAYMENT_PROVIDER: ${env.paymentProvider}`);
  } catch (error) {
    if (env.paymentMockFallback === "true") {
      return {
        ...mockPremium(method),
        provider: "mock_fallback",
        fallbackUsed: true
      };
    }
    return providerError(provider, error);
  }
}

async function sendPayout({ userId, amount }) {
  const provider = (env.paymentProvider || "mock").toLowerCase();
  if (provider === "mock") return mockPayout();

  try {
    if (provider === "custom_api") {
      return callCustomProvider(env.paymentPayoutPath, { userId, amount });
    }
    if (provider === "razorpay") {
      return payoutWithRazorpay({ userId, amount });
    }
    if (env.paymentApiBaseUrl) {
      return callCustomProvider(env.paymentPayoutPath, { userId, amount });
    }
    throw new Error(`Unsupported PAYMENT_PROVIDER: ${env.paymentProvider}`);
  } catch (error) {
    if (env.paymentMockFallback === "true") {
      return {
        ...mockPayout(),
        provider: "mock_fallback",
        fallbackUsed: true
      };
    }
    return providerError(provider, error);
  }
}

module.exports = { chargePremium, sendPayout };
