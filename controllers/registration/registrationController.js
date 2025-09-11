const RegistrationService = require("../../service/registration/registration.service");
const TokenService = require("../../service/token/token.service");
const { User } = require("../../models/User");
const ReferralService = require("../../service/referral/referallService");
const userProfileService = require("../../service/userProfile/userProfileService");
const sendMail = require("../../utils/emails");
const { generateNumericCode } = require("../../helpers/verificationCode");
const JWTAUTH = require("../../middleware/jwtAuthMiddleware");
const passwordHash = require("../../utils/passwordHash");
const crypto = require("crypto");
const { Agent } = require("../../models/Agent");
const { validationResult } = require("express-validator");
const {
  encodeObjectIdToBase62,
  decodeBase62ToObjectId,
} = require("../../utils/referalEncrypt");
class RegisterController {
  constructor() {
    this.tokenService = new TokenService();
  }
  async registerUser(req, res) {
    try {
      const tokenService = new TokenService();
      //destructure request body
      let { fullName, email, password, phoneNumber, ministry, lga, state } =
        req.body;

      if (phoneNumber === "00000000000") {
        // Generate a random 11-digit phone number starting with a non-zero digit
        phoneNumber = Array.from({ length: 11 }, (_, i) =>
          i === 0
            ? Math.floor(Math.random() * 9) + 1
            : Math.floor(Math.random() * 10)
        ).join("");
      }

      const errors = validationResult(req);

      // if there is error then return Error
      if (!errors.isEmpty()) {
        // Create an object to store the first error for each field
        const firstErrorForField = {};

        // Loop through the errors array
        errors.array().forEach((error) => {
          if (!firstErrorForField[error.path]) {
            firstErrorForField[error.path] = error.msg;
          }
        });

        return res.status(400).json({ errors: firstErrorForField });
      }
      //Hash Password
      password = await passwordHash.hashPassword(password);
      const userService = new RegistrationService();

      //check if user exists already!
      const isuser = await userService.checkUserExist(email, phoneNumber);

      if (isuser) {
        return res
          .status(400)
          .json({ errors: "User already exist...", status: 400 });
      }

      const newUser = await userService.saveUser({
        email,
        password,
        phoneNumber,
        isverified: req?.body?.isverified || false,
        isKYCVerified: false,
        fullName,
        ministry,
        lga,
        state,
        role: req.body.role || "user",
      });

      if (req.body.role === "agent") {
        const agent = {
          user: newUser._id,
          ministry: newUser.ministry,
          state: newUser.state,
          submissions: 0,
          approvedsubmissions: 0,
          assignedLga: newUser.lga,
          assignedwards: newUser.wards,
          isActive: false,
          createdAt: new Date(),
          __v: 0,
        };
        await Agent.create(agent);
      }

      if (!newUser) {
        return res.status(200).json({ errors: newUser });
      }

      const token = await JWTAUTH.getAccessToken(newUser._id);
      //generate code for verification
      const veri_code = generateNumericCode();
      //generate a hash token
      const hash_crypt = crypto.randomBytes(32).toString("hex");
      //get token model parameter
      const verifyUsertokenData = {
        userId: newUser._id.toString(),
        token: hash_crypt,
        code: veri_code,
      };

      //User verification Token
      await tokenService.saveToken(verifyUsertokenData);

      //prepare email link url
      const message = `Your verification code is ${veri_code}. Kindly ignore this message if you did not request to verify your account.`;
      await sendMail(newUser.email, "Email Verification", message);
      res.status(201).json({
        status: "success",
        data: { newUser },
        token: token,
        message:
          "User registration successful. Check email for verification Code.",
      });
    } catch (error) {
      res.status(400).json({ errors: error.message });
      console.error("Error while creating user");
    }
  }
  async verifyUser(req, res) {
    try {
      const errors = validationResult(req);

      // if there is error then return Error
      if (!errors.isEmpty()) {
        // Create an object to store the first error for each field
        const firstErrorForField = {};

        // Loop through the errors array
        errors.array().forEach((error) => {
          if (!firstErrorForField[error.path]) {
            firstErrorForField[error.path] = error.msg;
          }
        });

        return res.status(400).json({ errors: firstErrorForField });
      }
      const tokenService = new TokenService();
      const { userID, veri_code } = req.body;
      const verifiedUser = await tokenService.verifyUser(userID, veri_code);
      console.log(verifiedUser.errors);
      if (verifiedUser.errors)
        return res.status(400).json({ errors: verifiedUser.errors });
      res
        .status(200)
        .json({ message: "Account verified sucessfully!", status: "success" });
    } catch (err) {
      console.error("Error while verifying user" + err);
      res.status(400).send("An error occured" + err);
    }
  }
}
module.exports = RegisterController;
