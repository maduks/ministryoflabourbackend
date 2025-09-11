const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// /models/Wallet.js

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Users",
      unique: true, // Each user has one wallet
    },
    prevbalance: {
      type: Number,
      required: true,
      default: 0, // Initial balance is 0
    },
    balance: {
      type: Number,
      required: true,
      default: 0, // Initial  balance is 0
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],

    accountdetails: {
      reference: {
        type: String,
        required: false,
      },
      accountnumber: {
        type: String,
        required: false,
      },
      accountname: {
        type: String,
        required: false,
      },
      bankname: {
        type: String,
        required: false,
      },
      bankcode: {
        type: String,
        required: false,
      },
      callbackurl: {
        type: String,
        required: false,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Enables the __v field for versioning
    versionKey: "true",
  }
);

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = { Wallet };
