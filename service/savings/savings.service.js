// services/fixedSavingsService.js
const Savings = require("../../models/Savings");

const createSavings = async (data) => {
  try {
    const { initialDeposit, aimValue } = data;

    // Initialize total savings with the initial deposit
    const totalSavings = initialDeposit;

    // Calculate savings percentage
    const savingsPercentage = (totalSavings / aimValue) * 100;
    const status = "active";

    // Add initial deposit to history
    const savingDepositHistory = [{ amount: initialDeposit, date: new Date() }];

    const savingsData = {
      ...data,
      totalSavings,
      status,
      savingsPercentage,
      savingDepositHistory,
    };

    return await Savings.create(savingsData);
  } catch (error) {
    throw error;
  }
};

const getAllSavings = async () => {
  try {
    return await Savings.find();
  } catch (error) {
    throw error;
  }
};

const getSavingsByUser = async (userId) => {
  try {
    return await Savings.find({ userId,status:"active" }).sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

const getSavingsById = async (id) => {
  try {
    return await Savings.findById(id);
  } catch (error) {
    throw error;
  }
};

const updateSavings = async (id, data) => {
  try {
    return await Savings.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    throw error;
  }
};

const deleteSavings = async (id) => {
  try {
    return await Savings.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};

const withdrawSavings = async (id, amount) => {
  try {
    const savings = await Savings.findById(id);
    if (!savings) throw new Error("Fixed savings not found");
    console.log(savings.totalSavings ,amount)

    // Check if the withdrawal amount is less than or equal to the total savings
    if (parseFloat(savings.totalSavings) - parseFloat(amount) < 0) {
      throw new Error("Insufficient funds");
    }
    savings.status = "paid";
    // Update total savings
    savings.totalSavings -= parseFloat(amount);
    // Update withdrawal history
    savings.savingWithdrawalHistory.push({ date: new Date(), amount: amount });

    // Update savings percentage
    savings.savingsPercentage =
      (savings.totalSavings / parseFloat(savings.aimValue)) * 100;

    return await savings.save();
  } catch (error) {
    throw error;
  }
};

const addDeposit = async (id, amount) => {
  try {
    const savings = await Savings.findById(id);
    if (!savings) throw new Error("Fixed savings not found");

    // Update total savings
    savings.totalSavings += parseFloat(amount);
    // Update deposit history
    savings.savingDepositHistory.push({ date: new Date(), amount });

    console.log(savings.aimValue);
    // Update savings percentage
    savings.savingsPercentage =
      (savings.totalSavings / parseFloat(savings.aimValue)) * 100;

    return await savings.save();
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createSavings,
  getAllSavings,
  getSavingsById,
  updateSavings,
  deleteSavings,
  addDeposit,
  getSavingsByUser,
  withdrawSavings,
};
