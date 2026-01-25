# paperlesspaper apps

This repository contains [paperlesspaper](https://paperlesspaper.de/en) integrations rendered for eInk displays. It is a Next.js app optimized for fixed-size, low-color layouts and screenshot-based rendering.

![Example image](https://paperlesspaper.de/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fwirewire%2Fimage%2Fupload%2FIMG_3151-Bearbeitet.jpg.jpg&w=2048&h=700&q=75)

## Quick start

1. Install dependencies.
2. Start the dev server (defaults to http://localhost:3001).

```
npm install
npm run dev
```

## Available integrations

### [Google Calendar](src/components/GoogleCalendar/README.md)

Connect to your Google Calendar. Data is provided via `window.postMessage`.

### [Weather](src/components/Weather/README.md)

Displays current weather and forecast for any location using OpenWeather data.

### [Wikipedia](src/components/Wikipedia/README.md)

Shows the Wikipedia “Article of the day” or “On this day”. Available in English and German.

### [RSS](src/components/Rss/README.md)

Displays any RSS feed.

### [Apotheken-Notdienst](src/components/ApothekenNotdienst/README.md)

Shows pharmacies on emergency duty in Germany using the public search endpoint of [aponet.de](https://www.aponet.de/apotheke/notdienstsuche/). Exposes data via `/api/apothekennotdienst`.

Additional routes live in [src/app](src/app).

## Open Integration Example (plugin provider)

This repo ships an example provider for the Open Integration system used by memo-mono.

- Manifest (install URL): /open-integration-example/config.json
- Settings page (iframe): /open-integration-example/settings
- Render page (Puppeteer target): /open-integration-example/render
- Mock OAuth/redirect helper (optional): /open-integration-example/auth

Local install into memo-mono:

1. Start this repo (defaults to http://localhost:3001).
2. In memo-mono, choose the Integration Plugin application.
3. Install by config URL:

http://localhost:3001/open-integration-example/config.json

The settings iframe supports both structured messages (`{ source: "wirewire-app", type: "INIT" | "REDIRECT", ... }`) and the legacy `{ cmd: "message" | "redirect", data: ... }` format.

## Features

- Style selection
- Optimized for 7-color AcEP eInk displays (Spectra 6 coming soon)
- Layout fitting and auto-scaling
- Horizontal and vertical layouts
- Multilanguage support (see [src/i18n](src/i18n))

## Components

### `RescaleText`

Fits text into its container by adjusting font size.

Properties:

```
checkHeight = false
maxFontSize = 100
id = "no-id"
```

## Usage with paperlesspaper

No extra setup is required. Each integration appears inside paperlesspaper when creating a new image.

## Usage with custom ePaper displays

You need to render a route to an image and transmit it to the display.

Typical steps:

1. Render the route using Puppeteer.
2. Compare against the previous image to avoid redundant uploads.
3. Dither the image.
4. Transmit the dithered image to the display.

## Puppeteer rendering contract

The backend detects loading states based on the presence of these DOM elements.

### `#website-has-loading-element`

Indicates that the page has a custom loading state. If this element exists, the backend waits for loading to finish before taking a screenshot.

Add while loading:

```html
<div id="website-has-loading-element" />
```

### `#website-has-loaded`

Signals that the page is fully loaded and ready for rendering. The backend waits for this element to appear before proceeding.

Add when ready:

```html
<div id="website-has-loaded" />
```

### Fallback behavior

If `#website-has-loading-element` is not found, the backend waits a fixed timeout (8.5 seconds) before taking a screenshot.

## Loading helper (React)

A context provider that tracks the loading status of registered operations. Wrap your app (or a subtree) with this provider to enable loading state management.

Props:

- `children`: ReactNode
- `finishedLoading` (optional): boolean — If set to `true`, marks all as loaded regardless of internal state.

Behavior:

- Renders a `<div id="website-has-loaded" />` when all registered operations are finished loading.
- Renders a `<div id="website-is-loading" />` when any operation is still loading.
- Always renders a `<div id="website-has-loading-element" />` for reference.

### `useLoading`

Registers and updates a loading operation.

Arguments:

- `id`: string — Unique identifier for the loading operation.

Returns:

- `setLoading`: (loading: boolean) => void

Usage example:

```tsx
import { useLoading } from "../helpers/Loading";

const MyComponent = () => {
  const setLoading = useLoading({ id: "my-component" });

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, []);
};
```

## Development

Scripts:

- `npm run dev` — Start Next.js on port 3001
- `npm run build` — Build for production
- `npm run start` — Run the production server
- `npm run lint` — Lint the codebase
- `npm run deploy` — Deploy via Vercel
