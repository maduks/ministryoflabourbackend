const joi = require("joi");
const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema({
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  certHash: { type: String, required: false }, // 👈 Added for QR code verification
  certificationType: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  profession: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  specialization: {
    type: String,
  },
  category: {
    type: String,
  },
  validityPeriod: {
    type: Number,
    required: true,
  },
  licenseActive: {
    type: Boolean,
  },
  certificateReferenceId: {
    type: String,
    required: true,
    trim: true,
  },
  paymentType: {
    type: String,
    enum: ["new", "renewal"],
  },
  ministryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ministry",
  },
  amountPaid: {
    type: String,
  },
  Reference: {
    type: String,
  },
  certificationAddressedTo: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  issuedBy: {
    type: String,
    default: "BDIC",
    lowercase: true,
    trim: true,
  },
  issueDate: {
    type: Date,
    required: true,
    type: Date,
    default: Date.now,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  approvedBy: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
  },
  auditTrail: [
    {
      action: String,
      by: String,
      date: { type: Date, default: Date.now },
      remarks: String,
    },
  ],
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Templates",
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "pending", "expired"],
    minlength: 3, // Minimum length for the role
  },
  notes: {
    type: String,
  },
});

const Certification = mongoose.model("Certifications", certificationSchema);
module.exports = { Certification };
