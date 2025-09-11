const { Wallet } = require("../models/Wallet");

async function checkWalletExists(walletID) {
  try {
    const wallet = await Wallet.findById({ _id: walletID });

    if (wallet) {
      return wallet;
    } else {
      return false; // Account number is already linked to another wallet
    }
  } catch (error) {
    throw new Error("Error fetching wallet");
  }
}

module.exports = checkWalletExists;
