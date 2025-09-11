const Joi = require("joi");
const mongoose = require("mongoose");

// Define User schema
const tokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const validateToken = (token) => {
  const schema = new Joi.object({
    userId: Joi.string().min(5).required(),
    token: Joi.string().min(5).required(),
    code: Joi.string().min(4).required(),
  });
  return schema.validate(token);
};
// Create Token Model
const Token = mongoose.model("Tokens", tokenSchema);
module.exports = { Token, validateToken };
