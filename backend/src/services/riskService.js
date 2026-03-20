const { RISK_BANDS } = require("../config/constants");
const { predictRisk } = require("./aiService");
const {
  fetchWeatherForecast,
  fetchAqiRealtime,
  fetchTrafficRealtime,
  fetchSocialStatus
} = require("./externalDataService");
const Event = require("../models/Event");

function mapRiskToBand(riskScore) {
  if (riskScore < RISK_BANDS.LOW.max) return RISK_BANDS.LOW;
  if (riskScore < RISK_BANDS.MEDIUM.max) return RISK_BANDS.MEDIUM;
  return RISK_BANDS.HIGH;
}

async function getHistoricalDisruptionCount(city, zone) {
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return Event.countDocuments({ city, zone, timestamp: { $gte: start } });
}

async function calculateRiskForUser(user) {
  const [forecast, aqiRealtime, trafficRealtime, socialRealtime, historicalDisruptions] =
    await Promise.all([
      fetchWeatherForecast(user.city, user.zone),
      fetchAqiRealtime(user.city, user.zone),
      fetchTrafficRealtime(user.city, user.zone, user.lastKnownLocation || {}),
      fetchSocialStatus(user.city, user.zone),
      getHistoricalDisruptionCount(user.city, user.zone)
    ]);

  const personaRiskFactor = user.platform === "Swiggy" ? 1.0 : 1.05;
  const socialRiskScore =
    (socialRealtime.localStrike ? 0.5 : 0) + (socialRealtime.zoneClosure ? 0.5 : 0);

  const aiResponse = await predictRisk({
    forecastRainfall: forecast.forecastRainfall || 0,
    forecastTemperature: forecast.forecastTemperature || 0,
    aqi: aqiRealtime.aqi || 0,
    trafficIndex: trafficRealtime.trafficIndex || 0,
    socialRiskScore,
    historicalDisruptions,
    personaRiskFactor
  });

  const band = mapRiskToBand(aiResponse.riskScore);
  return {
    riskScore: aiResponse.riskScore,
    riskLevel: aiResponse.riskLevel || band.label,
    premium: band.premium,
    pricingSource: "forecast",
    context: {
      forecastRainfall: forecast.forecastRainfall || 0,
      forecastTemperature: forecast.forecastTemperature || 0,
      aqi: aqiRealtime.aqi || 0,
      trafficIndex: trafficRealtime.trafficIndex || 0,
      socialRiskScore,
      personaRiskFactor,
      historicalDisruptions
    }
  };
}

module.exports = { calculateRiskForUser, mapRiskToBand };
