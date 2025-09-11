# Service Provider Get By ID API

This document describes the endpoint for retrieving a specific service provider by ID with the same data structure as the search endpoint.

## Endpoint

```
GET /service-provider-hub/id/:id
```

## Overview

The get by ID endpoint retrieves a specific service provider with all related data including user information, KYC data, ministry details, and certifications. This endpoint returns the same data structure as the search endpoint but for a single service provider.

## Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | string | The MongoDB ObjectId of the service provider | `"507f1f77bcf86cd799439011"` |

## Response Format

```json
{
  "success": true,
  "message": "Service provider retrieved successfully",
  "data": {
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
}
```

## Usage Examples

### 1. Get Service Provider by ID

Retrieve a specific service provider with all related data:

```
GET /service-provider-hub/id/507f1f77bcf86cd799439011
```

### 2. Get Service Provider by ID (Response)

The response will include:
- **Service Provider Data**: All basic service provider information
- **User Data**: Full name, email, phone number, gender
- **KYC Data**: NIN, photo, date of birth
- **Ministry Data**: Ministry name and description
- **Certifications**: All certifications linked to the service provider

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Service provider ID is required"
}
```

```json
{
  "success": false,
  "message": "Invalid service provider ID format. Must be a valid MongoDB ObjectId."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Service provider not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving service provider"
}
```

## Data Structure Details

### Service Provider Fields
- `_id`: MongoDB ObjectId
- `profession`: Service provider's profession
- `category`: Service category
- `specialization`: Specific area of expertise
- `skills`: Array of skills
- `yearsOfExperience`: Number of years of experience
- `availability`: Current availability status
- `isVerified`: Verification status
- `status`: Active/Inactive status
- `approvalstatus`: Approval status
- `rating`: Rating object with average and note
- `address`: Address object with street, city, state, zip
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### User Data
- `_id`: User ID
- `fullName`: User's full name
- `email`: User's email address
- `phoneNumber`: User's phone number
- `gender`: User's gender

### KYC Data
- `_id`: KYC record ID
- `fullName`: Full name on KYC
- `nin`: National Identification Number
- `photo`: Profile photo URL
- `dateOfBirth`: Date of birth

### Ministry Data
- `_id`: Ministry ID
- `name`: Ministry name
- `description`: Ministry description

### Certifications
- `_id`: Certification ID
- `certificationType`: Type of certification
- `profession`: Profession covered
- `specialization`: Specialization covered
- `category`: Category covered
- `validityPeriod`: Validity period in days
- `licenseActive`: Whether license is active
- `certificateReferenceId`: Certificate reference ID
- `issueDate`: Issue date
- `expirationDate`: Expiration date
- `status`: Certification status
- `certificationAddressedTo`: Person addressed to
- `issuedBy`: Issuing authority

## Notes

1. **Same Structure as Search**: This endpoint returns the exact same data structure as the search endpoint, ensuring consistency across the API.

2. **Populated Data**: All related data (user, kyc, ministry, certifications) is automatically populated.

3. **Certifications**: Certifications are linked via the user's entityId and include all relevant certification details.

4. **Error Handling**: Comprehensive error handling for missing IDs, not found records, and server errors.

5. **Performance**: Optimized with proper MongoDB population and efficient queries.

## Authentication

This endpoint may require authentication depending on your application's security requirements. Check with your API documentation for specific authentication requirements.
