const businessService = require("../../service/business/business.service");
let productField_ = [
  "ownerId",
  "state",
  "businessAddress",
  "legalname",
  "industry",
  "location",
  "businessType",
  "businessNumber",
  "businessPhoneNumber",
  "businessEmail",
  "businessDescription",
  "businessProfilePicture",
  //"businessWebsite",
  "businessLogo",
  // "businessFacebook",
  // "businessTwitter",
  // "businessInstagram",
  // "businessLinkedIn",
  "businessTaxId",
  "employeeCount",
  "dateOfIncorporation",
  "registrationStatus",
  "legalDocument",
  "closingTime",
  "openingTime",
];

class BusinessController {
  async getAllBusinesses(req, res) {
    try {
      const businesses = await businessService.getAllBusinesses();
      res.status(200).json({ message: "success", data: businesses });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get businesses" });
    }
  }
  async getBusinessById(req, res) {
    try {
      const business = await businessService.getBusinessById(req.params.id);
      if (!business)
        return res.status(404).json({ message: "Business not found" });
      res.status(200).json({ message: "success", data: business });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get business" });
    }
  }
  async createBusiness(req, res) {
    try {
      const missingFields = productField_.filter((field) => !req.body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Required fields missing: ${missingFields.join(", ")}`,
        });
      }
      const newBusiness = await businessService.createBusiness(req.body);
      res.status(201).json({ message: "success", data: newBusiness });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create business" });
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

      const updatedBusiness = await businessService.setFeatured(
        id,
        featured,
        featured_until
      );
      res.status(200).json({
        message: "Business featured status updated successfully",
        business: updatedBusiness,
      });
    } catch (error) {
      res
        .status(error.message === "Business not found" ? 404 : 500)
        .json({ error: error.message });
    }
  }
}
module.exports = new BusinessController();
