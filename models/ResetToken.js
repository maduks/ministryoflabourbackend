const Joi = require("joi");
const mongoose = require("mongoose");

// Define User schema
const resettokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
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
// const validateToken = (token) => {
//   const schema = new Joi.object({
//     email: Joi.string().min(5).required(),
//     token: Joi.string().min(5).required(),
//     code: Joi.string().min(5).required(),
//   });
//   return schema.validate(token);
// };
// Create Token Model
const ResetToken = mongoose.model("ResetTokens", resettokenSchema);
module.exports = { ResetToken };
