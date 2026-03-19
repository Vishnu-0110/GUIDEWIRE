const mongoose = require("mongoose");

const DataCacheSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, index: true },
    zone: { type: String, required: true, index: true },
    sourceType: {
      type: String,
      enum: [
        "weather_realtime",
        "weather_forecast",
        "aqi_realtime",
        "traffic_realtime",
        "social_realtime",
        "curfew",
        "platform_status"
      ],
      required: true
    },
    payload: { type: Object, required: true },
    fetchedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

DataCacheSchema.index({ city: 1, zone: 1, sourceType: 1 }, { unique: true });

module.exports = mongoose.model("DataCache", DataCacheSchema);
