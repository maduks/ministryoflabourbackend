const { User, validate } = require("../../models/User");
const { Agent } = require("../../models/Agent");
class Auth {
  async getLogin(email) {
    const user = await User.findOne({ email: email }).exec();
    if (!user) return null;

    // Otherwise, just return the user
    return user;
  }
  async getAgent(email) {
    const user = await User.findOne({ email: email }).exec();
    if (!user) return null;
    // If the user is an agent, join the agent model
    if (user.role === "agent") {
      const agent = await Agent.findOne({ user: user._id }).lean();
      return agent;
    }
    return null;
  }
  async getAdminLogin(email, role) {
    const user = User.findOne({ email: email, status: "active" }).exec();
    return user;
  }
  async generateResetToken(email) {}
}
module.exports = Auth;
