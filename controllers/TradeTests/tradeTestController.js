const tradeTestService = require("../../service/tradeTests/tradeTest.service");

class TradeTestController {
  /**
   * Create a new trade test
   * POST /api/trade-tests/create
   */
  async createTradeTest(req, res) {
    try {
      const newTest = await tradeTestService.createTradeTest(req.body);

      res.status(201).json({
        success: true,
        data: newTest,
      });
    } catch (error) {
      console.error("Error in createTradeTest controller:", error);

      if (error.message === "Test code already exists") {
        return res.status(400).json({
          success: false,
          message: "Test code already exists",
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to create trade test",
        message: error.message,
      });
    }
  }

  /**
   * Get all trade tests with filtering
   * GET /api/trade-tests/list
   */
  async getAllTradeTests(req, res) {
    try {
      const filters = {
        ministryId: req.query.ministryId,
        status: req.query.status,
        category: req.query.category,
      };

      // Remove undefined filters
      Object.keys(filters).forEach(
        (key) => filters[key] === undefined && delete filters[key]
      );

      const tests = await tradeTestService.getAllTradeTests(filters);

      res.status(200).json({
        success: true,
        data: tests,
      });
    } catch (error) {
      console.error("Error in getAllTradeTests controller:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get trade tests",
        message: error.message,
      });
    }
  }

  /**
   * Get a single trade test by ID
   * GET /api/trade-tests/:id
   */
  async getTradeTestById(req, res) {
    try {
      const test = await tradeTestService.getTradeTestById(req.params.id);

      if (!test) {
        return res.status(404).json({
          success: false,
          message: "Trade test not found",
        });
      }

      res.status(200).json({
        success: true,
        data: test,
      });
    } catch (error) {
      console.error("Error in getTradeTestById controller:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get trade test",
        message: error.message,
      });
    }
  }

  /**
   * Update a trade test
   * PUT /api/trade-tests/:id
   */
  async updateTradeTest(req, res) {
    try {
      const updatedTest = await tradeTestService.updateTradeTest(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        data: updatedTest,
      });
    } catch (error) {
      console.error("Error in updateTradeTest controller:", error);

      if (error.message === "Trade test not found") {
        return res.status(404).json({
          success: false,
          message: "Trade test not found",
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to update trade test",
        message: error.message,
      });
    }
  }

  /**
   * Delete a trade test
   * DELETE /api/trade-tests/:id
   */
  async deleteTradeTest(req, res) {
    try {
      await tradeTestService.deleteTradeTest(req.params.id);

      res.status(200).json({
        success: true,
        message: "Trade test deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteTradeTest controller:", error);

      if (error.message === "Trade test not found") {
        return res.status(404).json({
          success: false,
          message: "Trade test not found",
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to delete trade test",
        message: error.message,
      });
    }
  }
}

module.exports = new TradeTestController();
