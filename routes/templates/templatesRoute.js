const express = require("express");
const router = express.Router();
const templatesController = require("../../controllers/Templates/templatesController");

// Public routes (if any)
// router.get("/public/templates", templatesController.getAllTemplates);

// Protected routes (require authentication)

// Get all templates
router.get("/", templatesController.getAllTemplates);

// Get template by ID
router.get("/:templateId", templatesController.getTemplateById);

// Get templates by type
router.get("/type/:templateType", templatesController.getTemplatesByType);

// Get templates by cost range
router.get(
  "/cost/:minCost/:maxCost",
  templatesController.getTemplatesByCostRange
);

// Get template statistics
router.get("/stats/overview", templatesController.getTemplateStats);

// Admin routes (require admin authentication)

// Create new template (admin only)
router.post("/", templatesController.createTemplate);

// Update template (admin only)
router.put("/:templateId", templatesController.updateTemplate);

// Delete template (admin only)
router.delete("/:templateId", templatesController.deleteTemplate);

module.exports = router;
