const express = require("express");
const router = express.Router();
const auditLogController = require("../controllers/Audits/auditLogController");

// Get all audit logs
router.get("/", auditLogController.getAll);

// Get a single audit log by ID
router.get("/:id", auditLogController.getById);

// Create a new audit log
router.post("/", auditLogController.create);

// Delete an audit log by ID
router.delete("/:id", auditLogController.delete);

module.exports = router;
