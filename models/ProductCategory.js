// models/ServiceCategory.js
const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  subCategories: [Object],
  // ministry: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Ministry",
  //   required: true,
  // },
  createdAt: { type: Date, default: Date.now },
});

const ProductCategory = mongoose.model(
  "ProductCategories",
  serviceCategorySchema
);
module.exports = { ProductCategory };
