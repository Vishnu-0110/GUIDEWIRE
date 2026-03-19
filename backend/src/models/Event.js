const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    eventKey: { type: String, required: true, unique: true, index: true },
    city: { type: String, required: true, index: true },
    zone: { type: String, required: true, index: true },
    eventType: {
      type: String,
      enum: [
        "rain",
        "aqi",
        "heat",
        "traffic",
        "curfew",
        "platform_outage",
        "local_strike",
        "zone_closure"
      ],
      required: true
    },
    source: { type: String, enum: ["realtime", "forecast"], default: "realtime" },
    triggerValue: { type: Number, required: true },
    threshold: { type: Number, required: true },
    severityPercent: { type: Number, required: true },
    severityLabel: { type: String, required: true },
    metadata: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
