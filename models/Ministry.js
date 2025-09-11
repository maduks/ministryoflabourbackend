// models/Ministry.js
const mongoose = require("mongoose");
const { User } = require("./User"); // Adjust path as needed
const { hashPassword } = require("../utils/passwordHash"); // Adjust path as needed

const ministrySchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    status: { type: String, default: "Active" },
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    minister: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String },
    logo: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    accessTypes: [],
    agentCount: { type: Number, default: 0 },
    // Optional: Granular xcontrol
    allowedCategories: [
      {
        type: String,
        ref: "ServiceCategory",
      },
    ],
    allowedSubcategories: [
      {
        type: String,
      },
    ],
    createdAt: { type: Date, default: Date.now },
    state: { type: String, required: false },
  },
  { strict: false }
);

// Pre-save hook to create a user if not already set
ministrySchema.pre("save", async function (next) {
  if (this.isNew && !this.userid) {
    // Hash the password before saving (use your existing hash helper)
    const defaultPassword = this.password; // Or generate a random one
    const hashedPassword = await hashPassword(defaultPassword);
    const newUser = await User.create({
      fullName: this.name,
      email: this.email,
      phoneNumber: this.phoneNumber,
      isKYCVerified: true,
      isverified: true,
      role: "ministry_admin",
      password: hashedPassword,
      ministry: this._id, // Reference to this ministry
    });
    this.userid = newUser._id;
  }
  next();
});

const Ministries = mongoose.model("Ministry", ministrySchema);
module.exports = { Ministries };
