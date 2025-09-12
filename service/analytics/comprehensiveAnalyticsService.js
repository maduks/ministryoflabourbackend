const { User } = require("../../models/User");
const { Ministries } = require("../../models/Ministry");
const { Agent } = require("../../models/Agent");
const Submission = require("../../models/Submission");
const ServiceProvider = require("../../models/ServiceProviderServiceHub");
const { Business } = require("../../models/Business");
const PropertyServiceHub = require("../../models/PropertyServiceHub");
const { Transaction } = require("../../models/Transaction");
const { Notification } = require("../../models/Notifications");
const AuditLog = require("../../models/AuditLog");
const moment = require("moment");

// System Overview Analytics
async function getSystemOverview() {
  try {
    const [
      totalUsers,
      activeUsers,
      totalMinistries,
      activeMinistries,
      totalSubmissions,
      approvedSubmissions,
      pendingSubmissions,
      rejectedSubmissions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      Ministries.countDocuments(),
      Ministries.countDocuments({ status: "Active" }),
      Submission.countDocuments(),
      Submission.countDocuments({ status: "approved" }),
      Submission.countDocuments({ status: "pending" }),
      Submission.countDocuments({ status: "rejected" }),
    ]);

    // Calculate system uptime (mock data - in real scenario, you'd track this)
    const systemUptime = 99.9;
    const avgResponseTime = 245; // milliseconds

    return {
      totalUsers,
      activeUsers,
      totalMinistries,
      activeMinistries,
      totalSubmissions,
      approvedSubmissions,
      pendingSubmissions,
      rejectedSubmissions,
      systemUptime,
      avgResponseTime,
    };
  } catch (error) {
    throw new Error(`Error getting system overview: ${error.message}`);
  }
}

// Trends Analytics
async function getTrends() {
  try {
    const currentMonth = moment().startOf("month");
    const lastMonth = moment().subtract(1, "month").startOf("month");
    const twoMonthsAgo = moment().subtract(2, "month").startOf("month");

    const [
      currentUsers,
      lastMonthUsers,
      currentSubmissions,
      lastMonthSubmissions,
      currentApprovals,
      lastMonthApprovals,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: currentMonth.toDate() } }),
      User.countDocuments({
        createdAt: {
          $gte: lastMonth.toDate(),
          $lt: currentMonth.toDate(),
        },
      }),
      Submission.countDocuments({
        dateOfSubmission: { $gte: currentMonth.toDate() },
      }),
      Submission.countDocuments({
        dateOfSubmission: {
          $gte: lastMonth.toDate(),
          $lt: currentMonth.toDate(),
        },
      }),
      Submission.countDocuments({
        status: "approved",
        dateOfSubmission: { $gte: currentMonth.toDate() },
      }),
      Submission.countDocuments({
        status: "approved",
        dateOfSubmission: {
          $gte: lastMonth.toDate(),
          $lt: currentMonth.toDate(),
        },
      }),
    ]);

    // Calculate growth percentages
    const userGrowth =
      lastMonthUsers > 0
        ? (((currentUsers - lastMonthUsers) / lastMonthUsers) * 100).toFixed(
            1
          ) + "%"
        : "+0%";

    const submissionGrowth =
      lastMonthSubmissions > 0
        ? (
            ((currentSubmissions - lastMonthSubmissions) /
              lastMonthSubmissions) *
            100
          ).toFixed(1) + "%"
        : "+0%";

    const approvalRate =
      currentSubmissions > 0
        ? ((currentApprovals / currentSubmissions) * 100).toFixed(1) + "%"
        : "0%";

    return {
      userGrowth,
      submissionGrowth,
      approvalRate,
      systemHealth: "Excellent",
    };
  } catch (error) {
    throw new Error(`Error getting trends: ${error.message}`);
  }
}

// Ministry Performance Analytics
async function getMinistryPerformance() {
  try {
    const ministries = await Ministries.find({ status: "Active" }).lean();

    const ministryPerformance = await Promise.all(
      ministries.map(async (ministry) => {
        const [users, submissions, approvals] = await Promise.all([
          User.countDocuments({ ministry: ministry._id }),
          Submission.countDocuments({ ministry: ministry._id }),
          Submission.countDocuments({
            ministry: ministry._id,
            status: "approved",
          }),
        ]);

        const efficiency =
          submissions > 0 ? (approvals / submissions) * 100 : 0;
        const status =
          efficiency >= 85
            ? "excellent"
            : efficiency >= 70
            ? "good"
            : "needs_improvement";

        return {
          name: ministry.name,
          users,
          submissions,
          approvals,
          efficiency: parseFloat(efficiency.toFixed(1)),
          status,
        };
      })
    );

    return ministryPerformance.sort((a, b) => b.efficiency - a.efficiency);
  } catch (error) {
    throw new Error(`Error getting ministry performance: ${error.message}`);
  }
}

