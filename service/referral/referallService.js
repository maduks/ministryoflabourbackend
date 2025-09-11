// services/referralService.js
const Referral = require("../../models/Referral");
const ReferralEarnings = require("../../models/ReferralEarning");
const { Transaction } = require("../../models/Transaction");
const walletService = require("../wallet/walletService");
const mongoose = require("mongoose");

class ReferralService {
  // Create a new referral
  static async createReferral(referrerId, user_ID) {
    const existingReferral = await Referral.findOne({ userID: user_ID });
    if (existingReferral) {
      return "Referral already exists.";
    }

    const referral = new Referral({
      referredBy: referrerId,
      userID: user_ID,
      referredUsers: [],
      status: "recurring", // Set status to 'recurring' for multiple earnings
    });
    await referral.save();
    return referral;
  }
  static async updateReferredUsers(userID, referredUser) {
    try {
      // Find the referral document and push the new user ID into the referredUsers array
      const updatedReferral = await Referral.findByIdAndUpdate(
        userID,
        {
          $set: { userID: userID, status: "recurring" }, // Set userID and status
          $push: { referredUsers: referredUser }, // Push the new referred user
        },
        { new: true, upsert: true, useFindAndModify: false } // `new: true` returns the updated document
      );

      if (!updatedReferral) {
        console.error("Referral not found");
        return false;
      }
      return true;

      // console.log('Updated Referral:', updatedReferral);
    } catch (error) {
      console.error("Error updating referred users:", error);
    }
  }

  // Process referral earnings - this method is called every time the referee makes a transaction
  static async processReferralEarnings(refereeId, amount, transactionId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const referral = await Referral.findOne({
        userID: refereeId,
        status: "recurring",
      }).session(session);
      
      if (!referral) {
        return "Referral not found.";
      }
  
      if (!referral.referredBy) {
        return "No active referral found.";
      }
  
      const referrer = referral.referredBy;
      const referee = referral.userID;
  
      // Calculate earnings (e.g., 5% of the referred user's transaction)
      const earnings = parseFloat(amount) * 0.005;
  
      // Update the referral's total earnings
      referral.earnings += earnings;
      await referral.save({ session });
  
      // Create a referral earning history entry for this transaction
      const referralEarning = new ReferralEarnings({
        referrer: referrer,
        referee: referee,
        amountEarned: earnings,
        transactionId: transactionId,
      });
  
      await referralEarning.save({ session });
  
      let wallet = await walletService.getWalletByUserId(referrer);
      if (!wallet) {
        throw new Error("Wallet not found for referrer");
      }
  
      // Update the referrer's balance
      wallet.balance += parseFloat(earnings);
      wallet.prevbalance = wallet.balance;
      await wallet.save({ session });
  
      const tid = new mongoose.Types.ObjectId(); // Generate unique transaction ID
      wallet.transactions.push(tid); // Add transaction ID to wallet's transactions list
      const tran = new Transaction({
        _id: tid,
        walletId: wallet._id,
        type: "Deposit",
        amount: earnings,
        fee: 0,
        status: "Completed", // Initial status set to "Pending"
        description: "Referral earnings",
        totalamount: earnings,
        commission: 0,
        category: "Deposit",
        banktransactions: null, // Add bank transaction details (if any)
        billstransactions: null, // Add bills transaction details (if any)
        reference: `txn_${Date.now()}`,
      });
  
      await tran.save({ session });
  
      await session.commitTransaction();
  
      return {
        referrer: referrer,
        referee: referee,
        earnings,
        totalEarnings: referral.earnings,
      };
    } catch (error) {
      await session.abortTransaction(); // Abort transaction on error
      console.error("Transaction failed:", error);
    } finally {
      session.endSession(); // End the session
    }
  }
  
  // static async processReferralEarnings(refereeId, amount, transactionId) {
  //   const session = await mongoose.startSession();
  //   session.startTransaction();
  //   try {
  //     const referral = await Referral.findOne({
  //       userID: refereeId,
  //       status: "recurring",
  //     }).session(session);
  //     if (!referral.referredBy) {
  //       return "No active referral found.";
  //     }

  //     const referrer = referral.referredBy;
  //     const referee = referral.userID;

  //     // Calculate earnings (e.g., 5% of the referred user's transaction)
  //     const earnings = parseFloat(amount) * 0.005;

  //     // Update the referral's total earnings, but keep status as 'recurring'
  //     referral.earnings += earnings;
  //     await referral.save({ session });

  //     // Create a referral earning history entry for this transaction
  //     const referralEarning = new ReferralEarnings({
  //       referrer: referrer,
  //       referee: referee,
  //       amountEarned: earnings,
  //       transactionId: transactionId,
  //     });

  //     await referralEarning.save({ session });

  //     let wallet = await walletService.getWalletByUserId(referrer);

  //     // Update the referrer's balance
  //     wallet.balance += parseFloat(earnings);
  //     wallet.prevbalance = wallet.balance;
  //     wallet.save({ session });

  //     const tid = new mongoose.Types.ObjectId(); // Generate unique transaction ID
  //     wallet.transactions.push(tid); // Add transaction ID to wallet's transactions list
  //     const tran = new Transaction({
  //       _id: tid,
  //       walletId: wallet._id,
  //       type: "Deposit",
  //       amount: earnings,
  //       fee: 0,
  //       status: "Completed", // Initial status set to "Pending"
  //       description: "Referral earnings",
  //       totalamount: earnings,
  //       commission: 0,
  //       category: "Deposit",
  //       banktransactions: null, // Add bank transaction details (if any)
  //       billstransactions: null, // Add bills transaction details (if any)
  //       reference: `txn_${Date.now()}`,
  //     });

  //     tran.save({ session });

  //     await session.commitTransaction();

  //     return {
  //       referrer: referrer,
  //       referee: referee,
  //       earnings,
  //       totalEarnings: referral.earnings,
  //     };
  //   } catch (error) {
  //     await session.abortTransaction(); // Abort transaction on error
  //     console.error("Transaction failed:", error);
  //   } finally {
  //     session.endSession(); // End the session
  //   }
  // }

  // Get all referral earnings for a user
  static async getReferralEarningsByUser(userId) {
    return await ReferralEarnings.find({ referrer: userId }).populate(
      "referee transactionId"
    );
  }

  // Get referrals by user
  static async getReferralsByUser(userId) {
    return await Referral.find({ referrer: userId }).populate("referee");
  }
}

module.exports = ReferralService;
