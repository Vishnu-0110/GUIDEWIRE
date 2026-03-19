const axios = require("axios");
const DataCache = require("../models/DataCache");
const env = require("../config/env");

async function readCache(city, zone, sourceType) {
  return DataCache.findOne({ city, zone, sourceType });
}

async function writeCache(city, zone, sourceType, payload) {
  await DataCache.findOneAndUpdate(
    { city, zone, sourceType },
    { payload, fetchedAt: new Date() },
    { upsert: true, new: true }
  );
}

function randomInRange(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function mockWeather() {
  return {
    temperature: randomInRange(28, 46),
    rainfall: randomInRange(0, 120),
    source: "mock"
  };
}

function mockAqi() {
  return {
    aqi: randomInRange(120, 450),
    source: "mock"
  };
}

function mockTraffic() {
  return {
    trafficIndex: randomInRange(4, 10),
    source: "mock_traffic"
  };
}

function mockPlatformStatus() {
  return {
    platformOutage: env.defaultPlatformOutage === "true",
    source: "mock_platform"
  };
}

function mockSocialStatus() {
  return {
    localStrike: env.defaultLocalStrike === "true",
    zoneClosure: env.defaultZoneClosure === "true",
    source: "mock_social"
  };
}

async function withFallback({ city, zone, sourceType, fetcher }) {
  try {
    const payload = await fetcher();
    await writeCache(city, zone, sourceType, payload);
    return { ...payload, fallbackUsed: false };
  } catch (error) {
    const cached = await readCache(city, zone, sourceType);
    if (cached?.payload) {
      return { ...cached.payload, fallbackUsed: true };
    }
    return { missing: true, fallbackUsed: true };
  }
}

async function fetchWeatherRealtime(city, zone = "central") {
  return withFallback({
    city,
    zone,
    sourceType: "weather_realtime",
    fetcher: async () => {
      if (!env.weatherApiKey) {
        return mockWeather();
      }

      const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
          params: { q: city, units: "metric", appid: env.weatherApiKey },
          timeout: 7000
        }
      );

      const rainfall = response.data?.rain?.["1h"] || 0;
      const temperature = response.data?.main?.temp || 0;
      return { rainfall, temperature, source: "openweather_current" };
    }
  });
}

async function fetchWeatherForecast(city, zone = "central") {
  return withFallback({
    city,
    zone,
    sourceType: "weather_forecast",
    fetcher: async () => {
      if (!env.weatherApiKey) {
        const weather = mockWeather();
        return {
          forecastRainfall: weather.rainfall,
          forecastTemperature: weather.temperature,
          source: "mock"
        };
      }

      const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/forecast",
        {
          params: { q: city, units: "metric", appid: env.weatherApiKey },
          timeout: 7000
        }
      );

      const nextWindow = response.data?.list?.slice(0, 8) || [];
      const forecastRainfall = nextWindow.reduce(
        (acc, entry) => acc + (entry?.rain?.["3h"] || 0),
        0
      );
      const forecastTemperature =
        nextWindow.reduce((acc, entry) => acc + (entry?.main?.temp || 0), 0) /
        (nextWindow.length || 1);

      return {
        forecastRainfall: Number(forecastRainfall.toFixed(2)),
        forecastTemperature: Number(forecastTemperature.toFixed(2)),
        source: "openweather_forecast"
      };
    }
  });
}

async function fetchAqiRealtime(city, zone = "central") {
  return withFallback({
    city,
    zone,
    sourceType: "aqi_realtime",
    fetcher: async () => {
      if (!env.aqiApiKey) {
        return mockAqi();
      }

      const response = await axios.get(`https://api.waqi.info/feed/${city}/`, {
        params: { token: env.aqiApiKey },
        timeout: 7000
      });

      const aqi = Number(response.data?.data?.aqi || 0);
      return { aqi, source: "waqi" };
    }
  });
}

async function fetchCurfewStatus(city, zone = "central") {
  return withFallback({
    city,
    zone,
    sourceType: "curfew",
    fetcher: async () => {
      // In production this can point to civic/government feeds.
      const curfew = env.defaultCurfew === "true";
      return { curfew, source: "config" };
    }
  });
}

async function fetchTrafficRealtime(city, zone = "central") {
  return withFallback({
    city,
    zone,
    sourceType: "traffic_realtime",
    fetcher: async () => {
      // Mocks are acceptable for hackathon mode.
      // This hook is API-ready and can be replaced with TomTom/Mapbox/Google traffic feeds.
      return mockTraffic();
    }
  });
}

async function fetchPlatformStatus(city, zone = "central") {
  return withFallback({
    city,
    zone,
    sourceType: "platform_status",
    fetcher: async () => {
      // Simulated platform API integration for app crash/outage signal.
      return mockPlatformStatus();
    }
  });
}

async function fetchSocialStatus(city, zone = "central") {
  return withFallback({
    city,
    zone,
    sourceType: "social_realtime",
    fetcher: async () => {
      // Simulated integration hook for civic/municipal/local market closure feeds.
      return mockSocialStatus();
    }
  });
}

async function fetchLiveConditions(city, zone = "central") {
  const [weather, aqi, traffic, curfew, platform, social] = await Promise.all([
    fetchWeatherRealtime(city, zone),
    fetchAqiRealtime(city, zone),
    fetchTrafficRealtime(city, zone),
    fetchCurfewStatus(city, zone),
    fetchPlatformStatus(city, zone),
    fetchSocialStatus(city, zone)
  ]);

  return {
    city,
    zone,
    temperature: weather.temperature || null,
    rainfall: weather.rainfall || 0,
    aqi: aqi.aqi || null,
    trafficIndex: traffic.trafficIndex || 0,
    curfew: Boolean(curfew.curfew),
    platformOutage: Boolean(platform.platformOutage),
    localStrike: Boolean(social.localStrike),
    zoneClosure: Boolean(social.zoneClosure),
    fallbackUsed:
      weather.fallbackUsed ||
      aqi.fallbackUsed ||
      traffic.fallbackUsed ||
      curfew.fallbackUsed ||
      platform.fallbackUsed ||
      social.fallbackUsed,
    missingData:
      weather.missing ||
      aqi.missing ||
      traffic.missing ||
      curfew.missing ||
      platform.missing ||
      social.missing
  };
}

module.exports = {
  fetchWeatherRealtime,
  fetchWeatherForecast,
  fetchAqiRealtime,
  fetchTrafficRealtime,
  fetchCurfewStatus,
  fetchPlatformStatus,
  fetchSocialStatus,
  fetchLiveConditions
};
