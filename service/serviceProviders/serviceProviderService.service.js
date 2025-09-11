const { Service } = require("../../models/Service");
const { ServiceCategory } = require("../../models/ServiceCategory");
class ServiceProviderService {
  async getAllServices() {
    try {
      const services = await Service.find().exec();
      return services;
    } catch (error) {
      console.error(error);
    }
  }

  async getServiceById(serviceId) {
    try {
      const service = await Service.findById(serviceId).exec();
      if (!service) return null;
      return service;
    } catch (error) {}
  }
  async getServiceByUserId(userId) {
    const service = await Service.find({ ownerId: userId }).exec();
    if (!service) return null;
    return service;
  }
  async createService(serviceData) {
    try {
      const newService = new Service(serviceData);
      return await newService.save();
    } catch (error) {
      console.error("Error creating service: ", error);
    }
  }

  async createServiceCategory(data) {
    try {
      const serviceCat = await ServiceCategory.create(data);

      return serviceCat;
    } catch (err) {
      console.log(err);
    }
  }

  async getAllServicesCategory() {
    try {
      const allServiceCat = await ServiceCategory.find().exec();
      return allServiceCat;
    } catch (error) {
      console.log(error);
    }
  }

  async setFeatured(serviceId, featured, featured_until) {
    try {
      const service = await Service.findByIdAndUpdate(
        serviceId,
        { featured: featured, featured_until: featured_until },
        { new: true }
      );
      if (!service) {
        throw new Error("Service not found");
      }
      return service;
    } catch (error) {
      console.error("Error setting featured status: ", error);
      throw error;
    }
  }
}

module.exports = new ServiceProviderService();
