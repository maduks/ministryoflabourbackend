const Joi = require("joi");
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    serviceName: { type: String, required: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    contact: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    featuredImage: { type: [String] },
    description: { type: String },
    location: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
    },
    yearsOfExperience: { type: String, required: false },
    emergencyServices: { type: String, required: false },
    responseTime: { type: String, required: false },
    price: { type: String },
    serviceCategory: { type: String },
    reviewCount: { type: Number, default: 0 },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          required: false,
        },
        rating: { type: Number, required: false },
        comment: { type: String, required: false },
      },
    ],
    featured: { type: Boolean, default: false },
    featured_until: { type: Date },
    isAvailable: { type: Boolean, default: true },
    socialLinks: {
      website: { type: String },
      facebook: { type: String },
      instagram: { type: String },
      whatsapp: { type: String },
      telegram: { type: String },
    },
    isVerified: { type: Boolean, default: false },
    documents: [{ type: String }],
    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { strict: false }
);

const Service = mongoose.model("Services", serviceSchema);
module.exports = { Service };
