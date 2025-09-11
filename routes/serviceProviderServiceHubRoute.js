const express = require("express");
const router = express.Router();
const {
  createServiceProvider,
  getServiceProviderAnalytics,
  getServiceProviderByMinistry,
  updateServiceProvider,
  searchAndFilterServiceProviders,
  getServiceProviderById,
} = require("../controllers/ServiceProviderServiceHub/serviceProviderServiceHubController");

router.post("/service-provider-hub", createServiceProvider);
router.put("/service-provider-hub/:id", updateServiceProvider);
router.get("/analytics/service-providers", getServiceProviderAnalytics);
router.get("/service-provider-hub/ministry/:id", getServiceProviderByMinistry);
router.get("/service-provider-hub/search", searchAndFilterServiceProviders);
router.get("/service-provider-hub/id/:id", getServiceProviderById);

module.exports = router;
