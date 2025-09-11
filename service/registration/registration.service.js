const { User } = require("../../models/User");
const { Token } = require("../../models/Token");
const crypto = import("crypto");
require("dotenv").config();
class RegistrationService {
  async saveUser(userData) {
    try {
      //create a new user
      const newUser = await User.create(userData);
      //return new user
      if (newUser) return newUser;
    } catch (error) {
      console.error("Cannot create user " + error);
    }
  }
  async checkUserExist(userEmail, userPhone) {
    try {
      const isUser = await User.findOne({
        $or: [
          {
            email: userEmail,
          },
          {
            phoneNumber: userPhone,
          },
        ],
      });
      return isUser;
    } catch (error) {
      console.error("Cannot fetch user " + error);
    }
  }

  async checkTeamNameExist(teamName) {
    try {
      const isUser = await User.findOne({
        teamname: teamName,
      });
      return isUser;
    } catch (error) {
      console.error("Cannot fetch user " + error);
    }
  }

  async updateUserReferral(referrerId) {
    try {
      const referrer = await User.findById(referrerId);
      if (referrer) {
        newUser.referredBy = referrerId;
        referrer.referredUsers.push(newUser._id);
        await referrer.save();
      }
    } catch (error) {
      console.error("Cannot fetch user " + error);
    }
  }
}

module.exports = RegistrationService;
