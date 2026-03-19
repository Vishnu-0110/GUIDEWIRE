const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    city: { type: String, required: true, index: true },
    zone: { type: String, required: true, index: true },
    premium: { type: Number, required: true },
    coverage: { type: Number, required: true },
    riskScore: { type: Number, required: true },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    planName: { type: String, required: true },
    premiumCycle: {
      type: String,
      enum: ["WEEKLY"],
      default: "WEEKLY",
      immutable: true
    },
    coverageScope: {
      type: String,
      enum: ["INCOME_LOSS_ONLY"],
      default: "INCOME_LOSS_ONLY",
      immutable: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    paymentReference: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Policy", PolicySchema);
