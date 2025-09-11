// models/BusinessPremise.js
const mongoose = require("mongoose");

const businessPremiseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["commercial", "industrial", "residential", "mixed_use"],
    required: true,
  },
  location: {
    address: String,
    coordinates: { type: [Number], index: "2dsphere" }, // [long, lat]
  },
  ministry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ministry",
    required: true,
  },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
  contact: {
    ownerName: String,
    phone: String,
    email: String,
  },
  registrationDate: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: false },
});

const BusinessPremise = mongoose.model(
  "BusinessPremise",
  businessPremiseSchema
);
module.exports = { BusinessPremise };
