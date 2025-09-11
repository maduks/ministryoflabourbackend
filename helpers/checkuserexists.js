const { User } = require("../models/User"); // Assuming your model file is in models/Wallet.js

async function checkUserExists(userID) {
  try {
    const user = await User.findById({ _id: userID });

    if (user) {
      return user;
    } else {
      return false; // Account number is already linked to another wallet
    }
  } catch (error) {
    throw new Error("Error creating wallet");
  }
}

module.exports = checkUserExists;
