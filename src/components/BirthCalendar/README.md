# BirthCalendar Component

## Overview

The `BirthCalendar` component calculates and displays pregnancy progress information based on a provided birthdate.

## Features

- Estimates conception date (~280 days before birth) from the given birthdate.
- Calculates days passed since conception relative to the current date.
- Displays current pregnancy day or age once the due date is reached.
- Shows corresponding weekly milestone image (available for weeks 1, 2, 3, 4, 12, 20, 38).
- Supports German (`de`) and English (`en`) data sources.
- Customizable color theme, display variant, and accent styling.

## Query Parameters

Customize the component via URL query parameters:

| Parameter   | Description                                                                     | Default      |
| ----------- | ------------------------------------------------------------------------------- | ------------ |
| `birthdate` | Expected due date in ISO format (`YYYY-MM-DD`) for calculating conception date. | `2023-01-01` |
| `color`     | Color theme class (`dark`, `light`, etc.).                                      | `dark`       |
| `kind`      | Display variant CSS modifier (e.g., `default`).                                 | `default`    |
| `accent`    | Additional CSS class for accent styling.                                        | `""`         |

## How It Works

1. Calculate estimated conception date by subtracting 280 days from `birthdate`.
2. Compute days passed since conception relative to the current date.
3. Select the pregnancy data entry with the largest `day` value not exceeding days passed.
4. Determine the pregnancy week and pick the closest available milestone image.
5. Render the milestone image, day count (or age), size comparison, and explanatory text.

## Usage Example

Include or link to the route with desired query parameters:

```
http://apps.paperlesspaper.de/birthcalendar?birthdate=2025-05-15&color=light&kind=default&accent=highlight
```

## Localization

Uses static JSON files for German and English data: `pregnancyDe.json` and `pregnancyEn.json`.
Language is determined via URL query or default i18n settings.
