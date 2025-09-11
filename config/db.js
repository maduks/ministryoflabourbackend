const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables from .env file

// MongoDB connection URI
const uri = process.env.MONGO_DB_URI;
const dbName = process.env.DATABASE_NAME;
//db config to export
async function connectToMongoDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);

    console.log("Connected to MongoDB");

    // Access default Mongoose connections
    const db = mongoose.connection;

    // Specify the database name (optional)
    db.useDb(dbName);

    // You can return the Mongoose connection object or use it in your application
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // Rethrow the error for handling in your application
  }
}

module.exports = connectToMongoDB;
