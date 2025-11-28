const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["referral_earned", "referral_applied", "bonus", "withdrawal"], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
