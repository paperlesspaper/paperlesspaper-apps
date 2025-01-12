# Day Calendar

## Overview

The `Day Calendar` is for displaying the current date, day of the week, and optional content such as demotivational quotes or funny facts. :)
It supports customization through query parameters, including theming, language, and content type.

More about the integration:

[Integration blog post](https://paperlesspaper.de/en/applications/calendar)

## Features

![Preview of screen](https://paperlesspaper.de/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fwirewire%2Fimage%2Fupload%2FDemotivationsssprueche%20Kalender.jpg&w=2048&q=75)

1. **Dynamic Date and Time Display**:
   - Shows the current date, day of the week, and optionally, the current time.
2. **Customizable Content**:
   - Includes demotivational quotes or funny facts based on query parameters.
3. **Internationalization**:
   - Formats dates and quotes based on the selected language.
4. **Dynamic Styling**:
   - Supports various themes and content types through query parameters.
5. **Responsive Typography**:
   - Uses `RescaleText` for adaptive font sizes to optimize display.

### Query Parameters

The component's behavior can be customized using query parameters.

| Parameter  | Description                                            | Default Value |
| ---------- | ------------------------------------------------------ | ------------- |
| `color`    | Theme color for the component (`dark`, `light`, etc.). | `dark`        |
| `kind`     | Content type: `primary`, `demotivational`, `funny`.    | `primary`     |
| `showTime` | Whether to display the current time (`true`, `false`). | `false`       |
| `language` | Language for formatting and quotes (`en-US`, `de`).    | `en-US`       |

### Example Query

To display demotivational quotes with a light theme in German:

```
https://apps.paperlesspaper.de?color=light&kind=demotivational&language=de&showTime=true
```

## File Structure

### Component Files

- **`Day.tsx`**: Main component to render the date, time, and quotes.
- **`Demotivational.tsx`**: Subcomponent to handle quotes or facts.

### Supporting Data Files

- **`demotivational.de.ts`**: Array of demotivational quotes in German.
- **`demotivational.en.ts`**: Array of demotivational quotes in English.
- **`funnyFacts.de.ts`**: Array of funny facts in German.
- **`funnyFacts.en.ts`**: Array of funny facts in English.

## How It Works

1. **Query Parameter Handling**:
   - `useSearchParams` retrieves query parameters for dynamic customization.
2. **Date and Time Formatting**:
   - Uses `toLocaleDateString` and `toLocaleTimeString` to format the current date and time based on the `language` parameter.
3. **Quote Selection**:
   - The `Demotivational` component selects a quote or fact for the current day using the day of the year modulo the array length.
4. **Dynamic Rendering**:
   - Renders date and quotes differently based on the `kind` parameter.
5. **Styling**:
   - Applies theme and layout styles dynamically using `classnames`.

## Supporting Subcomponents

### `Slogan`

**Description**:
Displays a quote or fact based on the current day of the year.

**Props**:
| Prop | Type | Description |
|--------|-----------------------------|---------------------------------------|
| `kind` | `"string" | "funny"` | Type of quote or fact to display. |

## Example Outputs

### Default Display (Primary)

- Date: "January 11"
- Day: "Saturday"

### Demotivational Mode

- Quote: "Failure is always an option."
- Date: "January 11"
- Day: "Saturday"

### Funny Facts Mode

- Fact: "Bananas are berries, but strawberries are not."
- Date: "January 11"
- Day: "Saturday"

## Example URLs

### Basic Date Display

```
http://apps.paperlesspaper.de?color=dark&kind=primary
```

### Demotivational Mode

```
http://apps.paperlesspaper.de?color=light&kind=demotivational&language=en
```
