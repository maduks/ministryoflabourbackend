const serviceProviderService = require("../../service/serviceProviders/serviceProviderService.service");
const { SuccessResponse } = require("../../utils/successHandler");
let requiredFields = [
  "ownerId",
  "serviceName",
  // "serviceType",
  // "certification",
  // "certificationNumber",
  // "availability",
  // "description",
  // "isVerified",
  // "serviceDisplayPicture",
  // "validFrom",
  // "validUntil"
];

class ServiceProviderController {
  async createServiceProvider(req, res) {
    try {
      let missingFields = requiredFields.filter((fields) => !req.body[fields]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
        ß;
      }
      const newServiceProvider = await serviceProviderService.createService(
        req.body
      );
      res.status(201).json({
        message: "Service provider created successfully",
        data: newServiceProvider,
      });
    } catch (error) {
      res.status(500).json({ errors: error.message });
    }
  }

  async createServiceProviderCategory(req, res) {
    try {
      const newServiceProviderCat =
        await serviceProviderService.createServiceCategory(req.body);
      res.status(201).json({
        message: "Service provider categories created successfully",
        data: newServiceProviderCat,
      });
    } catch (error) {
      res.status(500).json({ errors: error.message });
    }
  }
  async getServiceProviderCategory(req, res) {
    try {
      const serviceCate = await serviceProviderService.getAllServicesCategory();
      return res.status(200).json({ message: "Success", data: serviceCate });
    } catch (error) {
      console.log(error);
    }
  }
  async getServiceProviderById(req, res) {
    try {
      const service = await serviceProviderService.getServiceById(
        req.params.id
      );
      new SuccessResponse("Service retrieved successfully", service).send(res);
    } catch (error) {
      next(error);
    }
  }
  async getServiceProviderByUserId(req, res) {
    try {
      const service = await serviceProviderService.getServiceByUserId(
        req.params.id
      );
      new SuccessResponse("Service retrieved successfully", service).send(res);
    } catch (error) {
      next(error);
    }
  }
  async setFeatured(req, res) {
    try {
      const { id } = req.params;
      const { featured, featured_until } = req.body;

      if (typeof featured !== "boolean") {
        return res.status(400).json({
          error: "featured must be a boolean value",
        });
      }

      const updatedService = await serviceProviderService.setFeatured(
        id,
        featured,
        featured_until
      );
      res.status(200).json({
        message: "Service featured status updated successfully",
        service: updatedService,
      });
    } catch (error) {
      res
        .status(error.message === "Service not found" ? 404 : 500)
        .json({ error: error.message });
    }
  }
}

module.exports = new ServiceProviderController();
