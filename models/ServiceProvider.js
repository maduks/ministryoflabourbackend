// models/ServiceProvider.js
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  rate: { type: Number },
  availability: { type: Boolean, default: true },
});

const serviceProviderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  businessName: { type: String, required: true },
  services: [serviceSchema],
  subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" }],
  ministry: { type: mongoose.Schema.Types.ObjectId, ref: "Ministry" },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const ServiceProvider = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema
);
module.exports = { ServiceProvider };
