const axios = require("axios");
const env = require("../config/env");

async function predictRisk(input) {
  try {
    const response = await axios.post(`${env.aiServiceUrl}/risk/predict`, input, {
      timeout: 7000
    });
    return response.data;
  } catch (error) {
    // Fallback heuristic if AI service is unavailable.
    const score =
      Math.min((input.forecastRainfall || 0) / 120, 1) * 0.4 +
      Math.min((input.forecastTemperature || 0) / 50, 1) * 0.25 +
      Math.min((input.aqi || 0) / 500, 1) * 0.15 +
      Math.min((input.trafficIndex || 0) / 10, 1) * 0.1 +
      Math.min((input.socialRiskScore || 0) / 1, 1) * 0.05 +
      Math.min((input.historicalDisruptions || 0) / 10, 1) * 0.05;

    const personaAdjusted = score * (input.personaRiskFactor || 1);

    const riskScore = Number(Math.min(1, personaAdjusted).toFixed(2));
    const riskLevel = riskScore >= 0.66 ? "HIGH" : riskScore >= 0.33 ? "MEDIUM" : "LOW";

    return { riskScore, riskLevel, premiumRecommendation: null, fallbackUsed: true };
  }
}

async function detectFraud(input) {
  try {
    const response = await axios.post(`${env.aiServiceUrl}/fraud/detect`, input, {
      timeout: 7000
    });
    return response.data;
  } catch (error) {
    return {
      isAnomaly: false,
      anomalyScore: 0,
      reason: "ai_service_unavailable_fallback"
    };
  }
}

module.exports = { predictRisk, detectFraud };
