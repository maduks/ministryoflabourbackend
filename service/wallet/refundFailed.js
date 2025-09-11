const mongoose = require("mongoose");
const { Wallet } = require("../../models/Wallet");
const { User } = require("../../models/User");
const { Transaction } = require("../../models/Transaction");
const { sendBalanceUpdate } = require("../../utils/socketServer");
const {
  emitTransactionNotification,
} = require("../../events/sendtransactionnotifications");
class FailedTransactions {

  processFailedPayment = async (
    walletId,
    tid,
    amount,
    fee,
    billstransactions,
    transactionId,
    requestId,
    retryCount = 3
  ) => {
    let session;
    try {
      let totalamount = parseFloat(amount) + parseFloat(fee || 0);
      
      // Transaction failed logic
      session = await mongoose.startSession();
      session.startTransaction();
      let wallet = await Wallet.findById(walletId).session(session).exec();

      let updatedBalance = wallet.balance;
      updatedBalance += parseFloat(amount) + parseFloat(fee || 0);
      wallet.prevbalance = wallet.balance; // Record previous balance
      wallet.balance = updatedBalance;

      await Transaction.findOneAndUpdate(
        { _id: tid },
        {
          status: "Failed",
          transactionID: transactionId,
          requestId: requestId,
        },
        { new: true, session }
      );

      const refundTid = new mongoose.Types.ObjectId();

      const transaction =  new  Transaction({
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
          " failed. A refund has already been made.",
        userId: wallet.userId,
      };

      // Emit the transaction notification event
      emitTransactionNotification(notification);

      await wallet.save({ session });
      await transaction.save({ session });
      //Emit wallet balance update event
      sendBalanceUpdate(walletId, wallet.balance);
      await session.commitTransaction();

     
    } catch (error) {
      if (error instanceof mongoose.Error.VersionError && retryCount > 0) {
        console.error(
          `Version conflict, retrying transaction... ${retryCount} attempts left`
        );}
      //console.error("Error processing job:", error);
       // Abort the transaction in case of an error
       if (session) await session.abortTransaction();
    } finally {
      if (session) await session.endSession();
    }
  };
}
module.exports = new FailedTransactions();
