# Interaction Reporting Module

The Interaction Reporting Module provides analytics for student interaction ratings, aggregated by question. It enables administrators to identify questions with low performance and students who need attention.

## Overview

This module generates real-time reports on student interactions, providing:

1. Per-question rating distribution and statistics
2. Student clustering for low-performing ratings
3. Insights on best/worst questions and overall metrics

All data is computed fresh on each request (no caching).

## Base URL

```bash
/interactions/report
```

---

## Report Endpoint

Generate an interaction report with rating analytics per question.

```bash
GET /interactions/report
```

### Required Filters

| Parameter      | Type | Required | Description              |
| -------------- | ---- | -------- | ------------------------ |
| `sessionId`    | UUID | Yes      | Session to report on     |
| `classLevelId` | UUID | Yes      | Class level to filter by |
| `branchId`     | UUID | Yes      | Branch to filter by      |

### Optional Filters

| Parameter | Type | Required | Description                 |
| --------- | ---- | -------- | --------------------------- |
| `areaId`  | UUID | No       | Drill down by specific area |

---

## Response Structure

### Full Response

```json
{
  "questions": [
    {
      "questionId": "uuid",
      "prompt": "Question text here",
      "sortOrder": 1,
      "rating1Count": 5,
      "rating2Count": 8,
      "rating3Count": 20,
      "rating4Count": 45,
      "rating5Count": 22,
      "totalRatings": 100,
      "averageRating": 3.71,
      "lowRatingCount": 13,
      "lowRatingPercentage": 13.0,
      "studentsWithLowRating": [
        {
          "grNumber": "9221-0-1-000001",
          "name": "محمد علی",
          "areaName": "5D, New Karachi",
          "rating": 1
        },
        {
          "grNumber": "9221-0-1-000015",
          "name": "احمد حسین",
          "areaName": "5D, New Karachi",
          "rating": 2
        }
      ]
    }
  ],
  "insights": {
    "bestQuestion": {
      "questionId": "uuid",
      "prompt": "Best performing question",
      "averageRating": 4.5
    },
    "worstQuestion": {
      "questionId": "uuid",
      "prompt": "Worst performing question",
      "averageRating": 2.8
    },
    "overallAverageRating": 3.65,
    "totalStudentsWithInteractions": 150,
    "totalStudentsNeedingAttention": 25
  }
}
```

---

## Data Structures

### Question Report

Per-question metrics with rating distribution and student clustering.

```typescript
interface QuestionReport {
  questionId: string;
  prompt: string;
  sortOrder: number;

  // Rating distribution (explicit counts for each rating value)
  rating1Count: number; // Count of rating = 1
  rating2Count: number; // Count of rating = 2
  rating3Count: number; // Count of rating = 3
  rating4Count: number; // Count of rating = 4
  rating5Count: number; // Count of rating = 5

  // Aggregated metrics
  totalRatings: number;
  averageRating: number;

  // Low rating metrics (ratings <= 2)
  lowRatingCount: number;
  lowRatingPercentage: number; // (lowRatingCount / totalRatings) * 100

  // Student clustering
  studentsWithLowRating: StudentLowRating[];
}
```

### Student Low Rating

Students who received a low rating (1 or 2) for a specific question.

```typescript
interface StudentLowRating {
  grNumber: string; // GR Number
  name: string; // Student name
  areaName: string; // Area name
  rating: number; // The actual rating (1 or 2)
}
```

**Sorting:** Students are sorted by:

1. `rating` ASC (worst ratings first, i.e., 1 before 2)
2. `grNumber` ASC (alphabetical within same rating)

### Report Insights

Overall insights derived from the report data.

```typescript
interface ReportInsights {
  bestQuestion: {
    questionId: string;
    prompt: string;
    averageRating: number;
  };
  worstQuestion: {
    questionId: string;
    prompt: string;
    averageRating: number;
  };
  overallAverageRating: number;
  totalStudentsWithInteractions: number;
  totalStudentsNeedingAttention: number; // Students with any rating <= 2
}
```

---

## Business Rules

### Low Rating Definition

A "low rating" is defined as any rating with value **<= 2** (i.e., ratings of 1 or 2).

### Students Needing Attention

A student is considered "needing attention" if they have received **at least one low rating** across any question in their interaction.

### Question Ranking

- **Best Question**: Question with the highest `averageRating`
- **Worst Question**: Question with the lowest `averageRating`

### Real-Time Computation

All metrics are computed fresh on each request. There is no caching layer. This ensures:

- Data is always up-to-date
- Changes in interactions are immediately reflected
- No stale data concerns

---

## Data Relationships

```
Interaction
├── admission
│   ├── session      → Filter: sessionId
│   ├── branch       → Filter: branchId
│   ├── classLevel   → Filter: classLevelId
│   ├── area         → Filter: areaId (optional)
│   └── student
│       ├── grNumber → StudentLowRating.grNumber
│       └── name     → StudentLowRating.name
├── ratings[]
│   ├── rating       → Rating value (1-5)
│   └── question
│       ├── id       → QuestionReport.questionId
│       ├── prompt   → QuestionReport.prompt
│       └── sortOrder → QuestionReport.sortOrder
└── questionSet      → Links to Question Set
```

---

## Example Queries

### Basic Report (Required Filters Only)

```bash
GET /interactions/report?sessionId=xxx&classLevelId=yyy&branchId=zzz
```

Returns report for all areas within the specified session, class level, and branch.

### Drill Down by Area

```bash
GET /interactions/report?sessionId=xxx&classLevelId=yyy&branchId=zzz&areaId=aaa
```

Returns report filtered to a specific area for more granular analysis.

---

## Error Handling

| Status Code | Description                                                     |
| ----------- | --------------------------------------------------------------- |
| 400         | Missing required filters (sessionId, classLevelId, or branchId) |
| 401         | Unauthorized (missing or invalid auth token)                    |
| 404         | No interactions found for the specified filters                 |
| 500         | Server error during report computation                          |

---

## UI Implementation Notes

### Filter Components

Reuse existing filter components from `src/components/`:

- `SessionFilter` - Session selection
- `BranchFilter` - Branch selection (with `resetFiltersOnChange={['areaId']}`)
- `ClassLevelFilter` - Class level selection
- `AreaFilter` - Optional area drill-down

### Display Components

Follow patterns from `src/domains/admission/view/dashboard/`:

- `StatCard` - For insight metrics (overall average, attention count)
- `ChartCard` - For rating distribution visualizations
- Data tables for per-question breakdown and student clustering

### Recommended File Structure

```
src/domains/interactions/
├── view/
│   └── report/
│       ├── index.tsx                    # Main report component
│       ├── components/
│       │   ├── ReportFilters.tsx        # Filter section
│       │   ├── QuestionTable.tsx        # Per-question metrics table
│       │   ├── StudentClusterTable.tsx  # Low-rating students table
│       │   ├── InsightsCards.tsx        # Best/worst question cards
│       │   └── RatingDistributionChart.tsx
│       ├── hooks/
│       │   └── useInteractionReport.ts  # Data fetching hook
│       └── messages.ts                  # i18n messages
```

---

## Related Files

- `src/providers/service/interactions/interactions.ts` - Interactions API provider
- `src/providers/service/app.schemas.ts` - Type definitions (Interaction, InteractionRating)
- `src/components/SessionFilter/` - Session filter component
- `src/components/BranchFilter/` - Branch filter component
- `src/components/ClassLevelFilter/` - Class level filter component
- `src/components/AreaFilter/` - Area filter component
- `src/domains/admission/view/dashboard/` - Dashboard patterns to follow
