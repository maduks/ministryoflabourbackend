const listingService = require("../../service/listing/listing.service");

class ListingController {
  async getAllListings(req, res) {
    try {
      const query = {
        type: req.query.type,
        search: req.query.search,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        category: req.query.category,
        location: req.query.location,
        status: req.query.status,
        ownerId: req.query.ownerId,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder === "asc" ? 1 : -1,
      };

      const listings = await listingService.getAllListings(query);
      res.status(200).json({
        message: "success",
        ...listings,
      });
    } catch (error) {
      console.error("Error in getAllListings controller:", error);
      res.status(500).json({
        error: error.message || "Failed to fetch listings",
      });
    }
  }
  async getFeaturedListings(req, res) {
    try {
      const query = {
        type: req.query.type,
        search: req.query.search,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        category: req.query.category,
        location: req.query.location,
        status: req.query.status,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder === "asc" ? 1 : -1,
      };

      const listings = await listingService.getFeaturedListings(query);
      res.status(200).json({
        message: "success",
        ...listings,
      });
    } catch (error) {
      console.error("Error in getFeaturedListings controller:", error);
      res.status(500).json({
        error: error.message || "Failed to fetch featured listings",
      });
    }
  }

  async getListingById(req, res) {
    try {
      const listing = await listingService.getListingById(
        req.params.id,
        req.query.type
      );
      if (!listing) {
        return res.status(404).json({
          error: "Listing not found",
        });
      }
      res.status(200).json({
        message: "success",
        data: listing,
      });
    } catch (error) {
      console.error("Error in getListingById controller:", error);
      res.status(500).json({
        error: error.message || "Failed to fetch listing",
      });
    }
  }
  async deleteListingById(req, res) {
    try {
      const listing = await listingService.deleteListingById(
        req.params.id,
        req.query.type
      );
      if (!listing) {
        return res.status(404).json({
          error: "Listing not found",
        });
      }
      res.status(200).json({
        message: "Listing deleted sucessfully",
        data: listing,
      });
    } catch (error) {
      console.error("Error in getListingById controller:", error);
      res.status(500).json({
        error: error.message || "Failed to delete listing",
      });
    }
  }
  async updateListingById(req, res) {
    try {
      const { id } = req.params;
      const { type } = req.query;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          error: "Listing ID is required",
        });
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
          error: "Update data is required",
        });
      }

      const result = await listingService.updateListingById(
        id,
        updateData,
        type
      );

      res.status(200).json({
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error in updateListingById controller:", error);

      // Handle specific error cases
      if (error.message.includes("Invalid listing ID")) {
        return res.status(400).json({
          error: error.message,
        });
      }

      if (error.message.includes("not found")) {
        return res.status(404).json({
          error: error.message,
        });
      }

      if (error.message.includes("Invalid listing type")) {
        return res.status(400).json({
          error: error.message,
        });
      }

      res.status(500).json({
        error: error.message || "Failed to update listing",
      });
    }
  }

  async getFeaturedServiceListingsWithActiveLicenseAndSorted(req, res) {
    try {
      const listings =
        await listingService.getFeaturedServiceListingsWithActiveLicenseAndSorted();
      res.status(200).json({
        message: "success",
        ...listings,
      });
    } catch (error) {
      console.log("error", error);
    }
  }
}

module.exports = new ListingController();
