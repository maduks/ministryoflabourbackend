// models/AuditLog.js
const mongoose = require("mongoose");

// const auditLogSchema = new mongoose.Schema({
//   entityType: { type: String, required: true }, // "Property", "ServiceProvider", etc.
//   entityId: { type: mongoose.Schema.Types.ObjectId },
//   performedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Users",
//     required: true,
//   },
//   ministry: { type: mongoose.Schema.Types.ObjectId, ref: "Ministry" },
//   createdAt: { type: Date, default: Date.now },
// });

const auditLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", // Reference to your User model
      required: true,
    },
    action: {
      type: String,
      required: true,
      // enum: [
      //   "create",
      //   "read",
      //   "update",
      //   "delete",
      //   "login",
      //   "logout",
      //   "approve",
      //   "reject",
      // ], // Customize as needed
    },
    resource: {
      name: { type: String },
      id: { type: mongoose.Schema.Types.ObjectId },
    },
    status: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Flexible field for additional info
      default: null,
    },
    ipAddress: {
      // Bonus: often useful in audit logs
      type: String,
      default: null,
    },
    system: {
      type: String,
    },
  },
  {
    timestamps: false, // We're managing timestamp manually
  },
  { strictPopulate: false }
);

// Add indexes for common query patterns
auditLogSchema.index({ resource: 1, action: 1 });
auditLogSchema.index({ user: 1 });

//const AuditLog = mongoose.model("AuditLog", auditLogSchema);
const AuditLogger = mongoose.model(
  "AuditLogsIntegratedService",
  auditLogSchema
);
module.exports = { AuditLogger };
