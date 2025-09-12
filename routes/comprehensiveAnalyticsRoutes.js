const express = require("express");
const router = express.Router();
const {
  getAllAnalytics,
  getSystemOverview,
  getTrends,
  getMinistryPerformance,
  getMonthlyData,
  getSystemHealth,
  getSecurityMetrics,
  getUserDemographics,
  getAgentDemographics,
  getMinistryDemographics,
  getProviderDemographics,
  getPropertyDemographics,
  getActivityAnalytics,
  getTopPerformingAgents,
  getRecentActivityLogs,
} = require("../controllers/Analytics/comprehensiveAnalyticsController");

// Import middleware for authentication and authorization
// const {
//   jwtAdminAuthMiddleware,
// } = require("../middleware/jwtAdminAuthMiddleware");

// Apply admin authentication middleware to all routes
//router.use(jwtAdminAuthMiddleware);

// Main analytics endpoint - returns all analytics data
router.get("/all", getAllAnalytics);

// Individual analytics endpoints
router.get("/system-overview", getSystemOverview);
router.get("/trends", getTrends);
router.get("/ministry-performance", getMinistryPerformance);
router.get("/monthly-data", getMonthlyData);
router.get("/system-health", getSystemHealth);
router.get("/security-metrics", getSecurityMetrics);
router.get("/user-demographics", getUserDemographics);
router.get("/agent-demographics", getAgentDemographics);
router.get("/ministry-demographics", getMinistryDemographics);
router.get("/provider-demographics", getProviderDemographics);
router.get("/property-demographics", getPropertyDemographics);
router.get("/activity-analytics", getActivityAnalytics);
router.get("/top-performing-agents", getTopPerformingAgents);
router.get("/recent-activity-logs", getRecentActivityLogs);

module.exports = router;
