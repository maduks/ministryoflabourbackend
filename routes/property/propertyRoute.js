const express = require("express");
const router = express.Router();
const statsController = require("../../controllers/PropertyCollection/statsCollectionController");
const reportsController = require("../../controllers/PropertyCollection/reportsController");
const PropertyController = require("../../controllers/Property/propertycontroller");
const PropertyCollectionController = require("../../controllers/PropertyCollection/propertyCollectionController");
// Public routes
router.get("/", PropertyController.getProperties);
router.get("/search", PropertyController.searchProperties);
router.get("/nearby", PropertyController.getNearbyProperties);
router.get("/:id", PropertyController.getProperty);

router.post("/collection", PropertyCollectionController.createProperty);
router.post("/collection/all", PropertyCollectionController.getProperties);
router.post("/collection/stats", statsController.getStats);
router.put("/collection/:id", PropertyCollectionController.updateProperty);
router.post("/collection/aireport", reportsController.generateAiReport);
router.get("/collection/report/csv", reportsController.exportCSV);
router.get("/collection/report/pdf", reportsController.exportPDF);
// These routes conflict because "/collection/stats" will never be reached
// Express matches routes in order, and "/collection/:id" will match anything after /collection/
// including "stats". Need to put the more specific route first.

router.get("/collection/stats", PropertyCollectionController.getPropertyStats);
router.get("/collection/:id", PropertyCollectionController.getPropertyById);
router.post(
  "/",
  //upload.array("photos", 10), //Assuming you're using multer for file uploads
  PropertyController.createProperty
);

router.put("/:id", PropertyController.updateProperty);
router.delete("/:id", PropertyController.deleteProperty);
router.patch("/:id/set-featured", PropertyController.setFeatured);

module.exports = router;
