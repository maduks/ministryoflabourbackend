const express = require("express");
const serviceProviderController = require("../../controllers/ServiceProviders/servicesController");
const {
  getProfileValidation,
  updateProfileValidation,
  deactivateUserAccountValidation,
  activateUserAccountValidation,
} = require("../../middleware/validateRequest");
const router = express.Router();

// Get user's profile
router.post("/create", serviceProviderController.createServiceProvider);
router.post(
  "/create/category",
  serviceProviderController.createServiceProviderCategory
);
router.get(
  "/retrieve/category",
  serviceProviderController.getServiceProviderCategory
);
router.get("/:id", serviceProviderController.getServiceProviderById);
router.get("/user/:id", serviceProviderController.getServiceProviderByUserId);
router.patch("/:id/set-featured", serviceProviderController.setFeatured);

module.exports = router;
