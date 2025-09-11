const userProfileService = require("../../service/userProfile/userProfileService");
const users = require("../../service/userProfile/usersService");
const passwordHash = require("../../utils/passwordHash");
const { validationResult } = require("express-validator");
class userProfileController {
  // Retrieve user profile by ID
  async getUserProfile(req, res) {
    try {
      const errors = validationResult(req);
      const userId = req.params.id; // Get the user ID from request params
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
      const user = await userProfileService.getUserById(userId);
      res.status(200).json({ user, status: "success" });
    } catch (error) {
      console.log("an errors: ");
      res.status(404).json({ errors: error.message });
    }
  }

  async getAdminUserProfile(req, res) {
    try {
      const user = await users.getAdminUsers();
      res.status(200).json({ user, status: "success" });
    } catch (error) {
      console.log("an errors: ");
      res.status(404).json({ errorsm: error.message });
    }
  }

  // Update user profile
  async updateUserProfile(req, res) {
    try {
      const errors = validationResult(req);

      const userId = req.params.id; // Get the user ID from request params
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
      let { updateData } = req.body; // Get the update data from request body

      if (updateData._id !== undefined)
        return res
          .status(200)
          .json({ errors: "Cannot update ID for user profile" });
      if (updateData?.password !== undefined)
        updateData.password = await passwordHash.hashPassword(
          updateData.password
        );
      if (!updateData || updateData == undefined)
        return res.status(404).json({ errors: "Missing data to update" });
      const updatedUser = await userProfileService.updateUser(
        userId,
        updateData
      );
      res
        .status(200)
        .json({ updatedUser, status: "success", userId, updateData });
    } catch (error) {
      res.status(400).json({ errors: error.message });
    }
  }

  // Deactivate user account
  async deactivateUserAccount(req, res) {
    try {
      const errors = validationResult(req);

      const userId = req.params.id; // Get the user ID from request params
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
      const updateData = {
        status: "inactive",
      };
      const updatedUser = await userProfileService.deactivateUserAccount(
        userId,
        updateData
      );
      res.status(200).json({ updatedUser, status: "success" });
    } catch (error) {
      res.status(400).json({ errors: error.message });
    }
  }

  // Activate user account
  async activateUserAccount(req, res) {
    try {
      const errors = validationResult(req);

      const userId = req.params.id; // Get the user ID from request params
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
      const updateData = {
        status: "active",
      };
      const updatedUser = await userProfileService.activateUserAccount(
        userId,
        updateData
      );
      res.status(200).json({ updatedUser, status: "success" });
    } catch (error) {
      res.status(400).json({ errors: error.message });
    }
  }

  async checkJWT(req, res) {
    try {
      if (res.status === 401 && res.message === "jwt expired")
        return res
          .status(200)
          .json({ message: "Token expired. Please log in again." });
      else return res.status(200).json({ message: "Token valid." });
    } catch (error) {
      console.error("Error while checking JWT " + error);
      return false;
    }
  }
  async getAllUsers(req, res) {
    try {
      const users_list = await users.getAllUsers();
      res.status(200).json({ users_list, status: "success" });
    } catch (error) {
      res.status(400).json({ errors: error.message });
    }
  }

  async getMinistryUsers(req, res) {
    try {
      const users_list = await users.getMinistryUsers();
      res.status(200).json({ users_list, status: "success" });
    } catch (error) {
      res.status(400).json({ errors: error.message });
    }
  }

  async getAgentUsers(req, res) {
    try {
      const users_list = await users.getAgentUsers();
      res.status(200).json({ users_list, status: "success" });
    } catch (error) {
      res.status(400).json({ errors: error.message });
    }
  }

  async getPublicUsers(req, res) {
    try {
      const users_list = await users.getPublicUsers();
      res.status(200).json({ users_list, status: "success" });
    } catch (error) {
      res.status(400).json({ errors: error.message });
    }
  }

  async getTotalActiveUsers(req, res) {
    try {
      const count = await users.getTotalActiveUsers();
      return res.status(200).json({ total: count, message: "success" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error fetching total active users" });
    }
  }
}

module.exports = new userProfileController();
