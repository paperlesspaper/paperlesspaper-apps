Wikipedia Integration

# WikipediaScreen Component

## Overview

The `WikipediaScreen` component is a React component that fetches and displays information from Wikipedia's featured content API. Depending on the provided configuration, it displays either "On This Day" historical events or the featured article for the current day. It supports customization through query parameters.

## Features

- **Dynamic Wikipedia API Fetching**: Fetches featured content for the current day based on the user's selected language.
- **Customizable Display**: Adjust color theme, kind of content (`onthisday` or `primary`), text truncation length, and more.
- **Responsive Typography**: Uses the `RescaleText` component for optimized text resizing.
- **"On This Day" Events**: Displays historical events with their respective years.
- **Featured Article**: Shows the day's featured article, including the title, image, and extract.

## Query Parameters

The component's behavior can be customized through URL query parameters.

| Parameter         | Description                                                                                      | Default Value |
| ----------------- | ------------------------------------------------------------------------------------------------ | ------------- |
| `color`           | Sets the color theme (`dark`, `light`, etc.).                                                    | `dark`        |
| `kind`            | Type of content to display: `onthisday` for historical events or `primary` for featured article. | `primary`     |
| `language`        | Language for the Wikipedia API (`en`, `de`, etc.).                                               | `de`          |
| `accent`          | Additional accent styling class.                                                                 | `""`          |
| `limit`           | Number of "On This Day" events to display.                                                       | `10`          |
| `limitCharacters` | Maximum number of characters for the featured article extract.                                   | `550`         |

### Example Query

To display "On This Day" events in English with a light theme:

```
http://apps.paperlesspaper.de/wikipedia?kind=onthisday&language=en&color=light
```

---

## How It Works

1. **API Fetching**:

   - The component fetches data from the Wikipedia Featured Feed API based on the current date and selected language.
   - The API endpoint is constructed dynamically using the selected `language`.

2. **Content Rendering**:

   - If `kind=onthisday`, the component displays a list of historical events from the `onthisday` field.
   - If `kind=primary`, it shows the featured article with its title, image, and a truncated extract.

## Example Outputs

### Featured Article

- Title: "Some Article Title"
- Date: "10 January 2025"
- Extract: "This is an example of the article extract, truncated as needed."

### "On This Day" Events

- 1969 · Example historical event 1.
- 1980 · Example historical event 2.
