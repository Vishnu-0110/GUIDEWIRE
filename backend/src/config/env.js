const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function clean(value) {
  return typeof value === "string" ? value.trim() : value;
}

function toInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBool(value, fallback = false) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return fallback;
}

function csv(value) {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const env = {
  nodeEnv: clean(process.env.NODE_ENV || "development"),
  port: toInt(clean(process.env.PORT || "4000"), 4000),
  mongoUri: clean(process.env.MONGO_URI || ""),
  jwtSecret: clean(process.env.JWT_SECRET || "dev_jwt_secret_change_me"),
  jwtExpiresIn: clean(process.env.JWT_EXPIRES_IN || "7d"),
  phoneEncryptionKey:
    clean(process.env.PHONE_ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef"),
  weatherApiKey: clean(process.env.OPENWEATHER_API_KEY || ""),
  aqiApiKey: clean(process.env.AQI_API_KEY || ""),
  mapsApiKey: clean(process.env.GOOGLE_MAPS_API_KEY || ""),
  aiServiceUrl: clean(process.env.AI_SERVICE_URL || "http://localhost:8000"),
  frontendUrl: clean(process.env.FRONTEND_URL || "http://localhost:3000"),
  frontendUrls: csv(process.env.FRONTEND_URLS || ""),
  trustProxy: toBool(process.env.TRUST_PROXY || "false", false),
  redisUrl: clean(process.env.REDIS_URL || ""),
  paymentProvider: clean(process.env.PAYMENT_PROVIDER || "mock"),
  paymentCurrency: clean(process.env.PAYMENT_CURRENCY || "INR"),
  paymentApiBaseUrl: clean(process.env.PAYMENT_API_BASE_URL || ""),
  paymentApiKey: clean(process.env.PAYMENT_API_KEY || ""),
  paymentPremiumPath: clean(process.env.PAYMENT_PREMIUM_PATH || "/premium/charge"),
  paymentPayoutPath: clean(process.env.PAYMENT_PAYOUT_PATH || "/payout/send"),
  paymentTimeoutMs: toInt(clean(process.env.PAYMENT_TIMEOUT_MS || "12000"), 12000),
  paymentMockFallback: clean(process.env.PAYMENT_MOCK_FALLBACK || "true"),
  paymentAcceptPendingAsPaid: clean(process.env.PAYMENT_ACCEPT_PENDING_AS_PAID || "true"),
  razorpayKeyId: clean(process.env.RAZORPAY_KEY_ID || ""),
  razorpayKeySecret: clean(process.env.RAZORPAY_KEY_SECRET || ""),
  razorpayFundAccountId: clean(process.env.RAZORPAY_FUND_ACCOUNT_ID || ""),
  razorpayAccountNumber: clean(process.env.RAZORPAY_ACCOUNT_NUMBER || ""),
  defaultCurfew: clean(process.env.DEFAULT_CURFEW || "false"),
  defaultPlatformOutage: clean(process.env.DEFAULT_PLATFORM_OUTAGE || "false"),
  trafficProvider: clean(process.env.TRAFFIC_PROVIDER || "tomtom"),
  trafficApiKey: clean(process.env.TRAFFIC_API_KEY || ""),
  trafficApiBaseUrl: clean(
    process.env.TRAFFIC_API_BASE_URL || "https://api.tomtom.com/traffic/services/4"
  ),
  trafficMockFallback: clean(process.env.TRAFFIC_MOCK_FALLBACK || "true"),
  defaultLocalStrike: clean(process.env.DEFAULT_LOCAL_STRIKE || "false"),
  defaultZoneClosure: clean(process.env.DEFAULT_ZONE_CLOSURE || "false")
};

module.exports = env;
