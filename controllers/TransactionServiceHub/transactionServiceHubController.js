const transactionServiceHubService = require("../../service/transactionServiceHub/transactionServiceHubService");

class TransactionServiceHubController {
  /**
   * Get transactions by user ID
   */
  async getTransactionsByUserId(req, res) {
    try {
      const { userId } = req.params;
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
      } = req.body;

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        paymentMethod,
        startDate,
        endDate,
        sortBy,
        sortOrder,
        profession,
        category,
      };

      const result = await transactionServiceHubService.getTransactionsByUserId(
        userId,
        options
      );

      return res.status(200).json({
        success: true,
        message: "Transactions retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in getTransactionsByUserId:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get transactions by ministry using profession and category
   */
  async getTransactionsByMinistry(req, res) {
    try {
      const { profession, category, ministry } = req.body;
      const {
        page = 1,
        limit = 50,
        status,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Validate required parameters
      if (!ministry) {
        return res.status(400).json({
          success: false,
          message: "At least one ministry is required",
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      };

      const result =
        await transactionServiceHubService.getTransactionsByMinistry(
          profession,
          category,
          options,
          ministry
        );

      return res.status(200).json({
        success: true,
        message: "Transactions by ministry retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in getTransactionsByMinistry:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get a single transaction by ID
   */
  async getTransactionById(req, res) {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res
          .status(400)
          .json({ success: false, message: "Transaction ID is required" });
      }

      const transaction = await transactionServiceHubService.getTransactionById(
        transactionId
      );

      return res.status(200).json({
        success: true,
        message: "Transaction retrieved successfully",
        data: transaction,
      });
    } catch (error) {
      console.error("Error in getTransactionById:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get transaction statistics for a user
   */
  async getTransactionStats(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });
      }

      const stats = await transactionServiceHubService.getTransactionStats(
        userId
      );

      return res.status(200).json({
        success: true,
        message: "Transaction statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Error in getTransactionStats:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(req, res) {
    try {
      const { transactionId } = req.params;
      const { status, errorMessage } = req.body;

      if (!transactionId) {
        return res
          .status(400)
          .json({ success: false, message: "Transaction ID is required" });
      }

      if (!status) {
        return res
          .status(400)
          .json({ success: false, message: "Status is required" });
      }

      const validStatuses = ["pending", "successful", "failed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Must be one of: pending, successful, failed, cancelled",
        });
      }

      const transaction =
        await transactionServiceHubService.updateTransactionStatus(
          transactionId,
          status,
          errorMessage
        );

      return res.status(200).json({
        success: true,
        message: "Transaction status updated successfully",
        data: transaction,
      });
    } catch (error) {
      console.error("Error in updateTransactionStatus:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Create a new transaction
   */
  async createTransaction(req, res) {
    try {
      const transactionData = req.body;

      // Validate required fields
      const requiredFields = [
        "userId",
        "submissionId",
        "amount",
        "reference",
        "paymentMethod",
      ];
      for (const field of requiredFields) {
        if (!transactionData[field]) {
          return res
            .status(400)
            .json({ success: false, message: `${field} is required` });
        }
      }

      // Validate payment method
      const validPaymentMethods = [
        "card",
        "bank_transfer",
        "wallet",
        "cash",
        "online",
      ];
      if (!validPaymentMethods.includes(transactionData.paymentMethod)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid payment method" });
      }

      const transaction = await transactionServiceHubService.createTransaction(
        transactionData
      );

      return res.status(201).json({
        success: true,
        message: "Transaction created successfully",
        data: transaction,
      });
    } catch (error) {
      console.error("Error in createTransaction:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get all transactions (admin endpoint)
   */
  async getAllTransactions(req, res) {
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
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        paymentMethod,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      };

      const result = await transactionServiceHubService.getAllTransactions(
        options
      );

      return res.status(200).json({
        success: true,
        message: "Transactions retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in getAllTransactions:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Mark transaction as successful
   */
  async markTransactionSuccessful(req, res) {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res
          .status(400)
          .json({ success: false, message: "Transaction ID is required" });
      }

      const transaction =
        await transactionServiceHubService.updateTransactionStatus(
          transactionId,
          "successful"
        );

      return res.status(200).json({
        success: true,
        message: "Transaction marked as successful",
        data: transaction,
      });
    } catch (error) {
      console.error("Error in markTransactionSuccessful:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Mark transaction as failed
   */
  async markTransactionFailed(req, res) {
    try {
      const { transactionId } = req.params;
      const { errorMessage } = req.body;

      if (!transactionId) {
        return res
          .status(400)
          .json({ success: false, message: "Transaction ID is required" });
      }

      const transaction =
        await transactionServiceHubService.updateTransactionStatus(
          transactionId,
          "failed",
          errorMessage
        );

      return res.status(200).json({
        success: true,
        message: "Transaction marked as failed",
        data: transaction,
      });
    } catch (error) {
      console.error("Error in markTransactionFailed:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TransactionServiceHubController();
