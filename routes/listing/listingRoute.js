const express = require("express");
const router = express.Router();
const ListingController = require("../../controllers/Listing/listingController");
//const listingController = new ListingController();

// Route to get all listings (products, businesses, properties, and services)
router.get("/all", ListingController.getAllListings);
router.get("/:id", ListingController.getListingById);
router.delete("/:id", ListingController.deleteListingById);
router.put("/:id", ListingController.updateListingById);
router.post("/featured", ListingController.getFeaturedListings);
router.post(
  "/featured/services/licencesorted",
  ListingController.getFeaturedServiceListingsWithActiveLicenseAndSorted
);
module.exports = router;
