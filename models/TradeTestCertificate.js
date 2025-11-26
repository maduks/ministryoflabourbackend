const mongoose = require("mongoose");

const tradeTestCertificateSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TradeTest",
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestSession",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    testName: {
      type: String,
      required: true,
    },
    testCode: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    percentageScore: {
      type: Number,
      required: true,
    },
    issuedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null, // null means no expiry
    },
    ministryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ministry",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "expired", "revoked"],
      default: "active",
    },
    certificateHash: {
      type: String,
      trim: true, // For QR code verification
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

// Update the updatedAt field before saving
tradeTestCertificateSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Generate certificate number if not provided
tradeTestCertificateSchema.pre("save", async function (next) {
  if (!this.certificateNumber && this.isNew) {
    const prefix = "TT-CERT";
    const timestamp = Date.now().toString().slice(-8);
    const randomSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.certificateNumber = `${prefix}-${timestamp}-${randomSuffix}`;

    // Ensure uniqueness using this.constructor (the model)
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const existing = await this.constructor.findOne({
        certificateNumber: this.certificateNumber,
      });
      if (!existing) {
        isUnique = true;
      } else {
        const newRandomSuffix = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0");
        this.certificateNumber = `${prefix}-${timestamp}-${newRandomSuffix}`;
        attempts++;
      }
    }
  }
  next();
});

// Index for efficient queries
tradeTestCertificateSchema.index({ userId: 1, status: 1 });
tradeTestCertificateSchema.index({ certificateNumber: 1 });
tradeTestCertificateSchema.index({ testId: 1 });

const TradeTestCertificate = mongoose.model(
  "TradeTestCertificate",
  tradeTestCertificateSchema
);
module.exports = { TradeTestCertificate };
