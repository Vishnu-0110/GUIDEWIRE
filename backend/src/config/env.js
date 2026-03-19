const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  phoneEncryptionKey:
    process.env.PHONE_ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef",
  weatherApiKey: process.env.OPENWEATHER_API_KEY || "",
  aqiApiKey: process.env.AQI_API_KEY || "",
  mapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  redisUrl: process.env.REDIS_URL || "",
  paymentProvider: process.env.PAYMENT_PROVIDER || "mock",
  defaultCurfew: process.env.DEFAULT_CURFEW || "false",
  defaultPlatformOutage: process.env.DEFAULT_PLATFORM_OUTAGE || "false",
  trafficApiKey: process.env.TRAFFIC_API_KEY || "",
  defaultLocalStrike: process.env.DEFAULT_LOCAL_STRIKE || "false",
  defaultZoneClosure: process.env.DEFAULT_ZONE_CLOSURE || "false"
};

module.exports = env;
