const mongoose = require("mongoose");

const ClaimSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
      index: true
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true
    },
    payout: { type: Number, required: true },
    lostHours: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["paid", "rejected", "flagged"],
      required: true
    },
    coverageScope: {
      type: String,
      enum: ["INCOME_LOSS_ONLY"],
      default: "INCOME_LOSS_ONLY",
      immutable: true
    },
    fraudFlags: [{ type: String }],
    paymentReference: { type: String },
    triggerSnapshot: { type: Object, required: true }
  },
  { timestamps: true }
);

ClaimSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("Claim", ClaimSchema);
