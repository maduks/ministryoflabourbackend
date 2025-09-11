// services/userService.js

const { Transaction } = require("../../models/Transaction");
class TransactionService {
  // Retrieve user profile by ID
  async getTransactionByWalletId(walletId) {
    try {
      const trans = await Transaction.find({ walletId: walletId })
        .limit(50)
        .sort({ createdAt: -1 });
      if (!trans) throw new Error("Transaction not found");
      return trans;
    } catch (error) {
      throw error;
    }
  }

  // Get transactions by ministry using metadata.profession and metadata.category
  async getTransactionByMinistry(profession, category, options = {}) {
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

      // Add date range filter if provided
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      // Execute query
      const transactions = await Transaction.find(query)
        .populate("walletId", "userId balance")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const total = await Transaction.countDocuments(query);

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
module.exports = new TransactionService();