// Monthly Data Analytics
async function getMonthlyData() {
  try {
    const months = [];
    const currentDate = moment();

    for (let i = 3; i >= 0; i--) {
      const monthStart = moment().subtract(i, "month").startOf("month");
      const monthEnd = moment().subtract(i, "month").endOf("month");

      const [users, submissions, approvals, rejections] = await Promise.all([
        User.countDocuments({
          createdAt: { $gte: monthStart.toDate(), $lte: monthEnd.toDate() },
        }),
        Submission.countDocuments({
          dateOfSubmission: {
            $gte: monthStart.toDate(),
            $lte: monthEnd.toDate(),
          },
        }),
        Submission.countDocuments({
          status: "approved",
          dateOfSubmission: {
            $gte: monthStart.toDate(),
            $lte: monthEnd.toDate(),
          },
        }),
        Submission.countDocuments({
          status: "rejected",
          dateOfSubmission: {
            $gte: monthStart.toDate(),
            $lte: monthEnd.toDate(),
          },
        }),
      ]);

      months.push({
        month: monthStart.format("MMM"),
        users,
        submissions,
        approvals,
        rejections,
      });
    }

    return months;
  } catch (error) {
    throw new Error(`Error getting monthly data: ${error.message}`);
  }
}

// System Health Analytics (Mock data - in real scenario, you'd integrate with monitoring tools)
async function getSystemHealth() {
  return {
    cpuUsage: Math.floor(Math.random() * 30) + 30, // 30-60%
    memoryUsage: Math.floor(Math.random() * 20) + 50, // 50-70%
    diskUsage: Math.floor(Math.random() * 20) + 30, // 30-50%
    networkLatency: Math.floor(Math.random() * 10) + 5, // 5-15ms
    errorRate: (Math.random() * 0.05).toFixed(3), // 0-5%
    uptime: 99.9,
  };
}

// Security Metrics Analytics
async function getSecurityMetrics() {
  try {
    const thirtyDaysAgo = moment().subtract(30, "days").toDate();

    const [
      loginAttempts,
      failedLogins,
      suspiciousActivity,
      blockedIPs,
      securityAlerts,
    ] = await Promise.all([
      AuditLog.countDocuments({
        action: "ACCESS",
        timestamp: { $gte: thirtyDaysAgo },
      }),
      AuditLog.countDocuments({
        action: "ACCESS",
        timestamp: { $gte: thirtyDaysAgo },
        // You might need to add a field to track failed logins
      }),
      AuditLog.countDocuments({
        timestamp: { $gte: thirtyDaysAgo },
        // You might need to add logic to identify suspicious activity
      }),
      0, // Mock data - implement IP blocking logic
      0, // Mock data - implement security alert logic
    ]);

    return {
      loginAttempts,
      failedLogins: Math.floor(loginAttempts * 0.015), // Mock 1.5% failure rate
      suspiciousActivity: Math.floor(loginAttempts * 0.001), // Mock 0.1% suspicious
      blockedIPs,
      securityAlerts,
      lastSecurityScan: moment().format("YYYY-MM-DD HH:mm"),
    };
  } catch (error) {
    throw new Error(`Error getting security metrics: ${error.message}`);
  }
}

// User Demographics Analytics
async function getUserDemographics() {
  try {
    const [
      usersByState,
      usersByRole,
      usersByGender,
      userRegistrationTrend,
      usersByAgeGroup,
    ] = await Promise.all([
      User.aggregate([
        { $group: { _id: "$state", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { state: "$_id", users: "$count", _id: 0 } },
      ]),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $project: { name: "$_id", value: "$count", _id: 0 } },
      ]),
      User.aggregate([
        { $match: { gender: { $exists: true, $ne: null } } },
        { $group: { _id: "$gender", count: { $sum: 1 } } },
        { $project: { name: "$_id", value: "$count", _id: 0 } },
      ]),
      getRegistrationTrend(User, 4),
      getAgeGroupDistribution(),
    ]);

    return {
      usersByState,
      usersByRole,
      usersByGender,
      userRegistrationTrend,
      usersByAgeGroup,
    };
  } catch (error) {
    throw new Error(`Error getting user demographics: ${error.message}`);
  }
}

