# Printing Module

The Printing Module provides APIs for generating printable documents for students, including ID cards, sitting slips, attendance sheets, and verification slips.

## Overview

All endpoints require authentication via `AdminAuth` and API key. Generated documents are:

1. Returned as a downloadable file
2. Automatically uploaded to Firebase Storage (path returned in `X-Firebase-Path` header)

## Base URL

```bash
/printing
```

---

## ID Cards

Generate student ID cards as a PDF. Cards are arranged in a grid (4×2 = 8 cards per page) and include student photo placeholder, QR code, and colored ribbon based on van assignment rules.

### Preview Data

Get the list of students that would be included in the ID card generation.

```bash
GET /printing/id-cards/preview
```

**Query Parameters:**

| Parameter      | Type               | Required    | Description                                                                             |
| -------------- | ------------------ | ----------- | --------------------------------------------------------------------------------------- |
| `admissionIds` | UUID[]             | No          | Specific admission IDs to generate cards for. When provided, other filters are ignored. |
| `sessionId`    | UUID               | Conditional | Session ID to filter admissions. Required when `admissionIds` is not provided.          |
| `branchId`     | UUID               | No          | Filter by branch                                                                        |
| `areaId`       | UUID               | No          | Filter by area                                                                          |
| `vanId`        | UUID               | No          | Filter by van (students in areas served by this van)                                    |
| `classLevelId` | UUID               | No          | Filter by class level                                                                   |
| `status`       | string             | No          | Admission status filter                                                                 |
| `isFeePaid`    | boolean            | No          | Filter by fee payment status                                                            |
| `isFinalized`  | boolean            | No          | Filter by finalization status                                                           |
| `gender`       | `MALE` \| `FEMALE` | No          | Filter by gender                                                                        |

**Response:**

```json
{
  "count": 150,
  "data": [
    {
      "grNumber": "9221-0-1-000001",
      "name": "محمد علی",
      "fatherName": "احمد حسین",
      "dateOfBirth": "2015-03-15T00:00:00.000Z",
      "phone": "03001234567",
      "gender": "MALE",
      "area": {
        "name": "5D, New Karachi",
        "alias": "North Karachi",
        "hasVan": true,
        "hasBoysVan": true
      },
      "branch": {
        "code": "NK",
        "name": "New Karachi",
        "defaultColorHex": "#0047BB"
      },
      "classLevel": {
        "name": "محبان ۵",
        "group": "MUHIBAN"
      },
      "van": {
        "colorHex": "#800080"
      },
      "ribbonColorHex": "#800080"
    }
  ]
}
```

### Preview Design

Get a sample PDF with mock data to preview the card design.

```bash
GET /printing/id-cards/preview-design
```

**Response:** PDF file download

### Generate ID Cards

Generate ID cards PDF for students matching the filters.

```bash
POST /printing/id-cards/generate
```

**Request Body:** Same parameters as preview (in JSON body)

Option 1 - Bulk generation with filters:

```json
{
  "sessionId": "uuid",
  "branchId": "uuid",
  "areaId": "uuid"
}
```

Option 2 - Specific students by admission IDs:

