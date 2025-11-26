const express = require("express");
const router = express.Router();
const tradeTestController = require("../../controllers/TradeTests/tradeTestController");
const questionController = require("../../controllers/TradeTests/questionController");

// Create a new trade test
router.post("/create", tradeTestController.createTradeTest);

// Get all trade tests with filtering
router.get("/list", tradeTestController.getAllTradeTests);

// Question routes - must come before /:id route to avoid conflicts
// Update a question (must come before /:testId/questions to avoid conflicts)
router.put("/questions/:questionId", questionController.updateQuestion);

// Delete a question (must come before /:testId/questions to avoid conflicts)
router.delete("/questions/:questionId", questionController.deleteQuestion);

// Get a single question by ID (must come before /:testId/questions to avoid conflicts)
router.get("/questions/:questionId", questionController.getQuestionById);

// Bulk import questions (must come before /:testId/questions)
router.post("/:testId/questions/bulk", questionController.bulkImportQuestions);

// Create a new question for a test
router.post("/:testId/questions", questionController.createQuestion);

// Get all questions for a test
router.get("/:testId/questions", questionController.getQuestionsByTestId);

// Get a single trade test by ID
router.get("/:id", tradeTestController.getTradeTestById);

// Update a trade test
router.put("/:id", tradeTestController.updateTradeTest);

// Delete a trade test
router.delete("/:id", tradeTestController.deleteTradeTest);

module.exports = router;
