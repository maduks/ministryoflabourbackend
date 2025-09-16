const Auth = require("../../service/auth/auth");
const JWTAUTH = require("../../middleware/jwtAuthMiddleware");
const auditLog = require("../../utils/AuditLog");
const bcrypt = require("bcryptjs");
const ResetTokenService = require("../../service/token/resettoken.service");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { validationResult } = require("express-validator");
const sendMail = require("../../utils/emails");
const { generateNumericCode } = require("../../helpers/verificationCode");
const crypto = require("crypto");
const passwordHash = require("../../utils/passwordHash");
const axios = require("axios");
const TokenService = require("../../service/token/token.service");
const AuthController = {
  CheckBvn: async (req, res) => {
    try {
      const config = {
        method: "GET",
        url: "https://sandboxapi.fincra.com/profile/business/me",
        headers: {
          "api-key": `8MKrE9ZnKRX5JTStto5laVgflecvhIax`,
          "Content-Type": "application/json",
        },
      };
      const response = await axios(config);

      return res.status(200).json({ msg: response.data });
    } catch (err) {
      return res.status(200).json({ msg: err.status });
    }
  },
  SignIn: async (req, res) => {
    try {
      const auth = new Auth();
      const { email, password } = req.body;

      const user = await auth.getLogin(email);

      console.log(user);

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
        auditLog.log(
          "LOGIN",
          null,
          { name: "USER", id: null },
          "Failed",
          JSON.stringify(firstErrorForField),
          req.ip
        );
        return res.status(400).json({ errors: firstErrorForField });
      }

      if (!user || user == null) {
        auditLog.log(
          "LOGIN",
          null,
          { name: "USER", id: null },
          "Failed",
          "Account does not exist",
          req.ip
        );
        return res.status(401).json({ errors: "Account do not exist" });
      }

      // Check if user account is locked
      if (user?.lockUntil && user?.lockUntil > Date.now()) {
        delete failedLoginAttempts[email];
        const remainingTime = Math.ceil((user?.lockUntil - Date.now()) / 60000); // Convert ms to minutes
        user.failedAttempts = 0;
        user.lockUntil = null;
        user.save();
        auditLog.log(
          "LOGIN",
          user._id,
          { name: "USER", id: user?._id || null },
          "Failed",
          `Account locked. Try again in ${remainingTime} minutes.`,
          req.ip
        );
        return res.status(403).json({
          message: `Account locked. Try again in ${remainingTime} minutes.`,
        });
      }

      //Check if user has too many failed login attemts and lock account for 10mins
      if (failedLoginAttempts[email] && failedLoginAttempts[email] >= 8) {
        user.lockUntil = Date.now() + 3 * 60 * 1000; // Lock for 10 minutes
        user.failedAttempts = 8;
        user.save();
        auditLog.log(
          "Multiple Failed Login Attempts",
          user._id,
          { name: "USER", id: user?._id || null },
          "Failed",
          `8 consecutive failed login attempts from : ${req.ip}`,
          req.ip
        );
        return res.status(429).json({
          errors:
            "Too many failed login attempts. Please try again after 3 minutes. ",
        });
      }
      if (!user || !bcrypt.compareSync(password, user.password)) {
        failedLoginAttempts[email] = (failedLoginAttempts[email] || 0) + 1;
        auditLog.log(
          "LOGIN",
          user?._id || null,
          { name: "USER", id: user?._id || null },
          "Failed",
          "Invalid login credentials",
          req.ip
        );
        return res.status(401).json({ errors: "Invalid login credentials" });
      }
      if (!user.isverified) {
        auditLog.log(
          "LOGIN",
          user._id,
          { name: "USER", id: user?._id || null },
          "Failed",
          "Account not verified",
          req.ip
        );
        return res.status(401).json({ errors: "Kindly Verify your account." });
      }
      delete failedLoginAttempts[email];
      user.failedAttempts = 0;
      user.lockUntil = null;
      user.save();

      const token = await JWTAUTH.getAccessToken(user._id);
      const refreshToken = await JWTAUTH.getRefreshToken(user._id);
      auditLog.log(
        "LOGIN",
        user._id,
        { name: "USER", id: user?._id || null },
        "Success",
        "Login Successful",
        req.ip
      );

      const agent = await auth.getAgent(email);
      res.status(200).json({
        status: "success",
        message: "Login Successful",
        data: user,
        agent: agent,
        token: token,
        refreshToken: refreshToken,
      });
    } catch (error) {
      auditLog.log(
        "LOGIN",
        null,
        { name: "USER", id: null },
        "Failed",
        error.toString(),
        req.ip
      );
      res.send(error);
      console.error(error);
    }
  },

  AdminSignIn: async (req, res) => {
    try {
      const auth = new Auth();
      const { email, password, role } = req.body;

      const user = await auth.getAdminLogin(email, role);
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
        auditLog.log(
          "LOGIN",
          null,
          { name: "ADMIN", id: null },
          "Failed",
          JSON.stringify(firstErrorForField),
          req.ip
        );
        return res.status(400).json({ errors: firstErrorForField });
      }

      if (!user || user == null) {
        auditLog.log(
          "LOGIN",
          null,
          { name: "ADMIN", id: null },
          "Failed",
          "Account do not exist",
          req.ip
        );
        return res.status(401).json({ errors: "Account do not exist" });
      }

      // Check if user account is locked
      if (user?.lockUntil && user?.lockUntil > Date.now()) {
        delete failedLoginAttempts[email];
        const remainingTime = Math.ceil((user?.lockUntil - Date.now()) / 60000); // Convert ms to minutes
        user.failedAttempts = 0;
        user.lockUntil = null;
        user.save();
        auditLog.log(
          "LOGIN",
          user._id,
          { name: "ADMIN", id: user?._id || null },
          "Failed",
          `Account locked. Try again in ${remainingTime} minutes.`,
          req.ip
        );
        return res.status(403).json({
          message: `Account locked. Try again in ${remainingTime} minutes.`,
        });
      }

      //Check if user has too many failed login attemts and lock account for 10mins
      if (failedLoginAttempts[email] && failedLoginAttempts[email] >= 8) {
        user.lockUntil = Date.now() + 3 * 60 * 1000; // Lock for 10 minutes
        user.failedAttempts = 8;
        user.save();
        auditLog.log(
          "Multiple Failed Admin Login Attempts",
          user._id,
          { name: "ADMIN", id: user?._id || null },
          "Failed",
          `8 consecutive failed login attempts from : ${req.ip}`,
          req.ip
        );
        return res.status(429).json({
          errors:
            "Too many failed login attempts. Please try again after 10 minutes. ",
        });
      }
      if (!user || !bcrypt.compareSync(password, user.password)) {
        failedLoginAttempts[email] = (failedLoginAttempts[email] || 0) + 1;
        auditLog.log(
          "LOGIN",
          user?._id || null,
          { name: "ADMIN", id: user?._id || null },
          "Failed",
          "Invalid login credentials",
          req.ip
        );
        return res.status(401).json({ errors: "Invalid login credentials" });
      }
      if (!user.isverified) {
        auditLog.log(
          "LOGIN",
          user._id,
          { name: "ADMIN", id: user?._id || null },
          "Failed",
          "Account not verified",
          req.ip
        );
        return res.status(401).json({ errors: "Kindly Verify your account." });
      }
      delete failedLoginAttempts[email];
      user.failedAttempts = 0;
      user.lockUntil = null;
      user.save();

      const token = await JWTAUTH.getAccessToken(user._id);
      const refreshToken = await JWTAUTH.getRefreshToken(user._id);
      auditLog.log(
        "LOGIN",
        user._id,
        { name: "ADMIN", id: user?._id || null },
        "Success",
        "Login Successful",
        req.ip
      );
      const agent = await auth.getAgent(email);
      res.status(200).json({
        status: "success",
        message: "Login Successful",
        data: user,
        agent: agent,
        token: token,
        refreshToken: refreshToken,
      });
    } catch (error) {
      auditLog.log(
        "LOGIN",
        null,
        { name: "USER", id: null },
        "Failed",
        error.toString(),
        req.ip
      );
      res.send(error);
      console.error(error);
    }
  },

  ResetPasswordRequest: async (req, res) => {
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
        auditLog.log(
          "UPDATE",
          null,
          { name: "USER", id: null },
          "Failed",
          JSON.stringify(firstErrorForField),
          req.ip
        );
        return res.status(400).json({ errors: firstErrorForField });
      }

      const resettokenService = new ResetTokenService();
      const auth = new Auth();
      const { email, userId } = req.body;

      const user = await auth.getLogin(email);

      console.log(user);
      if (!user) {
        auditLog.log(
          "UPDATE",
          null,
          { name: "USER", id: null },
          "Failed",
          "Invalid email",
          req.ip
        );
        return res.status(404).json({ errors: "Invalid email" });
      }

      //GENERATE RESET CODE
      const veri_code = generateNumericCode();

      //generate a hash token
      const hash_crypt = crypto.randomBytes(32).toString("hex");
      //get token model parameter
      const resetUsertokenData = {
        email: email,
        token: hash_crypt,
        code: veri_code,
      };

      //Send email to user with reset CODE
      const message = `Your password reset code is ${veri_code}. Kindly ignore this message if you did not request to reset your password.`;
      await sendMail(email, "Password Reset Token", message).then(async () => {
        //SAVE TOKEN
        await resettokenService.saveResetToken(resetUsertokenData);
      });

      auditLog.log(
        "UPDATE",
        user._id,
        { name: "USER", id: user._id },
        "Success",
        "Password reset code sent to email.",
        req.ip
      );
      // await auth.sendResetPasswordEmail(user.email, resetURL);
      res.status(200).json({
        status: "success",
        message: "Password reset CODE have been sent to your email.",
      });
    } catch (error) {
      auditLog.log(
        "UPDATE",
        null,
        { name: "USER", id: null },
        "Failed",
        error.toString(),
        req.ip
      );
      res.send(error);
      console.error(error);
    }
  },
  ResetPasswordVerifyToken: async function (req, res) {
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
        auditLog.log(
          "UPDATE",
          null,
          { name: "USER", id: null },
          "Failed",
          JSON.stringify(firstErrorForField),
          req.ip
        );
        return res.status(400).json({ errors: firstErrorForField });
      }
      const resetTokenService = new ResetTokenService();
      const { resetToken, email } = req.body;

      // verify reset token
      const verify = await resetTokenService.verifyResetToken(
        email,
        resetToken
      );
      if (verify === true) {
        auditLog.log(
          "UPDATE",
          null,
          { name: "USER", id: null },
          "Success",
          "Reset token verified successfully.",
          req.ip
        );
        return res.status(200).json({
          status: "success",
          message: "Reset token verified successfully.",
        });
      }

      auditLog.log(
        "UPDATE",
        null,
        { name: "USER", id: null },
        "Failed",
        verify.errors || "Reset token verification failed.",
        req.ip
      );
      return res.status(401).json({ errors: verify.errors, status: "error" });
    } catch (error) {
      auditLog.log(
        "UPDATE",
        null,
        { name: "USER", id: null },
        "Failed",
        error.toString(),
        req.ip
      );
      console.error("Error while verifying reset token " + error);
      return false;
    }
  },
  ResetPassword: async (req, res) => {
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
        auditLog.log(
          "UPDATE",
          null,
          { name: "USER", id: null },
          "Failed",
          JSON.stringify(firstErrorForField),
          req.ip
        );
        return res.status(400).json({ errors: firstErrorForField });
      }

      const resetTokenService = new ResetTokenService();
      let { email, password } = req.body;
      // Hash the password
      password = await passwordHash.hashPassword(password);

      // update user password
      const updatepassword = await resetTokenService.resetPassword(
        email,
        password
      );
      if (!updatepassword) {
        auditLog.log(
          "UPDATE",
          null,
          { name: "USER", id: null },
          "Failed",
          "Invalid credentials, couldn't reset password",
          req.ip
        );
        return res
          .status(404)
          .json({ errors: "Invalid credentials, couldn't reset password" });
      }

      auditLog.log(
        "UPDATE",
        updatepassword._id || null,
        { name: "USER", id: updatepassword._id || null },
        "Success",
        "Password reset successfully.",
        req.ip
      );
      return res.status(200).json({
        status: "success",
        message: "Password reset successfully.",
      });
    } catch (err) {
      auditLog.log(
        "UPDATE",
        null,
        { name: "USER", id: null },
        "Failed",
        err.toString(),
        req.ip
      );
      return res.status(500).json({ errors: "Internal server error" });
    }
  },

  checkJWT: async function (req, res) {
    try {
      const token = req.headers["x-access-token"];
      if (!token) {
        auditLog.log(
          "JWT Check",
          null,
          { name: "USER", id: null },
          "Failed",
          "Unauthorized Access...",
          req.ip
        );
        return res.status(401).send({ message: "Unauthorized Access..." });
      }
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          auditLog.log(
            "READ",
            null,
            { name: "USER", id: null },
            "Failed",
            "Token expired. Please log in again.",
            req.ip
          );
          return res
            .status(200)
            .send({ message: "Token expired. Please log in again." });
        } else {
          auditLog.log(
            "READ",
            decoded?._id || null,
            { name: "USER", id: decoded?._id || null },
            "Success",
            "Token valid.",
            req.ip
          );
          return res.status(200).send({ message: "Token valid." });
        }
        // next();
      });
    } catch (error) {
      auditLog.log(
        "READ",
        null,
        { name: "USER", id: null },
        "Failed",
        error.toString(),
        req.ip
      );
      console.error("Error while checking JWT " + error);
      return false;
    }
  },

  getUserByEmail: async (req, res) => {
    try {
      const { email } = req.body;
      const auth = new Auth();
      const user = await auth.getLogin(email);
      return res.status(200).json({ user });
    } catch (error) {
      console.error("Error while getting user by email " + error);
      return false;
    }
  },
  ResendVerifyCode: async (req, res) => {
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
        auditLog.log(
          "UPDATE",
          null,
          { name: "USER", id: null },
          "Failed",
          JSON.stringify(firstErrorForField),
          req.ip
        );
        return res.status(400).json({ errors: firstErrorForField });
      }

      const tokenService = new TokenService();
      const auth = new Auth();
      const { email, userId } = req.body;

      const user = await auth.getLogin(email);

      console.log(user);
      if (!user) {
        auditLog.log(
          "UPDATE",
          null,
          { name: "USER", id: null },
          "Failed",
          "Invalid email",
          req.ip
        );
        return res.status(404).json({ errors: "Invalid email" });
      }

      //GENERATE RESET CODE
      const veri_code = generateNumericCode();

      //generate a hash token
      const hash_crypt = crypto.randomBytes(32).toString("hex");

      const verifyUsertokenData = {
        userId: userId ?? user._id,
        token: hash_crypt,
        code: veri_code,
      };

      //User verification Token
      //await tokenService.saveToken(verifyUsertokenData);

      //Send email to user with reset CODE
      const message = `Your verify code is ${veri_code}. Kindly ignore this message if you did not request to verify your account.`;
      await sendMail(email, "Verify Code", message).then(async () => {
        //SAVE TOKEN
        await tokenService.saveToken(verifyUsertokenData);
      });

      auditLog.log(
        "UPDATE",
        user._id,
        { name: "USER", id: user._id },
        "Success",
        "Password reset code sent to email.",
        req.ip
      );
      // await auth.sendResetPasswordEmail(user.email, resetURL);
      res.status(200).json({
        status: "success",
        message: "Account verification code have been sent to your email.",
      });
    } catch (error) {
      auditLog.log(
        "UPDATE",
        null,
        { name: "USER", id: null },
        "Failed",
        error.toString(),
        req.ip
      );
      res.send(error);
      console.error(error);
    }
  },
};
const failedLoginAttempts = {}; // Store failed attempts temporarily

module.exports = AuthController;
