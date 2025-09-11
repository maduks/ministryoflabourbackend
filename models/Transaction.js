const { number } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new mongoose.Schema({
  _id: { type: String },
  walletId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Wallet",
  },
  type: {
    type: String,
    enum: ["Deposit", "Withdrawal", "Transfer", "Refund"],
    required: true,
  },
  category: {
    type: String,
    enum: ["Income", "Withdraw", "Bills", "Contribution", "Funding", "Deposit"],
    required: true,
  },

  fee: {
    type: Number,
    required: false,
    default: 0,
  },
  banktransactions: [
    {
      bank: {
        type: String,
      },
      receiver: {
        type: String,
      },
      accountnumber: {
        type: String,
      },
    },
  ],
  billstransactions: {
    provider: {
      type: String,
    },
    type: {
      type: String,
    },
    desc: { type: String },
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  totalamount: {
    type: Number,
    required: false,
  },
  commission: {
    type: Number,
    required: false,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  reference: {
    type: String,
    required: true,
    unique: true, // Unique reference for each transaction
  },
  requestId: {
    type: String,
    required: false,
  },

  transactionID: {
    type: String,
    unique: true, // Unique reference for each transaction
  },
  token: {
    type: String,
    required: false,
  },
  // Additional metadata for ministry filtering
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = { Transaction };
