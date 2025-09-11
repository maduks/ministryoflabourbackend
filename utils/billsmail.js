const emailQueue = require("./queue/emailQueue");
const transporter = require("../config/emailconfig");
require("dotenv").config(); // Load environment variables from .env file

const billsEmail = async (email_to, subject, text) => {
  try {
    const htmlTemp=`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction Successful</title>
    <style>
        /* Reset and basic styling */
        body, html {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            text-align: center;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .email-header {
            background-color: #4CAF50;
            color: #ffffff;
            padding: 20px;
            font-size: 24px;
            font-weight: bold;
        }
        .email-body {
            padding: 30px;
            text-align: left;
        }
        .transaction-info {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .transaction-info p {
            margin: 8px 0;
        }
        .footer {
            background-color: #333;
            color: #ffffff;
            padding: 20px;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        .button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            Transaction Successful!
        </div>

        <div class="email-body">
            <h2>Hi [Recipient Name],</h2>
            <p>We are pleased to inform you that your transaction was successfully completed!</p>

            <div class="transaction-info">
                <h3>Transaction Details:</h3>
                <p><strong>Transaction ID:</strong> [Transaction ID]</p>
                <p><strong>Amount:</strong> [Amount]</p>
                <p><strong>Date:</strong> [Transaction Date]</p>
                <p><strong>Status:</strong> Completed</p>
            </div>

            <p>Thank you for choosing us for your transaction. If you have any questions, feel free to contact us at any time.</p>

            <a href="[Transaction Link]" class="button">View Transaction</a>
        </div>

        <div class="footer">
            <p>&copy; 2024 Pickwave. All rights reserved.</p>
            <p>If you have any questions, please contact our support team at <a href="mailto:support@pickwave.com" style="color: #ffffff;">support@pickwave.com</a></p>
        </div>
    </div>
</body>
</html>
`
    const emails = {
      from: {
        name: "Pickwave",
        address: process.env.EMAIL_USER,
      },
      to: email_to,
      subject: subject,
      text: text,
      html:htmlTemp
    };
    emailQueue(emails);
    console.log("Email sent sucessfully");
  } catch (error) {
    console.log("email not sent " +error);
  }
};

module.exports = billsEmail;
