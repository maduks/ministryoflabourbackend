const mongoose = require("mongoose");
const { Wallet } = require("../../models/Wallet");
const { Transaction } = require("../../models/Transaction");

const {
  emitTransactionNotification,
} = require("../../events/sendtransactionnotifications");
class WalletService {
  /**
   * Creates a new wallet for a user.
   *
   * @param {String} userId - The ID of the user to create a wallet for.
   * @returns {Object} - The newly created wallet.
   * @throws Will throw an error if the user already has a wallet.
   */
  async createWallet(userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Check if a wallet already exists for the user
      const existingWallet = await Wallet.findOne({ userId }).session(session);
      if (existingWallet) {
        throw new Error("Wallet already exists");
      }

      // Create a new wallet
      const wallet = new Wallet({ userId });
      await wallet.save({ session });

      // Commit transaction if successful
      await session.commitTransaction();
      return wallet;
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession(); // Ensure session is ended
    }
  }

  /**
   * Retrieves a wallet by user ID.
   *
   * @param {String} userId - The ID of the user.
   * @returns {Object} - The wallet associated with the user.
   */
  async getWalletByUserId(userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Find the wallet associated with the user
      const existingWallet = await Wallet.findOne({ userId }).session(session);
      return existingWallet;
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getWalletByWalletId(WalletId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Find the wallet associated with the user
      const existingWallet = await Wallet.findOne({ _id: WalletId }).session(
        session
      );
      return existingWallet;
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Processes a deposit or withdrawal transaction for a wallet.
   *
   * @param {String} walletId - The wallet's ID.
   * @param {String} type - The type of transaction ("Deposit" or "Withdrawal").
   * @param {Number} amount - The transaction amount.
   * @param {String} reference - Reference for the transaction.
   * @param {String} description - A description of the transaction.
   * @param {String} category - The category of the transaction (e.g., "Bills", "Withdraw").
   * @param {Object|null} banktransactions - Bank transaction details (if any).
   * @param {Object|null} billstransactions - Bill transaction details (if any).
   * @param {Number} retryCount - Retry attempts for handling version conflicts.
   * @returns {Object} - The updated wallet and transaction details.
   */
  async processTransaction(
    walletId,
    type,
    amount,
    reference,
    description,
    category,
    banktransactions,
    billstransactions,
    fee,
    retryCount = 3
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // STEP 1: Find wallet by ID
      let wallet = await Wallet.findById(walletId).session(session).exec();
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // STEP 2: Adjust balance based on transaction type (Deposit/Withdrawal)
      let updatedBalance = parseFloat(wallet.balance);
      if (type === "Deposit") {
        updatedBalance += parseFloat(amount);
        wallet.prevbalance = updatedBalance - parseFloat(amount); // Save previous balance
      } else if (type === "Withdrawal") {
        if (wallet.balance < amount) {
          throw new Error("Insufficient balance");
        }
        updatedBalance -= parseFloat(amount) + parseFloat(fee);
        wallet.prevbalance = updatedBalance + parseFloat(amount); // Save previous balance
      }

      // STEP 3: Update wallet balance and create transaction
      wallet.balance = updatedBalance;
      const tid = new mongoose.Types.ObjectId();
      wallet.transactions.push(tid);

      let totalamount = parseFloat(amount) + parseFloat(fee || 0);

      console.log(totalamount, amount, fee);

      const transaction = new Transaction({
        _id: tid,
        walletId,
        type,
        amount,
        status: "Completed", // Mark transaction as completed
        description,
        category,
        banktransactions: banktransactions || null,
        billstransactions: billstransactions || null,
        reference,
        fee,
        totalamount
      });



      let notification = {
        title: "Wallet Funding",
        message:
          "You've Funded your account with the sum of ₦" +
          totalamount + " With transaction reference of " +
          reference +
          " has been processed successfully. A deposit fee of ₦50 was deducted.",
        userId: wallet.userId,
      };
      // Emit the transaction notification event
      emitTransactionNotification(notification);



      // STEP 4: Save wallet and transaction data
      await wallet.save({ session });
      await transaction.save({ session });

      // STEP 5: Commit the transaction
      await session.commitTransaction();
      return { wallet, transaction, status: "success" };
    } catch (error) {
      // Retry transaction if version conflict occurs (optimistic concurrency)
      if (error instanceof mongoose.Error.VersionError && retryCount > 0) {
        console.error(
          `Version conflict, retrying transaction... ${retryCount} attempts left`
        );
        return this.processTransaction(
          walletId,
          type,
          amount,
          reference,
          description,
          retryCount - 1
        );
      }
      await session.abortTransaction(); // Abort transaction on error
      throw error;
    } finally {
      session.endSession(); // End session
    }
  }

  /**
   * Transfers funds between two wallets (sender and receiver).
   *
   * @param {String} senderWalletId - The sender's wallet ID.
   * @param {String} receiverWalletId - The receiver's wallet ID.
   * @param {Number} amount - The amount to transfer.
   * @param {String} sender_reference - Transaction reference for sender.
   * @param {String} receiver_reference - Transaction reference for receiver.
   * @param {String} description - A description of the transfer.
   * @param {String} category - Category of the transfer (e.g., "Funding").
   * @param {Number} retryCount - Retry attempts for handling version conflicts.
   * @returns {Object} - The result of the transfer including wallet and transaction details.
   */
  async transferFunds(
    senderWalletId,
    receiverWalletId,
    amount,
    sender_reference,
    receiver_reference,
    description,
    category,
    retryCount = 3
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // STEP 1: Fetch sender and receiver wallets
      const senderWallet = await Wallet.findById(senderWalletId)
        .session(session)
        .exec();
      const receiverWallet = await Wallet.findById(receiverWalletId)
        .session(session)
        .exec();

      if (!senderWallet || !receiverWallet) {
        throw new Error("Wallet not found");
      }

      // STEP 2: Check if sender has enough balance
      if (senderWallet.balance < amount) {
        throw new Error("Insufficient balance");
      }

      // STEP 3: Perform balance transfer
      senderWallet.balance -= amount;
      senderWallet.prevbalance = senderWallet.balance + amount;

      receiverWallet.balance += amount;
      receiverWallet.prevbalance = receiverWallet.balance - amount;

      // STEP 4: Create transaction records for both sender and receiver
      let tid = new mongoose.Types.ObjectId();
      const senderTransaction = new Transaction({
        _id: tid,
        walletId: senderWalletId,
        type: "Withdrawal",
        amount,
        description,
        category: "Withdraw",
        status: "Completed",
        reference: sender_reference,
      });

      tid = new mongoose.Types.ObjectId();
      const receiverTransaction = new Transaction({
        _id: tid,
        walletId: receiverWalletId,
        type: "Deposit",
        amount,
        description,
        category: "Funding",
        status: "Completed",
        reference: receiver_reference + "2",
      });

      // STEP 5: Save the wallet and transaction data
      senderWallet.transactions.push(senderTransaction._id);
      receiverWallet.transactions.push(receiverTransaction._id);

      await senderWallet.save({ session });
      await receiverWallet.save({ session });
      await senderTransaction.save({ session });
      await receiverTransaction.save({ session });

      // STEP 6: Commit the transaction
      await session.commitTransaction();
      return {
        senderWallet,
        receiverWallet,
        senderTransaction,
        receiverTransaction,
        status: "success",
      };
    } catch (error) {
      // Retry transaction if version conflict occurs
      if (error instanceof mongoose.Error.VersionError && retryCount > 0) {
        console.error(
          `Version conflict, retrying transfer... ${retryCount} attempts left`
        );
        return this.transferFunds(
          senderWalletId,
          receiverWalletId,
          amount,
          sender_reference,
          receiver_reference,
          description,
          retryCount - 1
        );
      }
      await session.abortTransaction(); // Abort transaction on error
      throw error;
    } finally {
      session.endSession(); // End session
    }
  }

  /**
   * Retrieves all transactions for a wallet, sorted by the most recent first.
   *
   * @param {String} walletId - The wallet's ID.
   * @returns {Array} - List of transactions for the wallet.
   */
  async getTransactions(walletId) {
    return await Transaction.find({ walletId }).sort({ createdAt: -1 });
  }
}

module.exports = new WalletService();
