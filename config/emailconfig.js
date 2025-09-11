const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables from .env file
const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  service: process.env.SERVICE,
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASS,
  },
});

module.exports = transporter;
