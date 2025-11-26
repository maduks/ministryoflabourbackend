const express = require("express");
const userProfileController = require("../controllers/UsersProfile/userProfileController");
const userDetailsController = require("../controllers/UsersProfile/userDetailsController");
const {
  getProfileValidation,
  updateProfileValidation,
  deactivateUserAccountValidation,
  activateUserAccountValidation,
} = require("../middleware/validateRequest");
const router = express.Router();

// Get basic user details (name, email, etc.) - must come before /:id route
router.get("/details/:userId", userDetailsController.getUserDetails);
router.get("/details/bulk", userDetailsController.getUsersDetailsBulk);
router.post("/details/bulk", userDetailsController.getUsersDetailsBulk);

// Get user's profile
router.get("/:id", getProfileValidation, userProfileController.getUserProfile);
// Get Admin user's profile
router.post("/adminusers", userProfileController.getAdminUserProfile);
router.post("/allusers", userProfileController.getAllUsers);
router.post("/ministries", userProfileController.getMinistryUsers);
router.post("/agents", userProfileController.getAgentUsers);
router.post("/publicusers", userProfileController.getPublicUsers);
// Update user's profile
router.post(
  "/:id",
  updateProfileValidation,
  userProfileController.updateUserProfile
);

//deactivate user's account
router.post(
  "/deactivate/:id",
  deactivateUserAccountValidation,
  userProfileController.deactivateUserAccount
);

//activate user's account
router.post(
  "/activate/:id",
  activateUserAccountValidation,
  userProfileController.activateUserAccount
);
//check jwt
router.post("/checkjwt", userProfileController.checkJWT);

router.get("/active/total", userProfileController.getTotalActiveUsers);

module.exports = router;
