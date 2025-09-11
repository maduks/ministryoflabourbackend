const TransactionServiceHub = require("../../models/TransactionServiceHub");
const { User } = require("../../models/User");
const mongoose = require("mongoose");

class TransactionServiceHubService {
  /**
   * Get transactions by user ID with pagination and filtering
   */
  async getTransactionsByUserId(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        paymentMethod,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "desc",
        profession,
        category,
      } = options;

      // Build query
      const query = { userId };

      if (status) {
        query.status = status;
      }

      if (paymentMethod) {
        query.paymentMethod = paymentMethod;
      }

      if (startDate || endDate) {
        query.paymentDate = {};
        if (startDate) {
          query.paymentDate.$gte = new Date(startDate);
        }
        if (endDate) {
          query.paymentDate.$lte = new Date(endDate);
        }
      }

      // Add metadata filtering for profession and category
      if (profession) {
        query["metadata.profession"] = profession;
      }
      if (category) {
        query["metadata.category"] = category;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Calculate skip
      const skip = (page - 1) * limit;

      // Execute query with population
      const transactions = await TransactionServiceHub.find(query)
        .populate("userId", "fullName email phoneNumber")
        .populate("submissionId", "category profession status")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const total = await TransactionServiceHub.countDocuments(query);

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }
  }

  /**
   * Get a single transaction by ID
   */
  async getTransactionById(transactionId) {
    try {
      const transaction = await TransactionServiceHub.findById(transactionId)
        .populate("userId", "fullName email phoneNumber")
        .populate("submissionId", "category profession status");

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      return transaction;
    } catch (error) {
      throw new Error(`Error fetching transaction: ${error.message}`);
    }
  }

  /**
   * Get transaction statistics for a user
   */
  async getTransactionStats(userId) {
    try {
      const stats = await TransactionServiceHub.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
            successfulTransactions: {
              $sum: { $cond: [{ $eq: ["$status", "successful"] }, 1, 0] },
            },
            successfulAmount: {
              $sum: {
                $cond: [{ $eq: ["$status", "successful"] }, "$amount", 0],
              },
            },
            pendingTransactions: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            failedTransactions: {
              $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
            },
          },
        },
      ]);

      return (
        stats[0] || {
          totalTransactions: 0,
          totalAmount: 0,
          successfulTransactions: 0,
          successfulAmount: 0,
          pendingTransactions: 0,
          failedTransactions: 0,
        }
      );
    } catch (error) {
      throw new Error(`Error fetching transaction stats: ${error.message}`);
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(transactionId, status, errorMessage = null) {
    try {
      const transaction = await TransactionServiceHub.findById(transactionId);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      transaction.status = status;
      transaction.processedDate = new Date();

      if (errorMessage) {
        transaction.errorMessage = errorMessage;
      }

      await transaction.save();
      return transaction;
    } catch (error) {
      throw new Error(`Error updating transaction status: ${error.message}`);
    }
  }

  /**
   * Create a new transaction
   */
  async createTransaction(transactionData) {
    try {
      const transaction = new TransactionServiceHub(transactionData);
      await transaction.save();
      return transaction;
    } catch (error) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }
  }

  /**
   * Get all transactions with filtering and pagination
   */
  async getAllTransactions(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        paymentMethod,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      // Build query
      const query = {};

      if (status) {
        query.status = status;
      }

      if (paymentMethod) {
        query.paymentMethod = paymentMethod;
      }

      if (startDate || endDate) {
        query.paymentDate = {};
        if (startDate) {
          query.paymentDate.$gte = new Date(startDate);
        }
        if (endDate) {
          query.paymentDate.$lte = new Date(endDate);
        }
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Calculate skip
      const skip = (page - 1) * limit;

      // Execute query
      const transactions = await TransactionServiceHub.find(query)
        .populate("userId", "fullName email phoneNumber")
        .populate("submissionId", "category profession status")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count
      const total = await TransactionServiceHub.countDocuments(query);

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }
  }

  /**
   * Get transactions by ministry using metadata.profession and metadata.category
   */
  async getTransactionsByMinistry(
    profession,
    category,
    options = {},
    ministry
  ) {
    try {
      const {
        page = 1,
        limit = 50,
        status,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      // Build query
      const query = {};

      // Add metadata filtering for profession and category
      if (profession) {
        query["metadata.profession"] = profession;
      }
      if (category) {
        query["metadata.category"] = category;
      }

      // Add status filter if provided
      if (status) {
        query.status = status;
      }

      if (ministry) {
        query.ministry = ministry;
      }

      // Add date range filter if provided
      if (startDate || endDate) {
        query.paymentDate = {};
        if (startDate) {
          query.paymentDate.$gte = new Date(startDate);
        }
        if (endDate) {
          query.paymentDate.$lte = new Date(endDate);
        }
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      // Execute query
      const transactions = await TransactionServiceHub.find(query)
        .populate("userId", "fullName email phoneNumber")
        .populate("submissionId", "category profession status")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const total = await TransactionServiceHub.countDocuments(query);

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(
        `Error fetching transactions by ministry: ${error.message}`
      );
    }
  }
}
module.exports = new TransactionServiceHubService();
