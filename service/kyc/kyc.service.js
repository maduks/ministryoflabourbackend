const Kyc = require("../../models/Kyc");

class KycService {
  async createKyc(data) {
    const kyc = new Kyc(data);
    return await kyc.save();
  }

  async getKycByUserId(userId) {
    return await Kyc.findOne({ userId });
  }

  async updateKycStatus(userId, status) {
    return await Kyc.findOneAndUpdate(
      { userId },
      { status, updatedAt: new Date() },
      { new: true }
    );
  }
  async getAllKyc() {
    return await Kyc.find();
  }
}

module.exports = new KycService();
