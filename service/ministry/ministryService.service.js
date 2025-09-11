const { Ministries } = require("../../models/Ministry");
const { User } = require("../../models/User");
const auditLog = require("../../utils/AuditLog");
class MinistryService {
  async createMinistry(data) {
    try {
      const ministry = await Ministries.create(data);

      return ministry;
    } catch (error) {
      console.error(error);
    }
  }

  async getAllMinistry() {
    try {
      const ministries = await Ministries.find().sort("-createdAt");
      return ministries;
    } catch (error) {
      console.error(error);
    }
  }

  async getMinistry(minId) {
    try {
      const ministry = await Ministries.findById(minId).exec();
      return ministry;
    } catch (error) {
      console.error(error);
    }
  }
  async updateMinistry(minId, data) {
    try {
      const updMin = await Ministries.findByIdAndUpdate(
        minId,
        { $set: data },
        { new: true, runValidators: true }
      );
      return updMin;
    } catch (error) {
      console.log(error);
    }
  }
  async deleteMinistry(minId) {
    try {
      const min = await Ministries.findByIdAndDelete(minId);
      const minDele = await User.findOneAndDelete({ ministry: minId });
      if (!min) return "Ministry not found";
      return minDele;
    } catch (error) {
      console.log(error);
    }
  }

  async getTotalMinistries() {
    try {
      return await Ministries.countDocuments();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MinistryService();
