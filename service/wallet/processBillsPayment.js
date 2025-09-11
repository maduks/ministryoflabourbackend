const mongoose = require("mongoose");
const { Wallet } = require("../../models/Wallet");
const { User } = require("../../models/User");
const { Transaction } = require("../../models/Transaction");
const walletService = require("./walletService");
const userProfileService = "../../service/userProfile/userProfileService.js";
const calculateCommission = require("../../helpers/commissions");
const { sendBalanceUpdate } = require("../../utils/socketServer");
const fetchFromAPI = require("../apicalls/fetchFromAPI");
const requeryBillsTransactionQueue = require("../../utils/queue/retryBillsQueue");
const ReferralService = require("../../service/referral/referallService");
const {
  emitTransactionNotification,
} = require("../../events/sendtransactionnotifications");
const refundFailed = require("./refundFailed");

class ProcessBillsPayment {
  /**
   * Processes a bill payment by handling wallet updates,
   * interacting with a third-party API, and ensuring transaction atomicity.
   *
   * @param {String} walletId - The ID of the user's wallet.
   * @param {String} type - Transaction type ("Deposit" or "Withdrawal").
   * @param {Number} amount - The amount to be debited or credited.
   * @param {String} reference - Transaction reference for tracking.
   * @param {String} description - Description of the transaction.
   * @param {String} category - Transaction category (e.g., "Bills", "Withdraw").
   * @param {Object|null} banktransactions - Bank transaction details (if any).
   * @param {Object|null} billstransactions - Bill transaction details (if any).
   * @param {String} apiUrl - The third-party API endpoint for the transaction.
   * @param {String} method - HTTP method (e.g., "POST").
   * @param {Object} paymentDetails - Payment details required by the API.
   * @param {Object} headers - Additional headers for the API request.
   * @param {Number} retryCount - The number of retry attempts on version conflict.
   * @returns {Object} - Result of the payment process, including wallet and transaction details.
   */

