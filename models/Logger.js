const Joi = require("joi");
const mongoose = require("mongoose");

// Define User schema
const loggerSchema = new mongoose.Schema({
  request: {
    type: String,
  },
  error: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Token Model
const Logger = mongoose.model("Loggers", loggerSchema);
module.exports = { Logger };
