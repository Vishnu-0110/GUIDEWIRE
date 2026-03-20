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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

async function resolveCoordinates(city, location = {}) {
  if (isFiniteNumber(location.lat) && isFiniteNumber(location.lng)) {
    return { lat: location.lat, lng: location.lng, source: "user_gps" };
  }

  if (env.mapsApiKey) {
    try {
      const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: { address: city, key: env.mapsApiKey },
        timeout: 7000
      });
      const geocode = response.data?.results?.[0]?.geometry?.location;
      if (isFiniteNumber(geocode?.lat) && isFiniteNumber(geocode?.lng)) {
        return { lat: geocode.lat, lng: geocode.lng, source: "google_geocode" };
      }
    } catch (error) {
      // Continue to secondary geocoder.
    }
  }

  if (env.weatherApiKey) {
    try {
      const response = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
        params: { q: city, limit: 1, appid: env.weatherApiKey },
        timeout: 7000
      });
      const geocode = response.data?.[0];
      if (isFiniteNumber(geocode?.lat) && isFiniteNumber(geocode?.lon)) {
        return { lat: geocode.lat, lng: geocode.lon, source: "openweather_geocode" };
      }
    } catch (error) {
      // Let the caller decide fallback behavior.
    }
  }

  return null;
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

async function fetchTrafficRealtime(city, zone = "central", location = {}) {
  return withFallback({
    city,
    zone,
    sourceType: "traffic_realtime",
    fetcher: async () => {
      if (env.trafficProvider === "mock") {
        return mockTraffic();
      }

      if (!env.trafficApiKey) {
        if (env.trafficMockFallback === "true") return mockTraffic();
        throw new Error("Traffic provider not configured: TRAFFIC_API_KEY missing.");
      }

      if (env.trafficProvider !== "tomtom") {
        throw new Error(`Unsupported TRAFFIC_PROVIDER: ${env.trafficProvider}`);
      }

      const coordinates = await resolveCoordinates(city, location);
      if (!coordinates) {
        if (env.trafficMockFallback === "true") return mockTraffic();
        throw new Error(`Unable to resolve coordinates for city ${city}`);
      }

      const response = await axios.get(
        `${env.trafficApiBaseUrl}/flowSegmentData/absolute/10/json`,
        {
          params: {
            key: env.trafficApiKey,
            point: `${coordinates.lat},${coordinates.lng}`,
            unit: "KMPH"
          },
          timeout: 7000
        }
      );

      const flow = response.data?.flowSegmentData;
      if (!flow) throw new Error("Traffic API response missing flowSegmentData.");

      const currentSpeed = Number(flow.currentSpeed || 0);
      const freeFlowSpeed = Number(flow.freeFlowSpeed || 0);
      const currentTravelTime = Number(flow.currentTravelTime || 0);
      const freeFlowTravelTime = Number(flow.freeFlowTravelTime || 0);

      const speedCongestion =
        freeFlowSpeed > 0 ? clamp(1 - currentSpeed / freeFlowSpeed, 0, 1) : 0;
      const travelTimeRatio =
        freeFlowTravelTime > 0 ? currentTravelTime / freeFlowTravelTime : 1;
      const travelCongestion = clamp((travelTimeRatio - 1) / 2, 0, 1);

      let trafficIndex = clamp(Math.max(speedCongestion, travelCongestion) * 10, 0, 10);
      if (flow.roadClosure) trafficIndex = clamp(trafficIndex + 2, 0, 10);

      return {
        trafficIndex: Number(trafficIndex.toFixed(2)),
        source: "tomtom_flow",
        currentSpeed,
        freeFlowSpeed,
        currentTravelTime,
        freeFlowTravelTime,
        coordinateSource: coordinates.source
      };
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

async function fetchLiveConditions(city, zone = "central", location = {}) {
  const [weather, aqi, traffic, curfew, platform, social] = await Promise.all([
    fetchWeatherRealtime(city, zone),
    fetchAqiRealtime(city, zone),
    fetchTrafficRealtime(city, zone, location),
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
