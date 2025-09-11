const express = require("express");
const router = express.Router();

const {
  userRegDataValidation,
  userVerificationValidation,
} = require("../middleware/validateRequest");
const RegisterController = require("../controllers/registration/registrationController");
const regController = new RegisterController();
router.post("/register", userRegDataValidation, regController.registerUser);
router.post("/verify", userVerificationValidation, regController.verifyUser);
module.exports = router;
