const express = require("express");
const businessController = require("../../controllers/Business/businessController");
const {
  getProfileValidation,
  updateProfileValidation,
  deactivateUserAccountValidation,
  activateUserAccountValidation,
} = require("../../middleware/validateRequest");
const router = express.Router();

// Get user's profile
router.post("/create", businessController.createBusiness);
router.post("/", businessController.getAllBusinesses);
router.patch("/:id/set-featured", businessController.setFeatured);
router.get("/:id", businessController.getBusinessById);
module.exports = router;
