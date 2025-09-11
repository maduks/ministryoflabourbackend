const emailQueue = require("./queue/emailQueue");
const transporter = require("../config/emailconfig");
require("dotenv").config(); // Load environment variables from .env file

const sendEmail = async (email_to, subject, text) => {
  try {
    const emails = {
      from: {
        name: "BDIC",
        address: process.env.EMAIL_USER,
      },
      to: email_to,
      subject: subject,
      text: text,
    };
    emailQueue(emails);
    console.log("Email sent sucessfully");
  } catch (error) {
    console.log("email not sent " +error);
  }
};

module.exports = sendEmail;
