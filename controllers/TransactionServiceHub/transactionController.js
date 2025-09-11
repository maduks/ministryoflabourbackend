const transactionService = require("../../service/transaction/transactionService");

class TransactionController {
  /**
   * Get transactions by wallet ID
   */
  async getTransactionByWalletId(req, res) {
    try {
      const { walletId } = req.params;

      if (!walletId) {
        return res
          .status(400)
          .json({ success: false, message: "Wallet ID is required" });
      }

      const transactions = await transactionService.getTransactionByWalletId(
        walletId
      );

      return res.status(200).json({
        success: true,
        message: "Transactions retrieved successfully",
        data: transactions,
      });
    } catch (error) {
      console.error("Error in getTransactionByWalletId:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get transactions by ministry using profession and category
   */
  async getTransactionByMinistry(req, res) {
    try {
      const { profession, category } = req.body;
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
      if (!profession && !category) {
        return res.status(400).json({
          success: false,
          message: "At least one of profession or category is required",
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

      const result = await transactionService.getTransactionByMinistry(
        profession,
        category,
        options
      );

      return res.status(200).json({
        success: true,
        message: "Transactions by ministry retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in getTransactionByMinistry:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TransactionController();
