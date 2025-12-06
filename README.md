These are [paperlesspaper](https://paperlesspaper.de/en) Integrations, that renders different tools in a suitable size for eInk Displays using a next.js application.

![Example image](https://paperlesspaper.de/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fwirewire%2Fimage%2Fupload%2FIMG_3151-Bearbeitet.jpg.jpg&w=2048&h=700&q=75)

### Available integrations

#### Google Calendar

Connect to your Google Calendar. You need to provide the data for the calendar using `window.postMessage`.

#### Weather

Displays the current weather and weather forecast for any location using [Openweathermap.org](https://openweathermap.org).

#### Wikipedia

Shows the Wikipedia "Article of the day" or "What happend on.." using the Wikipedia API. Available in English and German.

#### RSS

Displays any RSS-feed.

#### Apotheken-Notdienst

Shows pharmacies on emergency duty in Germany using the public search endpoint of [aponet.de](https://www.aponet.de/apotheke/notdienstsuche/). Supports the same configuration surface as the MagicMirror² module and exposes the data through `/api/apothekennotdienst`.

### Features

- Style selection
- Optimized for 7 color AcEP eInk displays (Spectra 6 coming soon)
- Optimization for fitting the screen
- Horizontal and vertical usage
- Multilanguage (TODO: Extract all language strings automatically)

### Tools

#### `RescaleText`

`RescaleText` tries fitting the text into it's container.

#### Properties

```bash
checkHeight = false
maxFontSize = 100
id = "no-id"
```

#### Usage with paperlesspaper

There is nothing you need to do. You can access each integration when creating a new image inside the app.

### Usage with custom ePaper displays

You need to convert the website into a picture.

Steps:

- Convert the website into a picture using [pupeteer](https://pptr.dev/)
- Additional compare image to avoid sending the same image twice
- Dither image
- Transmit dithered image

### ADD_LINK_TO_TUTORIAL_HERE

TODO: Add pupeteer converter directly to API Route.

https://github.com/browserless/vercel-puppeteer/blob/main/src/pages/api/pdf.ts

### Special DOM Elements for Puppeteer Rendering

To coordinate rendering and screenshot timing, the backend expects certain elements to be present in the DOM of the page being rendered. These elements are used to detect loading states and ensure screenshots are taken only after the page is fully ready.

### `#website-has-loading-element`

#### Purpose:

Indicates that the page has a custom loading state. If this element exists in the DOM, the backend will wait for the loading to finish before taking a screenshot.

#### Usage:

Add an element with the ID website-has-loading-element to your page while it is loading.

```html
<div id="website-has-loading-element" />
```

### `#website-has-loaded`

#### Purpose:

Signals that the page has finished loading and is ready for rendering. The backend waits for this element to appear before proceeding.

#### Usage:

Once your page is fully loaded and ready for a screenshot, add an element with the ID website-has-loaded to the DOM.

```html
<div id="website-has-loaded" />
```

### Fallback Behavior

If `#website-has-loading-element` is not found, the backend will wait for a fixed timeout (8.5 seconds) before taking a screenshot. This is a fallback to handle pages without explicit loading indicators.

## Loading helper (react.js)

A context provider that tracks the loading status of registered operations. Wrap your application (or a subtree) with this provider to enable loading state management.

**Props:**

- `children`: ReactNode — The content to render inside the provider.
- `finishedLoading` (optional): boolean — If set to `true`, marks all as loaded regardless of internal state.

**Behavior:**

- Renders a `<div id="website-has-loaded" />` when all registered operations are finished loading.
- Renders a `<div id="website-is-loading" />` when any operation is still loading.
- Always renders a `<div id="website-has-loading-element" />` for reference.

### `useLoading`

A custom hook to register and update the loading status of a component or operation.

**Arguments:**

- `id`: string — A unique identifier for the loading operation. If not provided, a random one is generated.

**Returns:**

- `setLoading`: (loading: boolean) => void — Call this function to update the loading status for the given id.

**Usage Example:**

```tsx
import { useLoading } from "../helpers/Loading";

const MyComponent = () => {
  const setLoading = useLoading({ id: "my-component" });

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, []);

  // ...
};
```

## Internal Details

- The context tracks an array of `{ id, loading }` objects.
- `registerLoading(id)` adds a new loading operation if not already present.
- `setLoadingStatus(id, loading)` updates the loading state for a given id.
- `allFinishedLoading` is `true` if all registered operations are not loading, or if `finishedLoading` is set.

### Development

Install dependencies using `npm`.

```
npm install
```

Start the development environment

```
npm dev
```
