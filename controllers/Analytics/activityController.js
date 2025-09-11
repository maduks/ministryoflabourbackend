const {
  getRecentActivities,
  getRecentActivitiesByMinistry,
} = require("../../service/analytics/activityService");

exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activities = await getRecentActivities(limit);
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentActivitiesByMinistry = async (req, res) => {
  try {
    const { ministryId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const activities = await getRecentActivitiesByMinistry(ministryId, limit);
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
