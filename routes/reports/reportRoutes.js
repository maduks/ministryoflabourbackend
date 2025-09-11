const express = require("express");
const router = express.Router();
const reportController = require("../../controllers/ReportsController/reportController");

// Generate property report
router.get("/properties", reportController.generatePropertyReport);
module.exports = router;
