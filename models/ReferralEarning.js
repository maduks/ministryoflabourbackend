// models/ReferralEarnings.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const referralEarningsSchema = new Schema({
  referrer: { type: Schema.Types.ObjectId, required: true }, // Referrer user ID
  referee: { type: Schema.Types.ObjectId, required: true }, // Referee user ID
  amountEarned: { type: Number, required: true }, // Amount earned from the referral
  transactionId: { type: Schema.Types.ObjectId, required: true }, // ID of the referee's qualifying transaction
  createdAt: { type: Date, default: Date.now }, // Date the earning was credited
});

const ReferralEarnings = mongoose.model(
  "ReferralEarnings",
  referralEarningsSchema
);

module.exports = ReferralEarnings;
