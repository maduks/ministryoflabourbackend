const Queue = require("bull");
const mongoose = require("mongoose");
const transporter = require("../../config/emailconfig");
const { Transaction } = require("../../models/Transaction");
const { Wallet } = require("../../models/Wallet");
const { sendBalanceUpdate } = require("../../utils/socketServer");
const fetchFromAPI = require("../../service/apicalls/fetchFromAPI");
const ReferralService = require("../../service/referral/referallService");
const {
  emitTransactionNotification,
} = require("../../events/sendtransactionnotifications");
require("dotenv").config(); // Load environment variables from .env file

const requeryBillsTransactionQueue = (retData) => {
  // Create the retryQueue with increased stall settings
  const retryQueue = new Queue("requery", {
    redis: {
      host: "redis", // Use localhost for local testing
      port: 6379,
    },
    settings: {
      stalledInterval: 10000, // How often to check for stalled jobs (in ms)
      lockDuration: 30000, // How long Bull will wait before considering the job locked (in ms)
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
    let totalamount = parseFloat(amount) + parseFloat(fee || 0);
    let session;

    try {
      // API request with a timeout handling
      const response = await fetchFromAPI(
        apiUrl,
        method,
        { request_id: request_id },
        {},
        headers
      );
      let wallet = await Wallet.findById(walletId).exec();

      if (response.code !== "000" && response.code !== "099") {
        console.log("Failed here...");

        // Transaction failed logic
        session = await mongoose.startSession();
        session.startTransaction();

        let updatedBalance = wallet.balance;
        updatedBalance += parseFloat(amount) + parseFloat(fee || 0);
        wallet.prevbalance = wallet.balance; // Record previous balance
        wallet.balance = updatedBalance;

        await Transaction.findOneAndUpdate(
          { _id: tid },
          {
            status: "Failed",
            transactionID: response?.content?.transactions?.transactionId,
            requestId: response?.requestId,
          },
          { new: true }
        );

        const refundTid = new mongoose.Types.ObjectId();

        const transaction = new Transaction({
          _id: refundTid,
          walletId,
          type: "Refund",
          amount,
          fee,
          status: "Completed",
          description: "Refund failed transaction",
          totalamount,
          commission: 0,
          category: "Deposit",
          banktransactions: null,
          billstransactions: null,
          reference: `txn_${Date.now()}`,
        });

        const formattedAmount = new Intl.NumberFormat().format(totalamount);
        let notification = {
          title: "Transaction Failed",
          message:
            "Payment of ₦" +
            formattedAmount +
            " For " +
            billstransactions.desc +
            " failed.",
          userId: wallet.userId,
        };

        // Emit the transaction notification event
        emitTransactionNotification(notification);

        await wallet.save({ session });
        await transaction.save({ session });

        sendBalanceUpdate(walletId, wallet.balance);

        await session.commitTransaction();
      } else if (
        response.code == "099" ||
        (response.code == "000" &&
          (response.content.transactions.status == "pending" ||
            response.content.transactions.status !== "delivered"))
      ) {
        console.log("Recalling...");

        // Retry job with delay and exponential backoff..
        retryQueue.add(retData, {
          delay: 20000,
          attempts: 5, // Set max retries
          backoff: { type: "exponential", delay: 20000 },
        });
      } else if (
        response.code == "000" &&
        response.content.transactions.status == "delivered"
      ) {
        console.log("Success case..."+JSON.stringify(response),request_id);

        if(response?.content?.transactions?.type=="Electricity Bill" && response?.content?.transactions?.extras==null||"null" ){
          return  retryQueue.add(retData, {
            delay: 20000,
            attempts: 5, // Set max retries
            backoff: { type: "exponential", delay: 20000 },
          });
        }
        

        // Success case logic
        await Transaction.findOneAndUpdate(
          { _id: tid },
          {
            status: "Completed",
            transactionID: response?.content?.transactions?.transactionId,
            requestId: response?.requestId,
            token: response?.content?.transactions?.extras//response?.Token,
          },
          { new: true }
        );

        // Referral processing
        const ref = await ReferralService.processReferralEarnings(
          wallet.userId,
          amount,
          tid
        );

        const formattedAmount = new Intl.NumberFormat().format(totalamount);
        let token = response?.content?.transactions?.extras
          ? " " + response?.content?.transactions?.extras
          : "";
        let notification = {
          title: "Transaction Successful",
          message:
            "Payment of ₦" +
            formattedAmount +
            " For " +
            billstransactions.desc +
            " With transaction reference of " +
            response.requestId +
            " has been processed successfully." +
            token,
          userId: wallet.userId,
        };

        // Emit the transaction notification event
        emitTransactionNotification(notification);

        sendBalanceUpdate(walletId, wallet.balance);
      }
   
    } catch (error) {
      console.error("Error processing job:", error);
      // Log the error more clearly for debugging
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  });

  // Event listeners for job completion/failure
  retryQueue.on("completed", (job) => {
    console.log(`Job with id ${job.id} has been completed successfully`);
  });

  retryQueue.on("failed", (job, err) => {
    console.log(`Job with id ${job.id} failed with error: ${err.message}`);
  });

  return retryQueue;
};

module.exports = requeryBillsTransactionQueue;
