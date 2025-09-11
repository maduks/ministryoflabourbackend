// models/PropertyCategory.js
const mongoose = require("mongoose");
const serviceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  subCategories: [Object],
  createdAt: { type: Date, default: Date.now },
});
const PropertyCategory = mongoose.model(
  "PropertyCategories",
  serviceCategorySchema
);
module.exports = { PropertyCategory };
