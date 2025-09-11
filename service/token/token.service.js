const { Token, validateToken } = require("../../models/Token");
const { User } = require("../../models/User");
class TokenService {
  async saveToken(userToken) {
    try {
      const { error } = validateToken(userToken);
      if (error) return { errors: error.details[0].message };
      const token = await Token.create(userToken);
      return token;
    } catch (error) {
      console.error("Couldn't save token " + error);
    }
  }

  async verifyUser(id, veri_code) {
    try {
      const user = await User.findOne({ _id: id });
      if (!user) return { errors: "Invalid session" };
      const tok = await Token.findOne({
        userId: user._id,
        code: veri_code,
      });

      if (!tok) return { errors: "Invalid code" };

      await User.updateOne({ _id: user._id }, { $set: { isverified: true } });
      await Token.findByIdAndDelete(tok._id);
      return "User verified sucessfully";
    } catch (error) {
      return console.log(error);
    }
  }
}

module.exports = TokenService;
