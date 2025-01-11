# RSS Feed

## Overview

The RSS Feed Component is a React component designed to fetch and display content from an RSS feed URL. It supports dynamic styling and customization based on query parameters, making it a versatile tool for integrating RSS feeds into your application.

## Features

- **Dynamic RSS Feed Fetching**: Fetches and parses RSS feeds using a provided URL.
- **Customizable Styling**: Adjust the appearance with color themes and content types.
- **HTML Content Handling**: Strips HTML tags from RSS feed descriptions for clean presentation.
- **Publication Date Formatting**: Formats publication dates into a readable format.
- **Fallback Support**: Graceful handling of missing data or invalid RSS feeds.

### Query Parameters

The component supports customization through URL query parameters.

| Parameter | Description                                            | Default Value |
| --------- | ------------------------------------------------------ | ------------- |
| `feed`    | The URL of the RSS feed to fetch.                      | Required      |
| `color`   | Theme color for the component (`dark`, `light`, etc.). | `dark`        |
| `kind`    | Styling modifier for the content (`primary`, etc.).    | `primary`     |

### Example Query

To fetch an RSS feed with a light theme:

```
https://apps.paperlesspaper.de?feed=https://example.com/rss&color=light&kind=primary
```

---

## API Integration

The component fetches RSS data using the `/api/rss` route.

## How It Works

1. **Fetch RSS Feed**:
   - The component fetches RSS feed data from the `/api/rss` endpoint using the `feed` parameter.
2. **Parse and Format Data**:
   - RSS items are extracted from the feed and processed to strip HTML tags from descriptions.
   - Publication dates are formatted for readability.
3. **Render Content**:
   - The component dynamically renders each RSS item with its title, description, and publication date.

---

## Error Handling

- **Invalid RSS Feed**: Displays a fallback message (`"Failed loading RSS feed."`) if the feed fails to load.
- **Missing Feed Parameter**: The `/api/rss` route responds with an error if the `feed` parameter is missing.
- **No Items in Feed**: Handles empty RSS feeds gracefully by showing a fallback message.

---

## Example Output

### RSS Item

- **Title**: "Breaking News: Example Event"
- **Date**: "Jan 10, 2025 –"
- **Description**: "This is a short description of the news article."
