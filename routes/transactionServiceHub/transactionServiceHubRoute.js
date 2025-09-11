const express = require("express");
const router = express.Router();
const transactionServiceHubController = require("../../controllers/TransactionServiceHub/transactionServiceHubController");
const jwtAuthMiddleware = require("../../middleware/jwtAuthMiddleware");
//const jwtAdminAuthMiddleware = require("../../middleware/jwtAdminAuthMiddleware");

// Public routes (if any)
// router.get("/public/transaction/:transactionId", transactionServiceHubController.getTransactionById);

// Protected routes (require authentication)
//router.use(jwtAuthMiddleware);

// Get transactions by user ID
router.post(
  "/user/:userId",
  transactionServiceHubController.getTransactionsByUserId
);

// Get transactions by ministry using profession and category
router.post(
  "/ministry",
  transactionServiceHubController.getTransactionsByMinistry
);

// Get transaction statistics for a user
router.get(
  "/user/:userId/stats",
  transactionServiceHubController.getTransactionStats
);

// Get a single transaction by ID
router.get(
  "/:transactionId",
  transactionServiceHubController.getTransactionById
);

// Create a new transaction
router.post("/", transactionServiceHubController.createTransaction);

// Update transaction status
router.patch(
  "/:transactionId/status",
  transactionServiceHubController.updateTransactionStatus
);

// Mark transaction as successful
router.patch(
  "/:transactionId/successful",
  transactionServiceHubController.markTransactionSuccessful
);

// Mark transaction as failed
router.patch(
  "/:transactionId/failed",
  transactionServiceHubController.markTransactionFailed
);

// Admin routes (require admin authentication)
//router.use(jwtAdminAuthMiddleware);

// Get all transactions (admin only)
router.get("/", transactionServiceHubController.getAllTransactions);

module.exports = router;
