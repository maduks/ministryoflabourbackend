const Joi = require("joi");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    // Reference to the Certification model
    certification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certifications", // This tells Mongoose to reference the 'Certification' model
    },
    prodName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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
    location: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
    },
    contact: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    productImages: {
      type: [String],
      required: true,
    },
    price: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    origin: { type: String, enum: ["Local", "Imported"] },
    tags: [String],
    certificationStatus: {
      type: String,
      required: true,
      trim: true,
      //enum: ["Not Certified", "Certified"],
    },
    legalDocument: {
      type: [String],
      required: false,
    },
    featured: {
      type: Boolean,
      required: false,
      default: false,
    },
    featured_until: { type: Date },
    expiryDate: {
      type: Date,
      default: Date.now, // Sets default to current date (like createdAt)
      required: false,
      trim: true, // Minimum length for the role
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

// Pre-save middleware to add 2 years to expiryDate
productSchema.pre("save", function (next) {
  // Add 2 years to expiryDate
  if (this.expiryDate) {
    this.expiryDate.setFullYear(this.expiryDate.getFullYear() + 2);
  }

  // Continue with saving the document
  next();
});

const Product = mongoose.model("Products", productSchema);
module.exports = { Product };
