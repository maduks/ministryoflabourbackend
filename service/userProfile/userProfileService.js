// services/userService.js

const { User } = require("../../models/User");
const auditLog = require("../../utils/AuditLog");

class UserService {
  // Retrieve user profile by ID
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateUser(userId, updateData) {
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
      if (!updatedUser) throw new Error("User not found");
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async updateUserNoId(ministry, updateData) {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { ministry: ministry },
        updateData,
        { new: true }
      );
      if (!updatedUser) throw new Error("User not found");
      console.log(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Deactivate user account
  async deactivateUserAccount(userId, updateData) {
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
      if (!updatedUser) throw new Error("User not found");
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async deleteUserAccount(fieldId) {
    try {
      const deletedUser = await User.findOneAndDelete(fieldId);
      return deletedUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Activate user account
  async activateUserAccount(userId, updateData) {
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
      if (!updatedUser) throw new Error("User not found");
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new UserService();
