const {
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
  getAllAnalyticsData,
} = require("../../service/analytics/comprehensiveAnalyticsService");

// Get all analytics data in one endpoint
exports.getAllAnalytics = async (req, res) => {
  try {
    const { state } = req.query;
    const analyticsData = await getAllAnalyticsData(state);
    res.status(200).json({
      success: true,
      data: analyticsData,
      message: state
        ? `Analytics data for ${state} retrieved successfully`
        : "Analytics data retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving analytics data",
      error: error.message,
    });
  }
};

// System Overview endpoint
exports.getSystemOverview = async (req, res) => {
  try {
    const { state } = req.query;
    const systemOverview = await getSystemOverview(state);
    res.status(200).json({
      success: true,
      data: systemOverview,
      message: state
        ? `System overview for ${state} retrieved successfully`
        : "System overview retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving system overview",
      error: error.message,
    });
  }
};

// Trends endpoint
exports.getTrends = async (req, res) => {
  try {
    const trends = await getTrends();
    res.status(200).json({
      success: true,
      data: trends,
      message: "Trends data retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving trends data",
      error: error.message,
    });
  }
};

// Ministry Performance endpoint
exports.getMinistryPerformance = async (req, res) => {
  try {
    const ministryPerformance = await getMinistryPerformance();
    res.status(200).json({
      success: true,
      data: ministryPerformance,
      message: "Ministry performance data retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving ministry performance data",
      error: error.message,
    });
  }
};

// Monthly Data endpoint
exports.getMonthlyData = async (req, res) => {
  try {
    const monthlyData = await getMonthlyData();
    res.status(200).json({
      success: true,
      data: monthlyData,
      message: "Monthly data retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving monthly data",
      error: error.message,
    });
  }
};

// System Health endpoint
exports.getSystemHealth = async (req, res) => {
  try {
    const systemHealth = await getSystemHealth();
    res.status(200).json({
      success: true,
      data: systemHealth,
      message: "System health data retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving system health data",
      error: error.message,
    });
  }
};

// Security Metrics endpoint
exports.getSecurityMetrics = async (req, res) => {
  try {
    const securityMetrics = await getSecurityMetrics();
    res.status(200).json({
      success: true,
      data: securityMetrics,
      message: "Security metrics retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving security metrics",
      error: error.message,
    });
  }
};

// User Demographics endpoint
exports.getUserDemographics = async (req, res) => {
  try {
    const { state } = req.query;
    const userDemographics = await getUserDemographics(state);
    res.status(200).json({
      success: true,
      data: userDemographics,
      message: state
        ? `User demographics for ${state} retrieved successfully`
        : "User demographics retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving user demographics",
      error: error.message,
    });
  }
};

// Agent Demographics endpoint
exports.getAgentDemographics = async (req, res) => {
  try {
    const agentDemographics = await getAgentDemographics();
    res.status(200).json({
      success: true,
      data: agentDemographics,
      message: "Agent demographics retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving agent demographics",
      error: error.message,
    });
  }
};

// Ministry Demographics endpoint
exports.getMinistryDemographics = async (req, res) => {
  try {
    const ministryDemographics = await getMinistryDemographics();
    res.status(200).json({
      success: true,
      data: ministryDemographics,
      message: "Ministry demographics retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving ministry demographics",
      error: error.message,
    });
  }
};

// Provider Demographics endpoint
exports.getProviderDemographics = async (req, res) => {
  try {
    const providerDemographics = await getProviderDemographics();
    res.status(200).json({
      success: true,
      data: providerDemographics,
      message: "Provider demographics retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving provider demographics",
      error: error.message,
    });
  }
};

// Property Demographics endpoint
exports.getPropertyDemographics = async (req, res) => {
  try {
    const propertyDemographics = await getPropertyDemographics();
    res.status(200).json({
      success: true,
      data: propertyDemographics,
      message: "Property demographics retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving property demographics",
      error: error.message,
    });
  }
};

// Activity Analytics endpoint
exports.getActivityAnalytics = async (req, res) => {
  try {
    const activityAnalytics = await getActivityAnalytics();
    res.status(200).json({
      success: true,
      data: activityAnalytics,
      message: "Activity analytics retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving activity analytics",
      error: error.message,
    });
  }
};

// Top Performing Agents endpoint
exports.getTopPerformingAgents = async (req, res) => {
  try {
    const topPerformingAgents = await getTopPerformingAgents();
    res.status(200).json({
      success: true,
      data: topPerformingAgents,
      message: "Top performing agents retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving top performing agents",
      error: error.message,
    });
  }
};

// Recent Activity Logs endpoint
exports.getRecentActivityLogs = async (req, res) => {
  try {
    const recentActivityLogs = await getRecentActivityLogs();
    res.status(200).json({
      success: true,
      data: recentActivityLogs,
      message: "Recent activity logs retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving recent activity logs",
      error: error.message,
    });
  }
};