  processBillsPayment = async (
    walletId,
    type,
    amount,
    reference,
    description,
    category,
    banktransactions,
    billstransactions,
    fee,
    apiUrl,
    method,
    paymentDetails,
    headers,
    retryCount = 3
  ) => {
    let session; // Define session for transaction management
    try {
      // Start a new session and transaction
      session = await mongoose.startSession();
      session.startTransaction();

      // STEP 1: Fetch wallet details using the wallet ID
      let wallet = await Wallet.findById(walletId).session(session).exec();
      if (!wallet) throw new Error("Wallet not found");
      const users = await User.findById(wallet.userId);

      //const role = await userProfileService.getUserById(wallet.userId)
      const provider1 = description.split(" ")[0];
      const service1 = description.split(" ")[1];
      const type1 = description.split(" ")[2];

      const data = {
        provider: provider1.toLocaleUpperCase(),
        service: service1.toLocaleUpperCase(),
        type: type1.toLocaleUpperCase(),
      };

      const wcommission = calculateCommission(data);

      let totalamount = amount;
      let commission = 0; //+ (parseFloat(fee) || 0);

      // STEP 2: Adjust the balance based on transaction type
      let updatedBalance = wallet.balance;

      if (type === "Deposit") {
        updatedBalance += amount;
        wallet.prevbalance = wallet.balance; // Record previous balance
      } else if (type === "Withdrawal") {
        if (wallet.balance < amount) throw new Error("Insufficient balance");
        if (users.role.trim() == "reseller") {
          fee = 0;
          commission = (parseFloat(wcommission) / 100) * amount;
          totalamount = amount - commission;
        }

        totalamount = parseFloat(amount) + parseFloat(fee);

        updatedBalance -= totalamount;
        //totalamount == 0 ? parseFloat(amount) - parseFloat(fee||0) : totalamount;
        wallet.prevbalance = wallet.balance; // Record previous balance

        //totalamount = parseFloat(amount) + parseFloat(fee);
      }

      // Update the wallet balance
      wallet.balance = updatedBalance;
      console.log(commission, totalamount, wallet.prevbalance, wallet.balance);
      // STEP 3: Create a new transaction with "Pending" status
      const tid = new mongoose.Types.ObjectId(); // Generate unique transaction ID
      wallet.transactions.push(tid); // Add transaction ID to wallet's transactions list
      const transaction = new Transaction({
        _id: tid,
        walletId,
        type,
        amount,
        fee,
        status: "Pending", // Initial status set to "Pending"
        description,
        totalamount,
        commission,
        category,
        banktransactions: banktransactions || null, // Add bank transaction details (if any)
        billstransactions: billstransactions || null, // Add bills transaction details (if any)
        reference,
      });

      // STEP 4: Save the wallet and transaction data within the transaction session
      await wallet.save({ session });
      await transaction.save({ session });

      // STEP 5: Call third-party API to process the payment
      const response = await fetchFromAPI(
        apiUrl,
        method,
        paymentDetails,
        {},
        headers
      );

      // Check API response for errors
      if (response.code !== "000" && response.code != "099") {
        await refundFailed.processFailedPayment(
          walletId,
          tid,
          amount,
          fee,
          billstransactions,
          response?.content?.transactions?.transactionId,
          response?.requestId
        );
    
        throw new Error(response.response_description);
      }

      if (
        (response.code == "000" &&
          response.content.transactions.status == "pending") ||
        response.code == "099"
      ) {

      
        const requeryData = {
          tid,
          request_id: paymentDetails.request_id,
          apiUrl: "https://vtpass.com/api/requery",
          method,
          headers,
          walletId,
          fee,
          amount,
          billstransactions,
        };

        console.log("entered the requery box from procesbills....");
        requeryBillsTransactionQueue(requeryData);
        const updatedWallet = await walletService.getWalletByWalletId(walletId);
        // Emit the balance update to the frontend (e.g., Expo client)
        sendBalanceUpdate(walletId, wallet.balance);
        // STEP 7: Commit the transaction, ensuring data is persisted atomically
        await session.commitTransaction();
        response.content.transactions.status="Pending"
        return { data: { response }, wallet, transaction, status: "Pending" };
      }

      // STEP 6: If payment is successful, update the transaction status to "Completed"
      transaction.status = "Completed";
      transaction.transactionID = response?.content.transactions.transactionId;
      transaction.requestId = response?.requestId;
      transaction.token = response?.Token || null;
      await transaction.save({ session });
      const updatedWallet = await walletService.getWalletByWalletId(walletId);

      //REFERRALL SERVICE
      const ref = await ReferralService.processReferralEarnings(
        wallet.userId,
        amount,
        tid
      );

      // Emit the balance update to the frontend (e.g., Expo client)
      sendBalanceUpdate(walletId, wallet.balance);

      // STEP 7: Commit the transaction, ensuring data is persisted atomically
      await session.commitTransaction();
      const formattedAmount = new Intl.NumberFormat().format(totalamount);
      let notification = {
        title: "Transaction Successful",
        message:
          "Payment of ₦" +
          formattedAmount +
          " For " +
          billstransactions.desc +
          " With transaction reference of " +
          response.requestId +
          " has been processed successfully.",
        userId: wallet.userId,
      };
      // Emit the transaction notification event
      emitTransactionNotification(notification);
      response.content.transactions.status="Completed"

      // Return the successful response with wallet and transaction details
      return { data: { response }, wallet, transaction, status: "success" };
    } catch (error) {
      // Retry on Mongoose version conflict (optimistic concurrency control)
      if (error instanceof mongoose.Error.VersionError && retryCount > 0) {
        console.error(
          `Version conflict, retrying transaction... ${retryCount} attempts left`
        );
        return this.processBillsPayment(
          walletId,
          type,
          amount,
          reference,
          description,
          category,
          banktransactions,
          billstransactions,
          fee,
          apiUrl,
          method,
          paymentDetails,
          headers,
          retryCount - 1 // Decrease retry count
        );
      }

      // Abort the transaction in case of an error
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      // Ensure session is ended properly, even if there's an error
      if (session) session.endSession();
    }
  };
}

module.exports = new ProcessBillsPayment();
