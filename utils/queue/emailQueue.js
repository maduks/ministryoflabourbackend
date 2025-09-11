const Queue = require("bull");
const transporter = require("../../config/emailconfig");

require("dotenv").config(); // Load environment variables from .env file.

const emailQueue = (emails) => {
  const emailQueue = new Queue(
    "email",

    "rediss://default:AdkOAAIjcDExZDJhNThmMzQxM2Y0Njk2ODUxNTcyZTBiNjEzNmNhN3AxMA@balanced-bison-55566.upstash.io:6379",
    {
      redis: {
        tls: {}, // Required for Upstash (since it's a TLS connection)
      },
    }
  );

  emailQueue.add(emails);

  emailQueue.process(async (job) => {
    const email = job.data;
    try {
      await transporter.sendMail(email);
    } catch (error) {
      // handle error
      console.log(error);
    }
  });

  // Event listener for job completion
  emailQueue.on("completed", (job) => {
    console.log(`Job with id ${job.id} has been completed`);
  });

  // Event listener for job failures
  emailQueue.on("failed", (job, err) => {
    console.log(`Job with id ${job.id} failed with error: ${err.message}`);
  });

  return emailQueue;
};

module.exports = emailQueue;
