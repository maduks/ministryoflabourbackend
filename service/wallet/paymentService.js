const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const fetchFromAPI = require("../apicalls/fetchFromAPI")
// Simulate third-party API call for bill payment
const simulateThirdPartyAPICall = async (data) => {
  return new Promise((resolve, reject) => {
    // Simulate a successful response after 2 seconds
    setTimeout(() => {
      resolve({ success: true, message: 'Payment processed successfully' });
    }, 2000);
  });
};

const processBillPayment = async (userId, data) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Step 1: Fetch user and check balance
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');
    if (user.walletBalance < amount) throw new Error('Insufficient balance');

    // Step 2: Create a pending transaction
    const transaction = new Transaction({
      userId: user._id,
      amount,
      status: 'pending'
    });
    await transaction.save({ session });

    // Step 3: Debit user wallet
    user.walletBalance -= amount;
    await user.save({ session });

    // Step 4: Simulate third-party API call
    const apiResponse = await fetchFromAPI(data);
    if (!apiResponse.success) {
      throw new Error('Third-party payment failed');
    }

    // Step 5: Update transaction to success
    transaction.status = 'success';
    await transaction.save({ session });

    // Step 6: Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return { success: true, transaction };
  } catch (error) {
    // Step 7: Abort the transaction in case of failure
    await session.abortTransaction();
    session.endSession();
    throw new Error(error.message); // Pass the error message up to the controller
  }
};

module.exports = {
  processBillPayment,
};








