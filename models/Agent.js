// models/Agent.js
const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  ministry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ministry",
    required: true,
  },
  state: { type: String, required: false },
  submissions: { type: Number, required: true, default: 0 },
  approvedsubmissions: { type: Number, required: true, default: 0 },
  assignedLga: { type: String },
  assignedwards: { type: String },
  // assignedAreas: [String], // e.g., ["District A", "District B"]
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Agent = mongoose.model("Agent", agentSchema);
module.exports = { Agent };
