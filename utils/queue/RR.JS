const Queue = require("bull");
const mongoose = require("mongoose");
const { Transaction } = require("../../models/Transaction");
const { Wallet } = require("../../models/Wallet");
const { sendBalanceUpdate } = require("../../utils/socketServer");
const fetchFromAPI = require("../../service/apicalls/fetchFromAPI");
const ReferralService = require("../../service/referral/referallService");
const {
  emitTransactionNotification,
} = require("../../events/sendtransactionnotifications");

require("dotenv").config();

const SUCCESS_CODE = "0";
const PENDING_CODE = "3";
const DELIVERED_STATUS = "SUCCESSFUL";
const PENDING_STATUS = "PENDING";

const requeryBillsTransactionQueue = (retData) => {
  const retryQueue = new Queue("requery", {
    redis: { host: "redis", port: 6379 },
    settings: {
      stalledInterval: 10000,
      lockDuration: 30000,
    },
  });

  retryQueue.add(retData);

  retryQueue.process(async (job) => {
    console.log("Query queue called...");

    const {
      apiUrl,
      method,
      walletId,
      fee,
      billstransactions,
      amount,
      request_id,
      tid,
      headers,
    } = job.data;
    const totalAmount = parseFloat(amount) + parseFloat(fee || 0);

    try {
      const response = await fetchFromAPI(
        apiUrl,
        method,
        { request_id },
        {},
        headers
      );
      const wallet = await Wallet.findById(walletId).exec();
      const session = await mongoose.startSession();

      session.startTransaction();

      // Handle different API response codes
      if (
        response.responseCode != SUCCESS_CODE &&
        response.responseCode != PENDING_CODE
      ) {
        await handleTransactionFailure(
          response,
          wallet,
          totalAmount,
          fee,
          billstransactions,
          tid,
          session
        );
      } else if (response.responseCode == PENDING_CODE) {
        await retryTransaction(job, retData);
      } else if (response.responseCode == SUCCESS_CODE) {
        await handleTransactionSuccess(
          response,
          wallet,
          totalAmount,
          fee,
          billstransactions,
          tid,
          session
        );
      }

      await session.commitTransaction();
    } catch (error) {
      console.error("Error processing job:", error);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  });

  retryQueue.on("completed", (job) => {
    console.log(`Job with id ${job.id} completed successfully`);
  });

  retryQueue.on("failed", (job, err) => {
    console.log(`Job with id ${job.id} failed with error: ${err.message}`);
  });

  return retryQueue;
};

const handleTransactionFailure = async (
  response,
  wallet,
  totalAmount,
  fee,
  billstransactions,
  tid,
  session
) => {
  console.log("Transaction failed...");

  wallet.prevbalance = wallet.balance;
  wallet.balance += totalAmount;

  await Transaction.findOneAndUpdate(
    { _id: tid },
    {
      status: "Failed",
      transactionID: response?.transactionId,
      requestId: response?.referenceNumber,
    },
    { new: true }
  );

  const refundTid = new mongoose.Types.ObjectId();

  const transaction = new Transaction({
    _id: refundTid,
    walletId: wallet._id,
    type: "Refund",
    amount,
    fee,
    status: "Completed",
    description: "Refund failed transaction",
    totalamount: totalAmount,
    commission: 0,
    category: "Deposit",
    reference: `txn_${Date.now()}`,
  });

  const formattedAmount = new Intl.NumberFormat().format(totalAmount);

  let notification = {
    title: "Transaction Failed",
    message: `Payment of ₦${formattedAmount} for ${billstransactions.desc} failed. A refund has already been made.`,
    userId: wallet.userId,
  };

  emitTransactionNotification(notification);

  await wallet.save({ session });
  await transaction.save({ session });

  sendBalanceUpdate(wallet._id, wallet.balance);
};

const retryTransaction = async (job, retData) => {
  console.log("Recalling transaction...");

  job.queue.add(retData, {
    delay: 20000,
    attempts: 5,
    backoff: { type: "exponential", delay: 20000 },
  });
};

const handleTransactionSuccess = async (
  response,
  wallet,
  totalAmount,
  fee,
  billstransactions,
  tid,
  session
) => {
  console.log("Transaction succeeded...");

  const token = response?.merchantTransactionReference || "";
  await Transaction.findOneAndUpdate(
    { _id: tid },
    {
      status: "Completed",
      transactionID: response?.transactionId,
      requestId: response?.referenceNumber,
      token,
    },
    { new: true }
  );

  // Referral processing
  await ReferralService.processReferralEarnings(wallet.userId, amount, tid);

  const formattedAmount = new Intl.NumberFormat().format(totalAmount);

  let notification = {
    title: "Transaction Successful",
    message:
      `Payment of ₦${formattedAmount} for ${billstransactions.desc} with transaction reference of  ${response.referenceNumber} has been processed successfully.` +
      " Light Token: " +
      response.merchantTransactionReference,
    userId: wallet.userId,
  };

  emitTransactionNotification(notification);

  sendBalanceUpdate(wallet._id, wallet.balance);
};

const isDelivered = (response) =>
  response.content.transactions.status == DELIVERED_STATUS;

module.exports = requeryBillsTransactionQueue;
