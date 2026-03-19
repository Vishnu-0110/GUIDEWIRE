const Policy = require("../models/Policy");
const Event = require("../models/Event");
const {
  TRIGGER_THRESHOLDS,
  SEVERITY_BANDS,
  EVENT_WINDOW_HOURS
} = require("../config/constants");
const { fetchLiveConditions } = require("./externalDataService");
const { enqueuePayoutJob } = require("./queueService");
const { getActiveAreas } = require("./policyService");

function getSeverity(eventType, value) {
  const bands = SEVERITY_BANDS[eventType] || [];
  const matched = bands.find((band) => value >= band.min && value < band.max);
  const percent = matched?.percent || 0;
  const label =
    percent >= 1 ? "SEVERE" : percent >= 0.7 ? "HIGH" : percent >= 0.4 ? "MEDIUM" : "LOW";
  return { percent, label };
}

function getEventWindowKey(date = new Date()) {
  const windowStart = new Date(date);
  const hour = windowStart.getUTCHours();
  const snapped = hour - (hour % EVENT_WINDOW_HOURS);
  windowStart.setUTCHours(snapped, 0, 0, 0);
  return windowStart.toISOString().slice(0, 13);
}

function evaluateConditions(conditions) {
  const events = [];

  if (conditions.rainfall > TRIGGER_THRESHOLDS.rainfall) {
    events.push({
      eventType: "rain",
      value: conditions.rainfall,
      threshold: TRIGGER_THRESHOLDS.rainfall
    });
  }
  if (conditions.temperature > TRIGGER_THRESHOLDS.temperature) {
    events.push({
      eventType: "heat",
      value: conditions.temperature,
      threshold: TRIGGER_THRESHOLDS.temperature
    });
  }
  if (conditions.aqi > TRIGGER_THRESHOLDS.aqi) {
    events.push({
      eventType: "aqi",
      value: conditions.aqi,
      threshold: TRIGGER_THRESHOLDS.aqi
    });
  }
  if (conditions.trafficIndex > TRIGGER_THRESHOLDS.trafficIndex) {
    events.push({
      eventType: "traffic",
      value: conditions.trafficIndex,
      threshold: TRIGGER_THRESHOLDS.trafficIndex
    });
  }
  if (conditions.curfew) {
    events.push({ eventType: "curfew", value: 1, threshold: 1 });
  }
  if (conditions.platformOutage) {
    events.push({ eventType: "platform_outage", value: 1, threshold: 1 });
  }
  if (conditions.localStrike) {
    events.push({ eventType: "local_strike", value: 1, threshold: 1 });
  }
  if (conditions.zoneClosure) {
    events.push({ eventType: "zone_closure", value: 1, threshold: 1 });
  }

  return events;
}

async function createOrGetEvent({ city, zone, disruption }) {
  const windowKey = getEventWindowKey(new Date());
  const eventKey = `${city}_${zone}_${disruption.eventType}_${windowKey}`;

  let event = await Event.findOne({ eventKey });
  if (event) return event;

  const severity = getSeverity(disruption.eventType, disruption.value);
  if (severity.percent === 0) return null;

  const demandDropPercent = Math.round(severity.percent * 35);

  event = await Event.create({
    eventKey,
    city,
    zone,
    eventType: disruption.eventType,
    source: "realtime",
    triggerValue: disruption.value,
    threshold: disruption.threshold,
    severityPercent: severity.percent,
    severityLabel: severity.label,
    metadata: { demandDropPercent }
  });
  return event;
}

async function runAreaTrigger(city, zone) {
  const live = await fetchLiveConditions(city, zone);

  if (live.missingData) {
    return { city, zone, skipped: true, reason: "No data available from APIs/cache." };
  }

  const disruptions = evaluateConditions(live);
  if (!disruptions.length) {
    return { city, zone, triggered: false, live };
  }

  const activePolicies = await Policy.find({
    city,
    zone,
    status: "active",
    endDate: { $gte: new Date() }
  }).select("_id userId");

  const results = [];
  for (const disruption of disruptions) {
    const event = await createOrGetEvent({ city, zone, disruption });
    if (!event) continue;

    for (const policy of activePolicies) {
      await enqueuePayoutJob({ eventId: event._id.toString(), userId: policy.userId.toString() });
    }

    results.push({ eventId: event._id, eventType: event.eventType, users: activePolicies.length });
  }

  return { city, zone, triggered: true, live, results };
}

async function runGlobalTriggerCycle() {
  const activeAreas = await getActiveAreas();
  const outputs = [];
  for (const area of activeAreas) {
    const city = area._id.city;
    const zone = area._id.zone;
    const result = await runAreaTrigger(city, zone);
    outputs.push(result);
  }
  return outputs;
}

module.exports = { runAreaTrigger, runGlobalTriggerCycle, evaluateConditions };
