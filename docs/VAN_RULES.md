# Van Assignment Rules

This document describes the business rules for van color assignment in the admission system.

## Overview

Each van has a specific color. When displaying van information for an admission, the system determines whether to show the assigned van's color or fall back to the branch's default color based on the following rules.

## Fallback Rules

The system uses the **branch default color** (with label "Default") when ANY of these conditions are met:

1. **Class Level is Muhiban** - All muhiban students use branch default color regardless of gender
2. **Class Level is Nasiran + Male Gender** - Male nasiran students use branch default color
3. **Area has no Van Service** - When `area.hasVan` is false, use branch default color for any gender
4. **Area has no Boys Van + Male Gender** - When `area.hasBoysVan` is false and student is male, use branch default color

## Normal Van Assignment

If none of the fallback conditions apply, the system finds the van assigned to the student's area and displays:

- Van name as the chip label
- Van's specific color as the chip background

## Color Contrast

Text color (black or white) is automatically calculated based on background luminance to ensure readability.

## Technical Implementation

The `VanChip` component at `src/domains/van/components/VanChip/index.tsx` implements these rules. It accepts the following props:

- `areaId` - The student's area ID
- `branchId` - The student's branch ID
- `gender` - The student's gender ('MALE' | 'FEMALE')
- `classLevelName` - The name of the class level (e.g., 'muhiban', 'nasiran')
- `hasVan` - Whether the area has van service
- `hasBoysVan` - Whether the area has boys van service

## Usage

The VanChip is used in:

1. **Admission Listing** - Shows van assignment in the table
2. **Admission Detail** - Shows van assignment in the detail view

## Related Files

- `src/domains/van/components/VanChip/index.tsx` - VanChip component
- `src/domains/van/view/listing/index.tsx` - Van listing with rules description
- `src/domains/admission/view/listing/index.tsx` - Admission listing with van column
- `src/domains/admission/view/detail/index.tsx` - Admission detail with van section
