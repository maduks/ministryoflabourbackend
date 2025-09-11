const mongoose = require("mongoose");

const PropertyServiceHubSchema = new mongoose.Schema(
  {
    propertyName: { type: String, required: true },
    registrationDate: { type: Date, required: true },
    status: { type: String, default: "Active" },
    address: {
      street: { type: String },
      city: { type: String },
      district: { type: String },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
    state: { type: String },
    localGovernmentId: { type: String },
    ward: { type: String },
    propertyType: { type: String },
    area: { type: String },
    constructionYear: { type: String },
    floors: { type: Number },
    residentialDetails: {
      bedrooms: { type: String },
      bathrooms: { type: String },
      kitchens: { type: Number },
      parkingSpaces: { type: String },
    },
    isResidential: { type: Boolean, default: false },
    isBusinessPremise: { type: Boolean, default: false },
    businessDetails: {
      businessName: { type: String },
      registrationNumber: { type: String },
      businessType: { type: String },
      natureOfBusiness: { type: String },
      businessStructure: { type: String },
      employees: { type: String },
      operatingHours: {
        opening: { type: String },
        closing: { type: String },
      },
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    assignmentDate: {
      type: Date,
      default: Date.now,
    },
    owners: [
      {
        ownerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          required: false,
        },
        ownershipType: { type: String },
        ownershipPercentage: { type: String },
        acquisitionDate: { type: String },
      },
    ],
    ministryLinks: [
      {
        ministry: { type: String },
        referenceId: { type: String },
      },
    ],
    amenities: [
      {
        name: { type: String },
        quantity: { type: String },
      },
    ],
    approvalstatus: {
      type: String,
      default: "pending",
    },
    uploads: {
      frontView: { type: String },
      backView: { type: String },
      sideView: { type: String },
      ownershipDoc: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PropertyServiceHub", PropertyServiceHubSchema);
