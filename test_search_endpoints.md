# Service Provider Search Endpoints Test

This file contains test cases to verify all documented search endpoints work correctly.

## Base URL
```
http://localhost:8000/api/v1/serviceproviderservicehub/service-provider-hub/search
```

## Test Cases

### 1. Basic Search
```bash
GET /search?search=mechanic
```
**Expected**: Returns service providers with "mechanic" in profession, specialization, business name, service description, address, or user's full name.

### 2. Search by User Name
```bash
GET /search?userName=John Doe
```
**Expected**: Returns service providers with exact user name "John Doe".

### 3. Search by Full Name
```bash
GET /search?search=Victor Maduka
```
**Expected**: Returns service providers with "Victor Maduka" in any searchable field.

### 4. Filter by Profession and Location
```bash
GET /search?profession=Auto Mechanic&state=Lagos
```
**Expected**: Returns auto mechanics in Lagos state.

### 5. Filter by Category
```bash
GET /search?category=Repair
```
**Expected**: Returns service providers in repair categories.

### 6. Filter by Multiple Professions
```bash
GET /search?profession=Auto Mechanic,Plumber
```
**Expected**: Returns mechanics or plumbers.

### 7. Filter by Rating Range
```bash
GET /search?minRating=3.5&maxRating=5.0
```
**Expected**: Returns providers with rating between 3.5 and 5.0.

### 8. Filter by Experience Range
```bash
GET /search?minExperience=2&maxExperience=10
```
**Expected**: Returns providers with 2-10 years of experience.

### 9. Filter by Verification Status
```bash
GET /search?isVerified=true
```
**Expected**: Returns only verified providers.

### 10. Filter by Availability and Status
```bash
GET /search?availability=Available&status=Active
```
**Expected**: Returns available and active providers.

### 11. Filter by Date Range
```bash
GET /search?createdAfter=2023-01-01&createdBefore=2023-12-31
```
**Expected**: Returns providers created in 2023.

### 12. Complex Search with Pagination
```bash
GET /search?search=mechanic&state=Lagos&isVerified=true&minRating=4.0&sort=-rating.average&page=1&limit=20
```
**Expected**: Returns verified mechanics in Lagos with high ratings, sorted by rating.

### 13. Filter by Skills
```bash
GET /search?skills=welding,electrical,diagnostics
```
**Expected**: Returns providers with specific skills.

### 14. Filter by Ministry
```bash
GET /search?ministry=507f1f77bcf86cd799439014
```
**Expected**: Returns providers assigned to specific ministry.

### 15. Combined Name and Category Search
```bash
GET /search?search=Victor&category=Repair
```
**Expected**: Returns someone named Victor in repair categories.

### 16. Without Related Data
```bash
GET /search?populate=false
```
**Expected**: Returns results without populated user, kyc, and ministry data.

## Sorting Tests

### 17. Sort by Rating (Highest First)
```bash
GET /search?sort=-rating.average
```
**Expected**: Returns results sorted by highest rating first.

### 18. Sort by Rating (Lowest First)
```bash
GET /search?sort=rating.average
```
**Expected**: Returns results sorted by lowest rating first.

### 19. Sort by Experience (Most Experienced First)
```bash
GET /search?sort=-yearsOfExperience
```
**Expected**: Returns results sorted by most experienced first.

### 20. Sort by Experience (Least Experienced First)
```bash
GET /search?sort=yearsOfExperience
```
**Expected**: Returns results sorted by least experienced first.

### 21. Sort by Profession (Alphabetical)
```bash
GET /search?sort=profession
```
**Expected**: Returns results sorted alphabetically by profession.

### 22. Sort by Profession (Reverse Alphabetical)
```bash
GET /search?sort=-profession
```
**Expected**: Returns results sorted reverse alphabetically by profession.

## Response Format Verification

Each response should include:
- `success`: boolean
- `message`: string
- `data`: array of service providers with:
  - Basic service provider fields
  - `user`: populated user data
  - `kyc`: populated KYC data
  - `ministry`: populated ministry data
  - `certifications`: array of certifications
- `pagination`: pagination metadata
- `filters`: applied filters

## Error Handling Tests

### 23. Invalid Parameter
```bash
GET /search?minRating=invalid
```
**Expected**: Returns 400 error with appropriate message.

### 24. Invalid Date Format
```bash
GET /search?createdAfter=invalid-date
```
**Expected**: Returns 400 error or handles gracefully.

## Notes

- All text searches should be case-insensitive
- All filters should work with both single values and comma-separated arrays
- Pagination should work correctly with page and limit parameters
- Population should be enabled by default but can be disabled
- All documented sorting options should work
- Error responses should be consistent and informative
