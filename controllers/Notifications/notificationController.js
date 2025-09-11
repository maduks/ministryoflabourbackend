const { Notification } =require("../../models/Notifications");
class NotificationController {
  async getNotification(req, res) {
    try {
      const { userId } = req.body;
      const notifications = await Notification.find({ userId }).sort({
        createdAt: -1,
      }).limit(10);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ errors: error.message });
    }
  }
}
module.exports = new NotificationController();