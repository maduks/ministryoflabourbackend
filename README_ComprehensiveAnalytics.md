# Comprehensive Analytics API Documentation

This document provides detailed information about the comprehensive analytics endpoints that provide all the data needed for your analytics dashboard.

## Base URL
```
/api/v1/comprehensive-analytics
```

## Authentication
All endpoints require admin authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints Overview

### 1. Get All Analytics Data
**Endpoint:** `GET /api/v1/comprehensive-analytics/all`

**Description:** Returns all analytics data in a single request, matching the structure of your mock data.

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "systemOverview": {
      "totalUsers": 1247,
      "activeUsers": 1089,
      "totalMinistries": 12,
      "activeMinistries": 12,
      "totalSubmissions": 15678,
      "approvedSubmissions": 12543,
      "pendingSubmissions": 2134,
      "rejectedSubmissions": 1001,
      "systemUptime": 99.9,
      "avgResponseTime": 245
    },
    "trends": {
      "userGrowth": "+12.5%",
      "submissionGrowth": "+8.3%",
      "approvalRate": "80.1%",
      "systemHealth": "Excellent"
    },
    "ministryPerformance": [
      {
        "name": "Ministry of Health",
        "users": 324,
        "submissions": 4567,
        "approvals": 3890,
        "efficiency": 85.2,
        "status": "excellent"
      }
    ],
    "monthlyData": [
      {
        "month": "Jan",
        "users": 1089,
        "submissions": 1234,
        "approvals": 987,
        "rejections": 247
      }
    ],
    "systemHealth": {
      "cpuUsage": 45,
      "memoryUsage": 62,
      "diskUsage": 38,
      "networkLatency": 12,
      "errorRate": 0.02,
      "uptime": 99.9
    },
    "securityMetrics": {
      "loginAttempts": 15678,
      "failedLogins": 234,
      "suspiciousActivity": 12,
      "blockedIPs": 45,
      "securityAlerts": 3,
      "lastSecurityScan": "2024-01-15 10:30"
    },
    "userDemographics": {
      "usersByState": [
        { "state": "Lagos", "users": 1200 },
        { "state": "Kano", "users": 800 }
      ],
      "usersByRole": [
        { "name": "Agent", "value": 400 },
        { "name": "Ministry Admin", "value": 50 }
      ],
      "usersByGender": [
        { "name": "Male", "value": 900 },
        { "name": "Female", "value": 1050 }
      ],
      "userRegistrationTrend": [
        { "month": "Jan", "users": 120 },
        { "month": "Feb", "users": 150 }
      ],
      "usersByAgeGroup": [
        { "age": "18-25", "users": 400 },
        { "age": "26-35", "users": 700 }
      ]
    },
    "agentDemographics": {
      "agentsByState": [
        { "state": "Lagos", "agents": 100 },
        { "state": "Kano", "agents": 80 }
      ],
      "agentsByMinistry": [
        { "name": "Health", "value": 50 },
        { "name": "Education", "value": 30 }
      ],
      "activeVsInactiveAgents": [
        { "name": "Active", "value": 180 },
        { "name": "Inactive", "value": 40 }
      ],
      "agentRegistrationTrend": [
        { "month": "Jan", "agents": 20 },
        { "month": "Feb", "agents": 25 }
      ]
    },
    "ministryDemographics": {
      "ministriesByState": [
        { "state": "Lagos", "ministries": 3 },
        { "state": "Kano", "ministries": 2 }
      ],
      "ministriesByType": [
        { "name": "Health", "value": 2 },
        { "name": "Education", "value": 2 }
      ]
    },
    "providerDemographics": {
      "providersByState": [
        { "state": "Lagos", "providers": 60 },
        { "state": "Kano", "providers": 40 }
      ],
      "providersByType": [
        { "name": "Hospital", "value": 30 },
        { "name": "Clinic", "value": 40 }
      ]
    },
    "propertyDemographics": {
      "propertiesByState": [
        { "state": "Lagos", "properties": 40 },
        { "state": "Kano", "properties": 30 }
      ],
      "propertiesByType": [
        { "name": "Hospital", "value": 10 },
        { "name": "Clinic", "value": 20 }
      ]
    },
    "activityAnalytics": {
      "submissionsTrend": [
        { "month": "Jan", "submissions": 400 },
        { "month": "Feb", "submissions": 450 }
      ],
      "approvalsTrend": [
        { "month": "Jan", "approvals": 350 },
        { "month": "Feb", "approvals": 400 }
      ],
      "averageApprovalTime": "2.5 days"
    },
    "topPerformingAgents": [
      {
        "name": "John Doe",
        "submissions": 45,
        "approvals": 40
      }
    ],
    "recentActivityLogs": [
      "[2024-04-01] Agent John Doe submitted a new property registration.",
      "[2024-04-01] Ministry of Health approved a new provider."
    ]
  },
  "message": "Analytics data retrieved successfully"
}
```

## Individual Endpoints

### 2. System Overview
**Endpoint:** `GET /api/v1/comprehensive-analytics/system-overview`

**Description:** Returns system overview metrics including user counts, ministry counts, and submission statistics.

### 3. Trends
**Endpoint:** `GET /api/v1/comprehensive-analytics/trends`

**Description:** Returns growth trends and performance indicators.

### 4. Ministry Performance
**Endpoint:** `GET /api/v1/comprehensive-analytics/ministry-performance`

**Description:** Returns performance metrics for each ministry including efficiency ratings.

### 5. Monthly Data
**Endpoint:** `GET /api/v1/comprehensive-analytics/monthly-data`

**Description:** Returns monthly trends for users, submissions, approvals, and rejections.

### 6. System Health
**Endpoint:** `GET /api/v1/comprehensive-analytics/system-health`

**Description:** Returns system health metrics (CPU, memory, disk usage, etc.).

### 7. Security Metrics
**Endpoint:** `GET /api/v1/comprehensive-analytics/security-metrics`

**Description:** Returns security-related metrics including login attempts and security alerts.

### 8. User Demographics
**Endpoint:** `GET /api/v1/comprehensive-analytics/user-demographics`

**Description:** Returns user demographic data including distribution by state, role, gender, and age groups.

### 9. Agent Demographics
**Endpoint:** `GET /api/v1/comprehensive-analytics/agent-demographics`

**Description:** Returns agent demographic data including distribution by state, ministry, and activity status.

### 10. Ministry Demographics
**Endpoint:** `GET /api/v1/comprehensive-analytics/ministry-demographics`

**Description:** Returns ministry demographic data including distribution by state and type.

### 11. Provider Demographics
**Endpoint:** `GET /api/v1/comprehensive-analytics/provider-demographics`

**Description:** Returns service provider demographic data including distribution by state and type.

### 12. Property Demographics
**Endpoint:** `GET /api/v1/comprehensive-analytics/property-demographics`

**Description:** Returns property demographic data including distribution by state and type.

### 13. Activity Analytics
**Endpoint:** `GET /api/v1/comprehensive-analytics/activity-analytics`

**Description:** Returns activity trends including submission and approval patterns.

### 14. Top Performing Agents
**Endpoint:** `GET /api/v1/comprehensive-analytics/top-performing-agents`

**Description:** Returns list of top performing agents based on submission and approval counts.

### 15. Recent Activity Logs
**Endpoint:** `GET /api/v1/comprehensive-analytics/recent-activity-logs`

**Description:** Returns recent activity logs formatted as readable strings.

## Data Sources

The analytics endpoints pull data from the following models:

- **User**: User accounts, demographics, and activity
- **Ministry**: Ministry information and performance
- **Agent**: Agent data and performance metrics
- **Submission**: Submission tracking and status
- **ServiceProvider**: Service provider registrations
- **Business**: Business registrations
- **PropertyServiceHub**: Property registrations
- **Transaction**: Financial transactions
- **AuditLog**: System activity logs
- **Notification**: System notifications

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Performance Considerations

- The `/all` endpoint aggregates data from multiple sources and may take longer to respond
- Individual endpoints are optimized for faster response times
- Consider caching frequently accessed data
- Use individual endpoints for real-time updates and the `/all` endpoint for dashboard initialization

## Usage Examples

### Get All Analytics Data
```bash
curl -X GET "http://localhost:8000/api/v1/comprehensive-analytics/all" \
  -H "Authorization: Bearer your-jwt-token"
```

### Get System Overview Only
```bash
curl -X GET "http://localhost:8000/api/v1/comprehensive-analytics/system-overview" \
  -H "Authorization: Bearer your-jwt-token"
```

### Get User Demographics
```bash
curl -X GET "http://localhost:8000/api/v1/comprehensive-analytics/user-demographics" \
  -H "Authorization: Bearer your-jwt-token"
```

## Notes

- All endpoints require admin-level authentication
- Data is calculated in real-time from the database
- Some metrics (like system health) may include mock data where real monitoring isn't available
- Age group distribution uses mock data since the User model doesn't include age fields
- Security metrics are based on audit logs and may need additional implementation for full functionality
