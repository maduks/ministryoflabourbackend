const express = require("express");
const router = express.Router();
const {
  getRecentActivities,
  getRecentActivitiesByMinistry,
} = require("../controllers/Analytics/activityController");

// Recent activities endpoint
router.get("/recent-activities", getRecentActivities);

// Recent activities by ministry endpoint
router.get(
  "/recent-activities/ministry/:ministryId",
  getRecentActivitiesByMinistry
);

module.exports = router;
