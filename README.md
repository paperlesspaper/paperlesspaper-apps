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

### Development

Install dependencies using `npm` or `yarn`.

```
yarn install
```

Start the development environment

```
yarn dev
```
