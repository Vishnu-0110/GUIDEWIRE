const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
    city: { type: String },
    zone: { type: String }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, lowercase: true, sparse: true, index: true },
    passwordHash: { type: String },
    phoneEncrypted: { type: String, sparse: true },
    phoneHash: { type: String, sparse: true, index: true, unique: true },
    city: { type: String, required: true, index: true },
    zone: { type: String, default: "central", index: true },
    platform: {
      type: String,
      enum: ["Swiggy", "Zomato"],
      required: true
    },
    personaCategory: {
      type: String,
      enum: ["FOOD_DELIVERY"],
      default: "FOOD_DELIVERY",
      immutable: true
    },
    dailyIncome: { type: Number, required: true },
    workingHours: { type: Number, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isOnline: { type: Boolean, default: false },
    onlineSince: { type: Date },
    lastKnownLocation: LocationSchema,
    lastActivityAt: { type: Date },
    otpCode: { type: String },
    otpExpiresAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
