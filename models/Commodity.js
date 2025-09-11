// models/commodity.js
const mongoose = require("mongoose");

const commoditySchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  unit: String,
  tags: [String],
  origin: { type: String, enum: ["Local", "Imported"] },
  images: [String],
  location: {
    state: String,
    lga: String,
    town: String,
    market: String,
  },
  supplier: {
    companyName: String,
    nationalId: String,
  },
  // Reference to the Certification model
  certification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Certifications", // This tells Mongoose to reference the 'Certification' model
  },

  createdAt: { type: Date, default: Date.now },
});

const Commodity = mongoose.model("Commodity", commoditySchema);

module.exports = { Commodity };
