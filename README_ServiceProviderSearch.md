# Service Provider Search and Filter API

This document describes the comprehensive search and filter endpoint for the ServiceProviderServiceHub model.

## Endpoint

```
GET /service-provider-hub/search
```

## Overview

The search and filter endpoint allows you to search and filter service providers based on various criteria including profession, location, ratings, experience, and more. The endpoint supports both text search and specific field filtering with pagination.

## Query Parameters

### Search Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Text search across multiple fields (profession, specialization, business name, service description, address, user name) | `"mechanic"` |
| `userName` | string | Search specifically by user's full name | `"John Doe"` |

### Filter Parameters

#### Basic Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `profession` | string/array | Filter by profession(s) | `"Auto Mechanic"` or `"Auto Mechanic,Plumber"` |
| `category` | string/array | Filter by category(ies) | `"Automotive"` or `"Automotive,Plumbing"` |
| `specialization` | string/array | Filter by specialization(s) | `"Engine Repair"` or `"Engine Repair,Electrical"` |
| `skills` | array | Filter by skills (comma-separated) | `"welding,electrical,diagnostics"` |
| `yearsOfExperience` | number | Filter by exact years of experience | `5` |
| `availability` | string/array | Filter by availability status | `"Available"` or `"Available,Unavailable"` |
| `isVerified` | boolean | Filter by verification status | `true` or `false` |
| `status` | string/array | Filter by status | `"Active"` or `"Active,Inactive"` |
| `approvalstatus` | string/array | Filter by approval status | `"approved"` or `"pending,approved"` |
| `ministry` | string/array | Filter by ministry ID(s) | `"507f1f77bcf86cd799439011"` |
| `educationLevels` | string/array | Filter by education level(s) | `"Bachelor"` or `"Bachelor,Master"` |

#### Location Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `state` | string | Filter by state (case-insensitive) | `"Lagos"` |
| `city` | string | Filter by city (case-insensitive) | `"Victoria Island"` |
| `zip` | string | Filter by zip code | `"100001"` |

#### Rating Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `minRating` | number | Minimum rating (0-5) | `3.5` |
| `maxRating` | number | Maximum rating (0-5) | `5.0` |

#### Experience Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `minExperience` | number | Minimum years of experience | `2` |
| `maxExperience` | number | Maximum years of experience | `10` |

#### Date Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `createdAfter` | date | Filter providers created after this date | `"2023-01-01"` |
| `createdBefore` | date | Filter providers created before this date | `"2023-12-31"` |
| `assignedAfter` | date | Filter providers assigned after this date | `"2023-01-01"` |
| `assignedBefore` | date | Filter providers assigned before this date | `"2023-12-31"` |

#### Pagination and Sorting

| Parameter | Type | Description | Default | Example |
|-----------|------|-------------|---------|---------|
| `page` | number | Page number for pagination | `1` | `2` |
| `limit` | number | Number of results per page | `10` | `20` |
| `sort` | string | Sort field and direction | `"-createdAt"` | `"rating.average"` |
| `populate` | boolean | Include related data (user, kyc, ministry) | `true` | `false` |

## Response Format

```json
{
  "success": true,
  "message": "Service providers retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "profession": "Auto Mechanic",
      "category": "Automotive",
      "specialization": "Engine Repair",
      "skills": ["welding", "electrical", "diagnostics"],
      "yearsOfExperience": 5,
      "availability": "Available",
      "isVerified": true,
      "status": "Active",
      "approvalstatus": "approved",
      "rating": {
        "average": 4.5,
        "note": "Excellent service"
      },
      "address": {
        "street": "123 Main Street",
        "city": "Victoria Island",
        "state": "Lagos",
        "zip": "100001"
      },
             "user": {
         "_id": "507f1f77bcf86cd799439012",
         "fullName": "John Doe",
         "email": "john@example.com",
         "phoneNumber": "+2348012345678",
         "gender": "male"
       },
       "kyc": {
         "_id": "507f1f77bcf86cd799439013",
         "fullName": "John Doe",
         "nin": "12345678901",
         "photo": "https://example.com/photo.jpg",
         "dateOfBirth": "1990-01-01T00:00:00.000Z"
       },
       "ministry": {
         "_id": "507f1f77bcf86cd799439014",
         "name": "Ministry of Transportation",
         "description": "Handles transportation services"
       },
       "certifications": [
         {
           "_id": "507f1f77bcf86cd799439015",
           "certificationType": "professional",
           "profession": "Auto Mechanic",
           "specialization": "Engine Repair",
           "category": "Automotive",
           "validityPeriod": 365,
           "licenseActive": true,
           "certificateReferenceId": "CERT-2024-001",
           "issueDate": "2024-01-01T00:00:00.000Z",
           "expirationDate": "2025-01-01T00:00:00.000Z",
           "status": "active",
           "certificationAddressedTo": "John Doe",
           "issuedBy": "BDIC"
         }
       ],
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "search": "mechanic",
    "state": "Lagos",
    "minRating": 3.5,
    "page": 1,
    "limit": 10
  }
}
```

## Usage Examples

### 1. Basic Search (Includes User Name)

Search for service providers with "mechanic" in their profession, specialization, business name, service description, address, OR user's full name:

```
GET /service-provider-hub/search?search=mechanic
```

### 2. Search by Specific User Name

Search for service providers specifically by their full name:

```
GET /service-provider-hub/search?userName=John Doe
```

### 3. Search by Full Name

Search for service providers with exact full name:

```
GET /service-provider-hub/search?search=Victor Maduka
```

### 4. Filter by Profession and Location

Find auto mechanics in Lagos state:

```
GET /service-provider-hub/search?profession=Auto Mechanic&state=Lagos
```