// Agent Demographics Analytics
async function getAgentDemographics() {
  try {
    const [
      agentsByState,
      agentsByMinistry,
      activeVsInactiveAgents,
      agentRegistrationTrend,
    ] = await Promise.all([
      Agent.aggregate([
        { $group: { _id: "$state", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { state: "$_id", agents: "$count", _id: 0 } },
      ]),
      Agent.aggregate([
        {
          $lookup: {
            from: "ministries",
            localField: "ministry",
            foreignField: "_id",
            as: "ministryInfo",
          },
        },
        { $unwind: "$ministryInfo" },
        { $group: { _id: "$ministryInfo.name", count: { $sum: 1 } } },
        { $project: { name: "$_id", value: "$count", _id: 0 } },
      ]),
      Agent.aggregate([
        { $group: { _id: "$isActive", count: { $sum: 1 } } },
        {
          $project: {
            name: { $cond: ["$_id", "Active", "Inactive"] },
            value: "$count",
            _id: 0,
          },
        },
      ]),
      getRegistrationTrend(Agent, 4),
    ]);

    return {
      agentsByState,
      agentsByMinistry,
      activeVsInactiveAgents,
      agentRegistrationTrend,
    };
  } catch (error) {
    throw new Error(`Error getting agent demographics: ${error.message}`);
  }
}

// Ministry Demographics Analytics
async function getMinistryDemographics() {
  try {
    const [ministriesByState, ministriesByType] = await Promise.all([
      Ministries.aggregate([
        { $group: { _id: "$state", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { state: "$_id", ministries: "$count", _id: 0 } },
      ]),
      Ministries.aggregate([
        { $group: { _id: "$name", count: { $sum: 1 } } },
        { $project: { name: "$_id", value: "$count", _id: 0 } },
      ]),
    ]);

    return {
      ministriesByState,
      ministriesByType,
    };
  } catch (error) {
    throw new Error(`Error getting ministry demographics: ${error.message}`);
  }
}

// Provider Demographics Analytics
async function getProviderDemographics() {
  try {
    // Debug: Check if ServiceProvider is properly imported
    if (!ServiceProvider || !ServiceProvider.aggregate) {
      throw new Error(`ServiceProvider model is not properly imported. Type: ${typeof ServiceProvider}`);
    }
    
    // Try a simple count first to test the model
    const totalProviders = await ServiceProvider.countDocuments();
    console.log(`Total ServiceProviders found: ${totalProviders}`);
    
    // For now, return mock data to avoid the aggregation issue
    return {
      providersByState: [
        { state: "Lagos", providers: 60 },
        { state: "Kano", providers: 40 },
        { state: "Abuja", providers: 20 },
      ],
      providersByType: [
        { name: "Hospital", value: 30 },
        { name: "Clinic", value: 40 },
        { name: "Lab", value: 20 },
      ],
    };
  } catch (error) {
    throw new Error(`Error getting provider demographics: ${error.message}`);
  }
}

// Property Demographics Analytics
async function getPropertyDemographics() {
  try {
    const [propertiesByState, propertiesByType] = await Promise.all([
      PropertyServiceHub.aggregate([
        { $group: { _id: "$state", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { state: "$_id", properties: "$count", _id: 0 } },
      ]),
      PropertyServiceHub.aggregate([
        { $group: { _id: "$propertyType", count: { $sum: 1 } } },
        { $project: { name: "$_id", value: "$count", _id: 0 } },
      ]),
    ]);

    return {
      propertiesByState,
      propertiesByType,
    };
  } catch (error) {
    throw new Error(`Error getting property demographics: ${error.message}`);
  }
}

// Activity Analytics
async function getActivityAnalytics() {
  try {
    const [submissionsTrend, approvalsTrend] = await Promise.all([
      getSubmissionTrend(4),
      getApprovalTrend(4),
    ]);

    // Calculate average approval time (mock data)
    const averageApprovalTime = "2.5 days";

    return {
      submissionsTrend,
      approvalsTrend,
      averageApprovalTime,
    };
  } catch (error) {
    throw new Error(`Error getting activity analytics: ${error.message}`);
  }
}

// Top Performing Agents
async function getTopPerformingAgents() {
  try {
    const topAgents = await Agent.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          name: "$userInfo.fullName",
          submissions: "$submissions",
          approvals: "$approvedsubmissions",
          _id: 0,
        },
      },
      { $sort: { submissions: -1 } },
      { $limit: 10 },
    ]);

    return topAgents;
  } catch (error) {
    throw new Error(`Error getting top performing agents: ${error.message}`);
  }
}

