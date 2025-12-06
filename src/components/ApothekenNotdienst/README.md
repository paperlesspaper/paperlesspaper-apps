# Apotheken-Notdienst

Displays emergency pharmacies in Germany using the public search endpoint of [aponet.de](https://www.aponet.de/apotheke/notdienstsuche). The integration mirrors the configuration surface of the MagicMirror² module `MMM-ApothekenNotdienst` and exposes data through the `/api/apothekennotdienst` route.

## Query parameters

| Parameter                            | Description                                                             | Default                      |
| ------------------------------------ | ----------------------------------------------------------------------- | ---------------------------- |
| `lat` / `lon`                        | Latitude and longitude of the center location.                          | `52.4974 / 13.4596` (Berlin) |
| `radius`                             | Search radius in kilometers (1 – 50).                                   | `5`                          |
| `day`                                | `today` or `tomorrow`.                                                  | `today`                      |
| `maxEntries` / `limit`               | Maximum number of entries to render (1 – 20).                           | `5`                          |
| `refreshInterval` / `updateInterval` | Refresh cadence in milliseconds (clamped between 20 min and 12 h).      | `30 * 60 * 1000`             |
| `color`                              | Visual theme (`dark`, `light`, `midnight`, `red-dark`, `red-light`, …). | `dark`                       |
| `kind`                               | Layout variant (`primary`, `compact`, `striped`).                       | `primary`                    |
| `language`                           | BCP47 locale used for copy and date formatting.                         | `de-DE`                      |
| `title`                              | Optional headline override.                                             | –                            |

## API

`GET /api/apothekennotdienst`

Query params mirror the UI parameters and forward the request to aponet.de. The handler normalises the upstream payload and returns an array of pharmacies alongside metadata (requested day, radius, coordinates, etc.).

## Notes

- Data is scraped from a public HTML endpoint and can change without notice.
- The upstream service enforces sensible rate limits, so the refresh interval is clamped to at least 20 minutes.
- The component emits the loading helper markers (`#website-is-loading` / `#website-has-loaded`) through the shared `LoadingProvider` to keep the screenshot pipeline stable.
