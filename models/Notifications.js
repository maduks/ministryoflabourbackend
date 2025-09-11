const mongoose = require("mongoose");

// Define User schema
const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  message: {
    type: String,
    required: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Token Model
const Notification = mongoose.model("Notifications", notificationSchema);
module.exports = { Notification };