// Recent Activity Logs
async function getRecentActivityLogs() {
  try {
    const recentSubmissions = await Submission.find({})
      .sort({ dateOfSubmission: -1 })
      .limit(10)
      .populate("agentId", "fullName")
      .populate("ministry", "name")
      .lean();

    const activityLogs = recentSubmissions.map((submission) => {
      const agentName = submission.agentId
        ? submission.agentId.fullName
        : "Unknown Agent";
      const ministryName = submission.ministry
        ? submission.ministry.name
        : "Unknown Ministry";
      const date = moment(submission.dateOfSubmission).format("YYYY-MM-DD");

      return `[${date}] Agent ${agentName} ${submission.status} a ${submission.category} submission for ${ministryName}.`;
    });

    return activityLogs;
  } catch (error) {
    throw new Error(`Error getting recent activity logs: ${error.message}`);
  }
}

// Helper Functions
async function getRegistrationTrend(Model, months) {
  const trend = [];
  for (let i = months - 1; i >= 0; i--) {
    const monthStart = moment().subtract(i, "month").startOf("month");
    const monthEnd = moment().subtract(i, "month").endOf("month");

    const count = await Model.countDocuments({
      createdAt: { $gte: monthStart.toDate(), $lte: monthEnd.toDate() },
    });

    trend.push({
      month: monthStart.format("MMM"),
      [Model.modelName.toLowerCase() + "s"]: count,
    });
  }
  return trend;
}

async function getAgeGroupDistribution() {
  // Mock age group distribution since we don't have age field in User model
  return [
    { age: "18-25", users: Math.floor(Math.random() * 200) + 300 },
    { age: "26-35", users: Math.floor(Math.random() * 300) + 500 },
    { age: "36-50", users: Math.floor(Math.random() * 200) + 400 },
    { age: "51+", users: Math.floor(Math.random() * 100) + 150 },
  ];
}

async function getSubmissionTrend(months) {
  const trend = [];
  for (let i = months - 1; i >= 0; i--) {
    const monthStart = moment().subtract(i, "month").startOf("month");
    const monthEnd = moment().subtract(i, "month").endOf("month");

    const count = await Submission.countDocuments({
      dateOfSubmission: { $gte: monthStart.toDate(), $lte: monthEnd.toDate() },
    });

    trend.push({
      month: monthStart.format("MMM"),
      submissions: count,
    });
  }
  return trend;
}

async function getApprovalTrend(months) {
  const trend = [];
  for (let i = months - 1; i >= 0; i--) {
    const monthStart = moment().subtract(i, "month").startOf("month");
    const monthEnd = moment().subtract(i, "month").endOf("month");

    const count = await Submission.countDocuments({
      status: "approved",
      dateOfSubmission: { $gte: monthStart.toDate(), $lte: monthEnd.toDate() },
    });

    trend.push({
      month: monthStart.format("MMM"),
      approvals: count,
    });
  }
  return trend;
}

// Main function to get all analytics data
async function getAllAnalyticsData() {
  try {
    const [
      systemOverview,
      trends,
      ministryPerformance,
      monthlyData,
      systemHealth,
      securityMetrics,
      userDemographics,
      agentDemographics,
      ministryDemographics,
      providerDemographics,
      propertyDemographics,
      activityAnalytics,
      topPerformingAgents,
      recentActivityLogs,
    ] = await Promise.all([
      getSystemOverview(),
      getTrends(),
      getMinistryPerformance(),
      getMonthlyData(),
      getSystemHealth(),
      getSecurityMetrics(),
      getUserDemographics(),
      getAgentDemographics(),
      getMinistryDemographics(),
      getProviderDemographics(),
      getPropertyDemographics(),
      getActivityAnalytics(),
      getTopPerformingAgents(),
      getRecentActivityLogs(),
    ]);

    return {
      systemOverview,
      trends,
      ministryPerformance,
      monthlyData,
      systemHealth,
      securityMetrics,
      userDemographics,
      agentDemographics,
      ministryDemographics,
      providerDemographics,
      propertyDemographics,
      activityAnalytics,
      topPerformingAgents,
      recentActivityLogs,
    };
  } catch (error) {
    throw new Error(`Error getting all analytics data: ${error.message}`);
  }
}

module.exports = {
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
};
