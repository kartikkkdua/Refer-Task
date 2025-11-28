const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    referralCode: { type: String, required: true, unique: true },
    coins: { type: Number, default: 0 },
    appliedReferral: { type: Boolean, default: false },
    referredBy: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    company: { type: String, default: "" },
    phone: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
    avatar: { type: String, default: "" },
    totalEarnings: { type: Number, default: 0 },
    referralCount: { type: Number, default: 0 },
    lastLogin: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
