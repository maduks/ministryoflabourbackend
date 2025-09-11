// services/userService.js

const { User } = require("../../models/User");
class UsersService {
  // Retrieve user profile by ID
  async getAdminUsers(userId) {
    try {
      const users = await User.find({ role: { $ne: "user" } }).sort(
        "-createdAt"
      );
      if (!users) throw new Error("User not found");
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(userId) {
    try {
      const users = await User.find({ role: { $ne: "superadmin" } })
        .sort("-createdAt")
        .populate("ministry", "name");
      if (!users) throw new Error("User not found");
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getMinistryUsers(userId) {
    try {
      const users = await User.find({ role: { $eq: "ministry_admin" } }).sort(
        "-createdAt"
      );
      if (!users) throw new Error("User not found");
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getAgentUsers(userId) {
    try {
      const users = await User.find({ role: { $eq: "agent" } }).sort(
        "-createdAt"
      );
      if (!users) throw new Error("User not found");
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getPublicUsers(userId) {
    try {
      const users = await User.find({ role: { $eq: "user" } }).sort(
        "-createdAt"
      );
      if (!users) throw new Error("User not found");
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getTotalActiveUsers() {
    try {
      return await User.countDocuments({ status: "active" });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UsersService();
