const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propertySchema = new Schema(
  {
    // Basic Information
    title: { type: String, required: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    propertyType: {
      type: String,
      required: true,
      // enum: ['Apartment', 'House', 'Duplex', 'Bungalow', 'Land', 'Commercial', 'Other']
    },
    // Reference to the Certification model
    certification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certifications", // This tells Mongoose to reference the 'Certification' model
    },

    listingType: {
      type: String,
      required: true,
      //enum: ['For Sale', 'For Rent', 'For Lease', 'Short-term Rental']
    },
    price: { type: Number, required: true },
    priceNegotiable: { type: Boolean, default: false },
    area: { type: String, required: false }, // in square meters/feet
    areaUnit: {
      type: String,
      //enum: ["sqm", "sqft"],
      default: "sqm",
    },
    yearBuilt: { type: Number },
    description: { type: String, required: true },
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

    // Location Details
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    neighborhood: { type: String },
    landmark: { type: String },
    maplocation: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" },
    },
    //showExactAddress: { type: Boolean, default: true },

    // Property Features
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    toilets: { type: Number },
    kitchens: { type: Number },
    livingRooms: { type: Number },
    floors: { type: Number },
    parking: {
      type: Number,
    },

    furnishing: {
      type: String,
      //enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
    },

    // Amenities
    amenities: [{ type: String }], // e.g., ['Electricity', 'Water Supply', 'Security']

    // Media
    photos: [{ type: String, required: true }], // Array of image URLs
    videos: [{ type: String }], // Array of video URLs
    virtualTour: { type: String },
    floorPlans: [{ type: String }], // Array of floor plan image URLs
    // Additional Details
    condition: {
      type: String,
      // enum: ["New", "Renovated", "Good", "Needs Renovation"],
    },
    availabilityDate: { type: Date }, // For rentals
    petsAllowed: { type: Boolean },
    // Contact Information
    listedBy: {
      type: String,
      //enum: ["Owner", "Agent", "Agency"],
      required: true,
    },
    contact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      alternatePhone: { type: String },
      preferredContact: {
        type: String,
        //enum: ["Phone", "Email", "WhatsApp", "SMS"],
      },
    },

    // Financial Information
    pricePerSqm: { type: Number },
    maintenanceFee: { type: Number },
    propertyTax: { type: Number },
    utilitiesEstimate: { type: Number },
    securityDeposit: { type: Number }, // For rentals
    commission: { type: Number }, // If agent-listed

    // Legal Information
    documents: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
    ownershipType: {
      type: String,
      enum: ["Freehold", "Leasehold", "Cooperative", "Other"],
    },

    // Advanced Features
    nearbyAmenities: [{ type: String }],
    accessibilityFeatures: [{ type: String }],
    energyEfficiencyRating: { type: String },
    hasSolarPanels: { type: Boolean },
    smartHomeFeatures: [{ type: String }],

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Pending", "Sold", "Rented", "Expired", "Archived"],
      default: "Active",
    },
    featured: { type: Boolean, default: false },
    featured_until: { type: Date },
    isPromoted: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { strict: false }
);

// Indexes for better query performance
propertySchema.index({ title: "text", description: "text" });
propertySchema.index({ location: "2dsphere" });
propertySchema.index({ price: 1 });
propertySchema.index({ propertyType: 1, listingType: 1 });

// Middleware to update the updatedAt field
propertySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  if (this.phoneNumber === "00000000000") {
    // Generate a random 11-digit phone number starting with a non-zero digit
    this.phoneNumber = Array.from({ length: 11 }, (_, i) =>
      i === 0
        ? Math.floor(Math.random() * 9) + 1
        : Math.floor(Math.random() * 10)
    ).join("");
  }

  next();
});

// Virtual for formatted address
propertySchema.virtual("formattedAddress").get(function () {
  return `${this.address}, ${this.city}, ${this.state}, ${this.country}`;
});

module.exports = mongoose.model("Property", propertySchema);
