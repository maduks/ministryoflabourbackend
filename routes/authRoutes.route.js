const express = require("express");
const router = express.Router();
const ImageKitController = require("../controllers/Auth/imagekit");
const AuthController = require("../controllers/Auth/authController");
const loginLimiter = require("../middleware/rateLimiter");
const {
  userLoginDataValidation,
  userResetRequestDataValidation,
  userResetVerifyDataValidation,
  userResetDataValidation,
} = require("../middleware/validateRequest");
router.post("/checkjwt", AuthController.checkJWT);
router.post(
  "/login",
  userLoginDataValidation,
  loginLimiter,
  AuthController.SignIn
);

router.post(
  "/adminlogin",
  userLoginDataValidation,
  loginLimiter,
  AuthController.AdminSignIn
);
router.post("/checkbvn", AuthController.CheckBvn);
router.post(
  "/reset-password-request",
  userResetRequestDataValidation,
  AuthController.ResetPasswordRequest
);
router.post("/getUserByEmail", AuthController.getUserByEmail);
router.post(
  "/resend-verify-code",
  userResetRequestDataValidation,
  AuthController.ResendVerifyCode
);
router.post(
  "/reset-password-verify",
  userResetVerifyDataValidation,
  AuthController.ResetPasswordVerifyToken
);
router.post("/checkjwt", AuthController.checkJWT);
router.post(
  "/reset-password",
  userResetDataValidation,
  AuthController.ResetPassword
);
router.post("/imagekit/auth", ImageKitController.imageKit);
module.exports = router;
