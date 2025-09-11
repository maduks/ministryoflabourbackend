const mongoose = require("mongoose");
const featuresSchema = new mongoose.Schema({
  name: { type: String },
  quantity: { type: String },
  condition: { type: String },
});

const AuditLog = require("./AuditLog");

const propertycollectionSchema = new mongoose.Schema(
  {
    // Basic Information
    propertyType: {
      type: String,
      enum: ["house", "land", "vehicle", "others", "institutions", "petroleum"],
      required: true,
    },
    propertyId: {
      type: String,
    },
    institutionType: {
      type: String,
      required: function () {
        return this.propertyType === "institutions";
      },
    },
    propertyName: { type: String, required: true },
    description: { type: String },
    acquisitionDate: { type: Date, required: true },
    estimatedValue: { type: Number, required: true },
    registrationNumber: { type: String, unique: true },

    // Property Specific Fields
    buildingType: {
      type: String,
      //enum: ["residential", "commercial", "industrial", "mixed"],
    },
    floorCount: { type: Number },
    totalArea: { type: Number },
    yearBuilt: { type: Number },
    currentBuildingUse: { type: String },

    buildingCondition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
    },
    buildingFeatures: [featuresSchema],
    landType: {
      type: String,
      // enum: ["residential", "commercial", "agricultural", "industrial"],
    },
    landSize: { type: Number },
    landCondition: {
      type: String,
    },
    landUse: { type: String },

    vehicleType: {
      type: String,
    },
    makeModel: { type: String },
    year: { type: Number },
    vin: { type: String },
    engineNumber: { type: String },
    vehicleCondition: {
      type: String,
    },

    // Location Details
    state: { type: String, required: true },
    lga: {
      type: String,
    },
    address: { type: String, required: true },
    coordinates: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number] }, // [longitude, latitude]
    },

    // Documentation
    propertyDeed: [{ type: String }], // Path to file
    propertyImages: [{ type: String }],
    additionalDocuments: [{ type: String }],

    // Metadata
    notes: { type: String },
    confirmed: { type: Boolean, default: false },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: false,
    },
    qrCode: { type: String },
    status: {
      type: String,
      enum: ["active", "under-review", "disputed"],
      default: "active",
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { strict: false }
);

// Add 2dsphere index for geospatial queries
//propertySchema.index({ coordinates: "2dsphere" });

// Pre-save hook to generate registration number
propertycollectionSchema.pre(
  "save",
  async function (next) {
    if (!this.registrationNumber) {
      const count = await this.constructor.countDocuments();
      this.registrationNumber = `GOV/${this.state.toUpperCase()}/${new Date().getFullYear()}/${(
        count + 1
      )
        .toString()
        .padStart(4, "0")}`;
    }
    next();
  },
  { strict: false }
);

// ===== AUDIT LOGGING MIDDLEWARE =====
propertycollectionSchema.post("save", function (doc, next) {
  console.log(doc);
  AuditLog.create({
    action: "CREATE",
    entity: doc.propertyType,
    entityId: doc._id,
    userId: doc.registeredBy || "system",
    changes: doc.toObject(),
    timestamp: new Date(),
  }).catch((err) => console.error("Audit log error:", err));

  next();
});

propertycollectionSchema.post("remove", function (doc, next) {
  AuditLog.create({
    action: "DELETE",
    entity: "Property",
    entityId: doc._id,
    userId: doc.registeredBy || "system",
    changes: doc.toObject(),
    timestamp: new Date(),
  }).catch((err) => console.error("Audit log error:", err));

  next();
});

propertycollectionSchema.post("findOneAndUpdate", function (doc, next) {
  if (!doc) return next();

  const changes = this.getUpdate();

  AuditLog.create({
    action: "UPDATE",
    entity: doc.propertyType,
    entityId: doc._id,
    userId: changes.$set?.registeredBy || "system",
    changes: changes.$set || changes,
    timestamp: new Date(),
  }).catch((err) => console.error("Audit log error:", err));

  next();
});

module.exports = mongoose.model("Propertycollection", propertycollectionSchema);
