const express = require("express");
const router = express.Router();
const tradeTestController = require("../../controllers/TradeTests/tradeTestController");

// Create a new trade test
router.post("/create", tradeTestController.createTradeTest);

// Get all trade tests with filtering
router.get("/list", tradeTestController.getAllTradeTests);

// Get a single trade test by ID
router.get("/:id", tradeTestController.getTradeTestById);

// Update a trade test
router.put("/:id", tradeTestController.updateTradeTest);

// Delete a trade test
router.delete("/:id", tradeTestController.deleteTradeTest);

module.exports = router;