```json
{
  "admissionIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response:** PDF file download

**Response Headers:**

- `X-Firebase-Path`: Firebase Storage path where the file was uploaded
- `X-Card-Count`: Number of cards generated

---

## Sitting Slips

Generate sitting arrangement slips for NASIRAN (senior) students. Used for exam seating arrangements. Each slip shows seat number (separated by gender), GR#, name, and father's name.

### Preview Data

```bash
GET /printing/sitting-slips/preview
```

**Query Parameters:**

| Parameter      | Type               | Required    | Description                                                                             |
| -------------- | ------------------ | ----------- | --------------------------------------------------------------------------------------- |
| `admissionIds` | UUID[]             | No          | Specific admission IDs to generate slips for. When provided, other filters are ignored. |
| `sessionId`    | UUID               | Conditional | Session ID. Required when `admissionIds` is not provided.                               |
| `branchId`     | UUID               | No          | Filter by branch                                                                        |
| `areaId`       | UUID               | No          | Filter by area                                                                          |
| `gender`       | `MALE` \| `FEMALE` | No          | Filter by gender                                                                        |

> Note: When using bulk filters (not `admissionIds`), only NASIRAN class level students are included automatically.

**Response:**

```json
{
  "count": 50,
  "data": [
    {
      "grNumber": "9221-0-1-000001",
      "name": "محمد علی",
      "fatherName": "احمد حسین",
      "gender": "MALE"
    }
  ]
}
```

### Preview Design

```bash
GET /printing/sitting-slips/preview-design
```

**Response:** PDF file download

### Generate Sitting Slips

```bash
POST /printing/sitting-slips/generate
```

**Request Body:**

```json
{
  "sessionId": "uuid",
  "branchId": "uuid",
  "gender": "MALE"
}
```

**Response:** PDF file download

**Response Headers:**

- `X-Firebase-Path`: Firebase Storage path
- `X-Slip-Count`: Number of slips generated

> **Note:** If precise single-student sitting slip printing is required, the API can be updated to support filtering by `admissionIds` directly (similar to verification slips).

---

## Attendance Sheets

Generate Excel spreadsheets for tracking student attendance. Includes a student info sheet and multiple attendance tracking sheets (5 days per sheet, 20 days total).

### Preview Data

```bash
GET /printing/attendance-sheets/preview
```

**Query Parameters:**

| Parameter          | Type               | Required | Description                                              |
| ------------------ | ------------------ | -------- | -------------------------------------------------------- |
| `sessionId`        | UUID               | Yes      | Session ID                                               |
| `areaId`           | UUID               | Yes      | Area ID (sheets are generated per area)                  |
| `classLevelGroups` | array              | No       | Filter by class level groups (default: MUHIBAN, NASIRAN) |
| `gender`           | `MALE` \| `FEMALE` | No       | Filter by gender                                         |

**Response:**

```json
{
  "count": 30,
  "areaName": "5D, New Karachi",
  "areaAlias": "North Karachi",
  "data": [
    {
      "grNumber": "9221-0-1-000001",
      "name": "محمد علی",
      "fatherName": "احمد حسین",
      "phone": "03001234567",
      "gender": "MALE",
      "className": "محبان ۵",
      "areaName": "5D, New Karachi",
      "areaAlias": "North Karachi"
    }
  ]
}
```

### Generate Attendance Sheets

```
POST /printing/attendance-sheets/generate
```

**Request Body:**

```json
{
  "sessionId": "uuid",
  "areaId": "uuid",
  "gender": "FEMALE"
}
```

**Response:** Excel (.xlsx) file download

**Response Headers:**

- `X-Firebase-Path`: Firebase Storage path
- `X-Student-Count`: Number of students in the sheet

---

## Verification Slips

Generate verification slips for manual admission verification. Each slip is an A5 landscape page with student details and class-level logo. Useful for confirming student registrations.

### Preview Data

```
POST /printing/verification-slips/preview
```

**Request Body:**

```json
{
  "admissionIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response:**

```json
{
  "count": 3,
  "data": [
    {
      "admissionId": "uuid-1",
      "grNumber": "9221-0-1-000001",
      "name": "محمد علی",
      "fatherName": "احمد حسین",
      "dateOfBirth": "2015-03-15T00:00:00.000Z",
      "className": "محبان ۵",
      "classLevelGroup": "MUHIBAN",
      "areaName": "5D, New Karachi",
      "areaAlias": "North Karachi",
      "branchName": "New Karachi Branch"
    }
  ]
}
```

### Preview Design

```
GET /printing/verification-slips/preview-design
```

**Response:** PDF file download

### Generate Verification Slips

```
POST /printing/verification-slips/generate
```

**Request Body:**

```json
{
  "admissionIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response:** PDF file download

**Response Headers:**

- `X-Firebase-Path`: Firebase Storage path
- `X-Slip-Count`: Number of slips generated

---

## Typical Workflow

1. **Preview**: Call the preview endpoint to see how many students/documents will be generated and review the data
2. **Generate**: Call the generate endpoint with the same filters to create and download the document
3. **Access Later**: Use the `X-Firebase-Path` header value to access the uploaded file from Firebase Storage

## Error Handling

| Status Code | Description                                                         |
| ----------- | ------------------------------------------------------------------- |
| 400         | Invalid request parameters (missing required fields, invalid UUIDs) |
| 401         | Unauthorized (missing or invalid auth token)                        |
| 404         | Resource not found (for verification slips: admission ID not found) |
| 500         | Server error during document generation                             |
