const { Business } = require("../../models/Business");

class BusinessService {
  async getAllBusinesses() {
    try {
      const businesses = await Business.find().exec();
      return businesses;
    } catch (error) {
      console.error(error);
    }
  }

  async getBusinessById(businessId) {
    try {
      const business = await Business.findById(businessId).exec();
      if (!business) {
        return "Business not found....";
      }
      return business;
    } catch (error) {
      console.error(error);
    }
  }

  async createBusiness(businessData) {
    try {
      const newBusiness = new Business(businessData);
      return await newBusiness.save();
    } catch (error) {
      console.error(error);
    }
  }

  async setFeatured(businessId, featured, featured_until) {
    try {
      const business = await Business.findByIdAndUpdate(
        businessId,
        { featured: featured, featured_until: featured_until },
        { new: true }
      );
      if (!business) {
        throw new Error("Business not found");
      }
      return business;
    } catch (error) {
      console.error("Error setting featured status: ", error);
      throw error;
    }
  }
}
module.exports = new BusinessService();
