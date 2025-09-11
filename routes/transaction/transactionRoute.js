const express = require("express");
const router = express.Router();
const transactionController = require("../../controllers/TransactionServiceHub/transactionController");
const jwtAuthMiddleware = require("../../middleware/jwtAuthMiddleware");
//const jwtAdminAuthMiddleware = require("../../middleware/jwtAdminAuthMiddleware");

// Protected routes (require authentication)
//router.use(jwtAuthMiddleware);

// Get transactions by wallet ID
router.get("/wallet/:walletId", transactionController.getTransactionByWalletId);

// Get transactions by ministry using profession and category
router.post("/ministry", transactionController.getTransactionByMinistry);

module.exports = router;
