// cron-jobs/expireFeaturedListings.js
const cron = require("node-cron");
const { Business } = require("../models/Business"); // Adjust path to your Listing model
const mongoose = require("mongoose"); // Only needed if you connect DB here, otherwise connect in app.js

const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds

const expiredBusinessFeaturedListingJobs = async () => {
  console.log("--- Running business featured listings expiry job ---");

  try {
    const now = new Date(); // Current timestamp

    // Find listings where is_featured is true AND featured_until is in the past
    // The $lt operator means "less than" (i.e., older than now)
    const expiredListings = await Business.find({
      featured: true,
      featured_until: { $lt: now },
    });

    if (expiredListings.length === 0) {
      console.log("No featured business listings to expire at this time.");
      return;
    }

    // Update these listings to set is_featured to false and clear featured_until
    const updateResult = await Business.updateMany(
      { _id: { $in: expiredListings.map((l) => l._id) } }, // Find by IDs of expired listings
      { $set: { is_featured: false, featured_until: null } } // Update fields
    );

    console.log(
      `Successfully expired ${updateResult.modifiedCount} featured listings.`
    );
    console.log(`Matched ${updateResult.matchedCount} listings for expiry.`);
  } catch (error) {
    console.error("Error during featured listings expiry job:", error);
  }
  console.log("--- Finished featured listings expiry job ---");
};

// Function to start the cron job
const startBusFeaturedListingCronJob = () => {
  // Schedule the job to run every hour
  // '0 * * * *' means "At minute 0 past every hour."
  // For daily at midnight: '0 0 * * *'
  // For every 5 minutes: '*/5 * * * *'
  // For testing (every minute): '* * * * *' (REMOVE FOR PRODUCTION!)

  cron.schedule("0 * * * *", () => {
    // Runs at the top of every hour
    expiredBusinessFeaturedListingJobs();
  });

  console.log("Featured business listings expiry cron job scheduled.");

  // You can also run it immediately once the app starts
  // This is good for catching any listings that expired while the app was down
  // setTimeout(expireFeaturedListings, 5000); // Run after 5 seconds to allow DB connection
};

module.exports = {
  startBusFeaturedListingCronJob,
  expiredBusinessFeaturedListingJobs, // Export for potential manual triggering or testing
};
