const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/Notifications/notificationController");
router.post("/get-notifications", NotificationController.getNotification);
module.exports = router;