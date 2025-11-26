const { User } = require("../../models/User");

class UserDetailsService {
  /**
   * Get basic user details by ID (name, email, phoneNumber, etc.)
   * Excludes sensitive information like password
   */
  async getUserDetailsById(userId) {
    try {
      const user = await User.findById(userId).select(
        "-password -failedAttempts -lockUntil"
      );

      if (!user) {
        throw new Error("User not found");
      }

      // Return only essential user details
      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        isverified: user.isverified,
        isKYCVerified: user.isKYCVerified,
        gender: user.gender,
        state: user.state,
        lga: user.lga,
        department: user.department,
        ministry: user.ministry,
        createdAt: user.createdAt,
      };
    } catch (error) {
      console.error("Error in getUserDetailsById:", error);
      throw error;
    }
  }

  /**
   * Get multiple users' basic details by IDs
   * Useful for bulk lookups
   */
  async getUsersDetailsByIds(userIds) {
    try {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new Error("userIds must be a non-empty array");
      }

      const users = await User.find({
        _id: { $in: userIds },
      }).select("-password -failedAttempts -lockUntil");

      // Map to ensure consistent structure
      return users.map((user) => ({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        isverified: user.isverified,
        isKYCVerified: user.isKYCVerified,
        gender: user.gender,
        state: user.state,
        lga: user.lga,
        department: user.department,
        ministry: user.ministry,
        createdAt: user.createdAt,
      }));
    } catch (error) {
      console.error("Error in getUsersDetailsByIds:", error);
      throw error;
    }
  }
}

module.exports = new UserDetailsService();
