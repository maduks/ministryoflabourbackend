const Joi = require("joi");
const mongoose = require("mongoose");
const Referral = require("./Referral");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email) =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
    },
    gender: {
      type: String,
      required: false,
    },
    state: {
      type: String,
    },
    lga: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    isverified: {
      type: Boolean,
      required: true,
      trim: true,
    },
    isKYCVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    role: {
      type: String,
      required: true,
      minlength: 3, // Minimum length for the role
    },
    // role: {
    //   type: String,
    //   required: true,
    //   enum: ['super_admin', 'ministry_admin', 'service_provider', 'customer'],
    //   default: 'customer'
    // },
    ministry: { type: mongoose.Schema.Types.ObjectId, ref: "Ministry" },
    state: { type: String, required: false },

    status: {
      type: String,
      required: false,
      default: "active",
      minlength: 3, // Minimum length for the role
    },
    failedAttempts: { type: Number, default: 0 },
    lastLogin: { type: Date },
    lockUntil: { type: Date, default: null },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strictPopulate: false }
);

const User = mongoose.model("Users", userSchema);
module.exports = { User };
