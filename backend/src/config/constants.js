const RISK_BANDS = {
  LOW: { min: 0, max: 0.33, premium: 20, label: "LOW" },
  MEDIUM: { min: 0.33, max: 0.66, premium: 40, label: "MEDIUM" },
  HIGH: { min: 0.66, max: 1, premium: 70, label: "HIGH" }
};

const PLAN_OPTIONS = [
  { premium: 30, coverage: 800, name: "Starter Shield" },
  { premium: 50, coverage: 1200, name: "Smart Shield" },
  { premium: 70, coverage: 1500, name: "Pro Shield" }
];

const TRIGGER_THRESHOLDS = {
  rainfall: 50,
  temperature: 42,
  aqi: 300,
  trafficIndex: 8
};

const SEVERITY_BANDS = {
  rain: [
    { min: 50, max: 70, percent: 0.3 },
    { min: 70, max: 100, percent: 0.6 },
    { min: 100, max: Number.MAX_SAFE_INTEGER, percent: 1.0 }
  ],
  aqi: [
    { min: 200, max: 300, percent: 0.4 },
    { min: 300, max: 400, percent: 0.7 },
    { min: 400, max: Number.MAX_SAFE_INTEGER, percent: 1.0 }
  ],
  heat: [
    { min: 42, max: 45, percent: 0.4 },
    { min: 45, max: 48, percent: 0.7 },
    { min: 48, max: Number.MAX_SAFE_INTEGER, percent: 1.0 }
  ],
  traffic: [
    { min: 8, max: 9, percent: 0.3 },
    { min: 9, max: 9.5, percent: 0.6 },
    { min: 9.5, max: Number.MAX_SAFE_INTEGER, percent: 1.0 }
  ],
  local_strike: [{ min: 1, max: 2, percent: 1.0 }],
  zone_closure: [{ min: 1, max: 2, percent: 1.0 }],
  curfew: [{ min: 1, max: 2, percent: 1.0 }],
  platform_outage: [{ min: 1, max: 2, percent: 1.0 }]
};

const EVENT_WINDOW_HOURS = 4;

module.exports = {
  RISK_BANDS,
  PLAN_OPTIONS,
  TRIGGER_THRESHOLDS,
  SEVERITY_BANDS,
  EVENT_WINDOW_HOURS
};