### 5. Filter by Category

Find service providers in repair categories:

```
GET /service-provider-hub/search?category=Repair
```

### 6. Filter by Multiple Professions

Find mechanics or plumbers:

```
GET /service-provider-hub/search?profession=Auto Mechanic,Plumber
```

### 7. Filter by Rating Range

Find providers with rating between 3.5 and 5.0:

```
GET /service-provider-hub/search?minRating=3.5&maxRating=5.0
```

### 8. Filter by Experience Range

Find providers with 2-10 years of experience:

```
GET /service-provider-hub/search?minExperience=2&maxExperience=10
```

### 9. Filter by Verification Status

Find only verified providers:

```
GET /service-provider-hub/search?isVerified=true
```

### 10. Filter by Availability and Status

Find available and active providers:

```
GET /service-provider-hub/search?availability=Available&status=Active
```

### 11. Filter by Date Range

Find providers created in 2023:

```
GET /service-provider-hub/search?createdAfter=2023-01-01&createdBefore=2023-12-31
```

### 12. Complex Search with Pagination

Search for verified mechanics in Lagos with high ratings, sorted by rating:

```
GET /service-provider-hub/search?search=mechanic&state=Lagos&isVerified=true&minRating=4.0&sort=-rating.average&page=1&limit=20
```

### 13. Filter by Skills

Find providers with specific skills:

```
GET /service-provider-hub/search?skills=welding,electrical,diagnostics
```

### 14. Filter by Ministry

Find providers assigned to a specific ministry:

```
GET /service-provider-hub/search?ministry=507f1f77bcf86cd799439014
```

### 15. Combined Name and Category Search

Search for someone named Victor in repair categories:

```
GET /service-provider-hub/search?search=Victor&category=Repair
```

### 16. Without Related Data

Get results without populated user, kyc, and ministry data:

```
GET /service-provider-hub/search?populate=false
```

## Sorting Options

You can sort results using the `sort` parameter:

- `-createdAt` (default): Newest first
- `createdAt`: Oldest first
- `-rating.average`: Highest rating first
- `rating.average`: Lowest rating first
- `-yearsOfExperience`: Most experienced first
- `yearsOfExperience`: Least experienced first
- `profession`: Alphabetical by profession
- `-profession`: Reverse alphabetical by profession

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid parameter value"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error searching service providers"
}
```

## Recent Fixes & Updates

### Search by User Name (Latest Update)
- **Feature**: The `search` parameter now includes searching by service provider's full name
- **Implementation**: Uses MongoDB aggregation pipeline for optimal performance
- **Usage**: 
  - `search=Victor` - searches in profession, specialization, business name, service description, address, AND user's full name
  - `userName=Victor` - searches specifically in user's full name only
  - `search=Victor Maduka` - searches for the full name "Victor Maduka"

### Regex Escaping (Latest Update)
- **Issue**: Search terms with special regex characters (like parentheses, dots, asterisks) were causing "Invalid regular expression" errors
- **Fix**: All text-based searches now automatically escape special regex characters
- **Example**: `search=Generator Repairers (Small & Big Gen)` now works correctly instead of throwing regex errors

### Aggregation Pipeline Fix (Latest Update)
- **Issue**: Complex search queries were causing `$arrayElemAt` errors in MongoDB aggregation
- **Fix**: Simplified and optimized the aggregation pipeline structure
- **Result**: All search functionality now works reliably without aggregation errors

### Category Filter Enhancement (Latest Update)
- **Issue**: Category filter was not working properly
- **Fix**: Added case-insensitive regex search for category field with proper escaping
- **Result**: `category=Repair` now finds categories like "Generator Repair", "Auto Repair", etc.

### Certification Data Integration (Latest Update)
- **Feature**: All search results now include certification data for each service provider
- **Implementation**: Automatically joins with Certifications collection using entityId
- **Result**: Each service provider response includes their certifications, license status, and validity information

## Notes

1. **Text Search**: The `search` parameter performs case-insensitive search across multiple fields including profession, specialization, business name, service description, address fields, and user's full name.

2. **User Name Search**: The `userName` parameter allows you to search specifically by the service provider's full name. This uses MongoDB aggregation for optimal performance.

3. **Regex Escaping**: All text-based searches automatically escape special regex characters (like parentheses, dots, asterisks, etc.) to prevent regex errors and ensure safe searching.

4. **Case-Insensitive Filters**: All text-based filters (profession, category, specialization, etc.) are case-insensitive and support partial matching.

5. **Array Parameters**: For parameters that accept arrays, you can provide comma-separated values in the URL.

6. **Boolean Parameters**: Boolean parameters accept `true`, `false`, `1`, `0`, `yes`, `no` (case-insensitive).

7. **Date Format**: Use ISO 8601 format for dates (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ).

8. **Pagination**: The API returns pagination metadata including total count, current page, and navigation helpers.

9. **Population**: By default, related data (user, kyc, ministry) is populated. Set `populate=false` to exclude this data for better performance.

10. **Performance**: The endpoint uses database indexes for optimal performance. Complex queries with multiple filters may take longer to execute.

11. **Smart Query Selection**: The API automatically chooses between regular queries and aggregation pipelines based on the search requirements for optimal performance.

12. **Aggregation Pipeline**: User name searches use MongoDB aggregation to join with the Users collection, ensuring accurate name matching.

13. **Certification Data**: All search results include certification information when `populate=true`. Certifications are linked via the user's entityId and include license status, validity periods, and certification details.

## Rate Limiting

The endpoint is subject to rate limiting. Please implement appropriate caching and avoid making excessive requests.

## Authentication

This endpoint may require authentication depending on your application's security requirements. Check with your API documentation for specific authentication requirements. 