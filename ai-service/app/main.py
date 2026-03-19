from __future__ import annotations

from typing import Literal

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LogisticRegression


class RiskInput(BaseModel):
    forecastRainfall: float = Field(ge=0)
    forecastTemperature: float = Field(ge=0)
    aqi: float = Field(ge=0)
    trafficIndex: float = Field(ge=0)
    socialRiskScore: float = Field(ge=0, le=1)
    historicalDisruptions: float = Field(ge=0)
    personaRiskFactor: float = Field(ge=0.8, le=1.5)


class FraudInput(BaseModel):
    claimFrequency: float = Field(ge=0)
    locationDistance: float = Field(ge=0)
    activityScore: float = Field(ge=0)
    onlineDurationMinutes: float = Field(ge=0)


app = FastAPI(title="GigShield AI Service", version="1.0.0")


def build_risk_model() -> LogisticRegression:
    rng = np.random.default_rng(42)
    n = 1000
    rainfall = rng.uniform(0, 140, n)
    temperature = rng.uniform(20, 50, n)
    aqi = rng.uniform(50, 500, n)
    traffic = rng.uniform(0, 10, n)
    social_risk = rng.uniform(0, 1, n)
    disruptions = rng.integers(0, 12, n)
    persona_factor = rng.uniform(0.9, 1.15, n)

    score = (
        0.3 * (rainfall / 140)
        + 0.2 * (temperature / 50)
        + 0.2 * (aqi / 500)
        + 0.1 * (traffic / 10)
        + 0.08 * social_risk
        + 0.07 * (disruptions / 12)
    )
    score = score * persona_factor
    y = (score > 0.55).astype(int)
    x = np.column_stack(
        [rainfall, temperature, aqi, traffic, social_risk, disruptions, persona_factor]
    )

    model = LogisticRegression(max_iter=1000)
    model.fit(x, y)
    return model


def build_fraud_model() -> IsolationForest:
    rng = np.random.default_rng(24)
    n = 1500
    claim_frequency = rng.poisson(0.8, n)
    location_distance = rng.normal(0.8, 0.35, n).clip(0, None)
    activity_score = rng.normal(8, 3, n).clip(0, None)
    online_minutes = rng.normal(220, 90, n).clip(10, None)
    x = np.column_stack(
        [claim_frequency, location_distance, activity_score, online_minutes]
    )
    model = IsolationForest(contamination=0.07, random_state=24)
    model.fit(x)
    return model


risk_model = build_risk_model()
fraud_model = build_fraud_model()


def map_risk(probability: float) -> tuple[Literal["LOW", "MEDIUM", "HIGH"], int]:
    if probability < 0.33:
        return "LOW", 20
    if probability < 0.66:
        return "MEDIUM", 40
    return "HIGH", 70


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "ai-service"}


@app.post("/risk/predict")
def predict_risk(payload: RiskInput) -> dict:
    x = np.array(
        [
            [
                payload.forecastRainfall,
                payload.forecastTemperature,
                payload.aqi,
                payload.trafficIndex,
                payload.socialRiskScore,
                payload.historicalDisruptions,
                payload.personaRiskFactor,
            ]
        ]
    )
    probability = float(risk_model.predict_proba(x)[0][1])
    risk_level, premium = map_risk(probability)
    return {
        "riskScore": round(probability, 2),
        "riskLevel": risk_level,
        "premiumRecommendation": premium,
    }


@app.post("/fraud/detect")
def detect_fraud(payload: FraudInput) -> dict:
    x = np.array(
        [
            [
                payload.claimFrequency,
                payload.locationDistance,
                payload.activityScore,
                payload.onlineDurationMinutes,
            ]
        ]
    )
    prediction = int(fraud_model.predict(x)[0])  # -1 anomaly, 1 normal
    score = float(fraud_model.score_samples(x)[0])
    is_anomaly = prediction == -1
    return {
        "isAnomaly": is_anomaly,
        "anomalyScore": round(abs(score), 4),
        "reason": "Anomaly detected by IsolationForest"
        if is_anomaly
        else "Normal behavior pattern",
    }
