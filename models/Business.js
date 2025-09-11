const joi = require("joi");
const mongoose = require("mongoose");

const businessSCHEMA = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    lga: String,
    town: String,
    businessAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    legalname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
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

    // Reference to the Certification model
    certification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certifications", // This tells Mongoose to reference the 'Certification' model
    },
    location: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    businessType: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    legalDocument: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    employeeCount: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    featured: {
      type: Boolean,
      required: false,
      default: false,
    },
    featured_until: { type: Date },
    openingTime: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    closingTime: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },

    dateOfIncorporation: {
      type: Date,
      required: true,
      trim: true,
      lowercase: true,
    },
    businessNumber: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: null,
    },
    businessPhoneNumber: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: null,
    },
    businessEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: null,
    },
    businessDescription: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    businessProfilePicture: {
      type: String,
      required: true,
      trim: true,
      default: null,
    },
    businessWebsite: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: null,
    },
    businessLogo: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    businessFacebook: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: null,
    },
    businessTwitter: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: null,
    },
    businessInstagram: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: null,
    },
    businessLinkedIn: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: null,
    },
    businessTaxId: {
      type: String,
      required: false,
      default: null,
      trim: true,
      lowercase: true,
    },
    registrationStatus: {
      type: String,
      required: true,
      trim: true,
      enum: ["registered", "not-registered", "pending"],
    },
    services: [String],
    tags: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  { strict: false }
);

const Business = mongoose.model("Businesses", businessSCHEMA);
module.exports = { Business };
