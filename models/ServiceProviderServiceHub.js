const mongoose = require("mongoose");
const { Schema } = mongoose;

const serviceProviderSchema = new Schema(
  {
    // Reference to User model for basic info (auth, personal details)
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    kyc: {
      type: Schema.Types.ObjectId,
      ref: "KYCDocument",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    // Professional Information
    profession: {
      type: String,
      required: true,
    },

    phoneNumber: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    specialization: String, // e.g., "Auto Mechanic", "Pastry Chef"
    skills: [String],
    yearsOfExperience: Number,
    serviceDescription: String,

    // Business Information (optional)
    businessName: String,
    businessRegistrationNumber: String,

    // Service Details
    serviceAreas: [String], // Areas they serve
    availability: {
      type: String,
      // enum: ["Available", "Unavailable", "On Leave"],
      default: "Available",
    },
    operatingHours: {
      weekdays: { from: String, to: String },
      weekends: { from: String, to: String },
    },

    // Verification
    licenses: [
      {
        name: String,
        number: String,
        authority: String,
        issued: Date,
        expires: Date,
        document: String, // URL to uploaded file
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Ministry Association
    ministry: {
      type: Schema.Types.ObjectId,
      ref: "Ministry",
    },
    educationLevels: {
      type: String,
    },

    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    assignmentDate: {
      type: Date,
      default: Date.now,
    },
    approvalstatus: {
      type: String,
      default: "pending",
    },
    // Work Portfolio
    portfolio: [
      {
        title: String,
        description: String,
        images: [String],
        date: Date,
      },
    ],

    // Ratings
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      note: {
        type: String,
      },
    },

    // Status
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    lastUpdated: Date,
  },
  { timestamps: true }
);

// Indexes
serviceProviderSchema.index({ profession: 1, specialization: 1 });
serviceProviderSchema.index({ ministry: 1, status: 1 });
serviceProviderSchema.index({ "rating.average": -1 });

// Update lastUpdated before saving
serviceProviderSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

const ServiceProvider = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema
);

module.exports = ServiceProvider;
