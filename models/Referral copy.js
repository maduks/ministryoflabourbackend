// models/Referral.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const referralSchema = new Schema({
  // ID OF WHO REFERED THIS USER
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  // List of users that this user has referred
  referredUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  earnings: { type: Number, default: 0 }, // Total earnings from this referral
  status: {
    type: String,
    enum: ["recurring", "complete"],
    default: "recurring",
  }, // Status of referral
  createdAt: { type: Date, default: Date.now }, // Date of referral
});
const Referral = mongoose.model("Referral", referralSchema);
module.exports = Referral;
