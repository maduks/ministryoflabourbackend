const express = require("express");
const router = express.Router();
const {
  getSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  getSubmissionsByCategory,
  getSubmissionsByAgent,
  getSubmissionsByMinistry,
  getSubmissionsByUser,
} = require("../controllers/Submission/submissionController");

// Get all submissions with filtering and pagination
router.get("/submissions", getSubmissions);

// Get submission by ID
router.get("/submissions/:id", getSubmissionById);

// Update submission status
router.patch("/submissions/:id/status", updateSubmissionStatus);

// Get submissions by category
router.get("/submissions/category/:category", getSubmissionsByCategory);

// Get submissions by agent (assignedBy)
router.get("/submissions/agent/:agentId", getSubmissionsByAgent);

// Get submissions by user (serviceProviderId)
router.get("/submissions/user/:userId", getSubmissionsByUser);

// Get submissions by ministry
router.get("/submissions/ministry/:ministryId", getSubmissionsByMinistry);

module.exports = router;
