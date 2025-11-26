const userDetailsService = require("../../service/userProfile/userDetails.service");

class UserDetailsController {
  /**
   * Get basic user details by ID
   * GET /api/v1/profile/details/:userId
   */
  async getUserDetails(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const userDetails = await userDetailsService.getUserDetailsById(userId);

      res.status(200).json({
        success: true,
        data: userDetails,
      });
    } catch (error) {
      console.error("Error in getUserDetails controller:", error);

      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to get user details",
        message: error.message,
      });
    }
  }

  /**
   * Get multiple users' basic details by IDs
   * POST /api/v1/users/details/bulk
   */
  async getUsersDetailsBulk(req, res) {
    try {
      const { userIds } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "userIds must be a non-empty array",
        });
      }

      const usersDetails = await userDetailsService.getUsersDetailsByIds(
        userIds
      );

      res.status(200).json({
        success: true,
        data: usersDetails,
        count: usersDetails.length,
      });
    } catch (error) {
      console.error("Error in getUsersDetailsBulk controller:", error);

      if (error.message.includes("userIds must be")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to get users details",
        message: error.message,
      });
    }
  }
}

module.exports = new UserDetailsController();
