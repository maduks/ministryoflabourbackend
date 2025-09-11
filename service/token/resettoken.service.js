const { ResetToken } = require("../../models/ResetToken");
const { User } = require("../../models/User");
class ResetTokenService {
  async saveResetToken(userResetToken) {
    try {
      const resettoken = await ResetToken.findOneAndUpdate(
        { email: userResetToken.email },
        userResetToken,
        { new: true, upsert: true }
      );

      //const resettoken = await ResetToken.create(userResetToken);
      return resettoken;
    } catch (error) {
      console.error("Couldn't save reset token " + error);
    }
  }

  async verifyResetToken(email, veri_code) {
    try {
      const user = await User.findOne({ email: email });
      if (!user) return { errors: "Invalid session" };
      const restok = await ResetToken.findOne({
        email: user.email,
        code: veri_code,
      });

      if (!restok) return { errors: "Invalid code" };
      await ResetToken.findByIdAndDelete(restok._id);
      return true;
    } catch (error) {
      return console.log(error);
    }
  }
  async resetPassword(email, password) {
    try {
      const user = await User.findOneAndUpdate(
        { email: email },
        { password: password },
        { new: true }
      );
      return user;
    } catch (error) {
      console.error("Couldn't reset password " + error);
    }
  }
}

module.exports = ResetTokenService;
