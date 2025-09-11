const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionServiceHubSchema = new Schema(
  {
    // Reference to User model
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    // Reference to Submission model
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },

    // Payment Information
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    ministry: {
      type: Schema.Types.ObjectId,
      ref: "Ministry",
      required: false,
    },

    // Payment Reference
    reference: {
      type: String,
      required: true,
      unique: true,
    },

    // Payment Status
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "cancelled"],
      default: "pending",
    },

    // Payment Method
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "wallet", "cash", "online"],
      required: true,
    },

    // Payment Gateway Reference (if applicable)
    gatewayReference: {
      type: String,
    },

    // Transaction Description
    description: {
      type: String,
      default: "Service Provider Registration Payment",
    },

    // Dates
    paymentDate: {
      type: Date,
      default: Date.now,
    },

    processedDate: {
      type: Date,
    },

    // Additional metadata
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // Error information (if payment fails)
    errorMessage: {
      type: String,
    },

    // Receipt URL (if available)
    receiptUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "transactionservicehub",
  }
);

// Indexes for better query performance
//transactionServiceHubSchema.index({ userId: 1, createdAt: -1 });
//transactionServiceHubSchema.index({ submissionId: 1 });
//transactionServiceHubSchema.index({ status: 1, createdAt: -1 });
//transactionServiceHubSchema.index({ paymentDate: -1 });

// Virtual for formatted amount
transactionServiceHubSchema.virtual("formattedAmount").get(function () {
  return `₦${this.amount.toLocaleString()}`;
});

// Method to mark transaction as successful
transactionServiceHubSchema.methods.markAsSuccessful = function () {
  this.status = "successful";
  this.processedDate = new Date();
  return this.save();
};

// Method to mark transaction as failed
transactionServiceHubSchema.methods.markAsFailed = function (errorMessage) {
  this.status = "failed";
  this.errorMessage = errorMessage;
  this.processedDate = new Date();
  return this.save();
};

// Static method to find transactions by user
transactionServiceHubSchema.statics.findByUser = function (userId) {
  return this.find({ userId }).populate("submissionId").sort({ createdAt: -1 });
};

// Static method to find transactions by submission
transactionServiceHubSchema.statics.findBySubmission = function (submissionId) {
  return this.find({ submissionId }).populate("userId").sort({ createdAt: -1 });
};

const TransactionServiceHub = mongoose.model(
  "TransactionServiceHub",
  transactionServiceHubSchema
);

module.exports = TransactionServiceHub;
