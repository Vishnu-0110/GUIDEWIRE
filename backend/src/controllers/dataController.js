const asyncHandler = require("../utils/asyncHandler");
const {
  fetchWeatherRealtime,
  fetchAqiRealtime,
  fetchTrafficRealtime,
  fetchPlatformStatus,
  fetchSocialStatus
} = require("../services/externalDataService");

const getWeatherByCity = asyncHandler(async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ message: "Query param city is required" });
  }
  const zone = req.query.zone || "central";
  const weather = await fetchWeatherRealtime(city, zone);
  res.json({
    city,
    zone,
    rainfall: weather.rainfall || 0,
    temperature: weather.temperature || null
  });
});

const getAqiByCity = asyncHandler(async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ message: "Query param city is required" });
  }
  const zone = req.query.zone || "central";
  const aqi = await fetchAqiRealtime(city, zone);
  res.json({
    city,
    zone,
    aqi: aqi.aqi || null
  });
});

const getTrafficByCity = asyncHandler(async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ message: "Query param city is required" });
  }
  const zone = req.query.zone || "central";
  const traffic = await fetchTrafficRealtime(city, zone);
  res.json({
    city,
    zone,
    trafficIndex: traffic.trafficIndex || 0
  });
});

const getPlatformStatusByCity = asyncHandler(async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ message: "Query param city is required" });
  }
  const zone = req.query.zone || "central";
  const platform = await fetchPlatformStatus(city, zone);
  res.json({
    city,
    zone,
    platformOutage: Boolean(platform.platformOutage)
  });
});

const getSocialStatusByCity = asyncHandler(async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ message: "Query param city is required" });
  }
  const zone = req.query.zone || "central";
  const social = await fetchSocialStatus(city, zone);
  res.json({
    city,
    zone,
    localStrike: Boolean(social.localStrike),
    zoneClosure: Boolean(social.zoneClosure)
  });
});

module.exports = {
  getWeatherByCity,
  getAqiByCity,
  getTrafficByCity,
  getPlatformStatusByCity,
  getSocialStatusByCity
};
