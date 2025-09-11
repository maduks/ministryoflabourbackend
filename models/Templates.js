const mongoose = require("mongoose");
const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [
    {
      name: String,
      description: String,
    },
  ],
  templateType: {
    type: String,
    enum: ["all-artisans", "all-service-providers"],
    required: true,
  },
  cost: { type: Number, required: true },
  maxDuration: { type: Number, required: true },
  minDuration: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Template = mongoose.model("Templates", templateSchema);
module.exports = Template;
