# WeatherScreen Component

## Overview

The `WeatherScreen` component is a weather visualization tool that dynamically fetches and displays weather data based on user input. It offers multiple display modes, supports internationalization, and provides real-time weather updates using the OpenWeatherMap API.

---

## Features

- **Weather Data**:
  - **Current Weather**: Displays temperature, humidity, wind speed, and weather description.
  - **Forecast**: Provides hourly and daily forecasts, including temperature, conditions, and precipitation.
- **Display Modes**:
  - `CurrentWeather`: Displays current weather conditions.
  - `ForecastOnly`: Displays a detailed hourly forecast.
  - `ForecastSummary`: Summarizes daily forecasts for up to 3 days.
- **Dynamic Parameters**:
  - Users can customize the component’s appearance and data through query parameters.
- **Error Handling**:
  - Graceful fallback for API errors with user-friendly error messages.
- **Responsive Typography**:
  - Uses `RescaleText` to adjust text size dynamically for better readability.
- **Internationalization**:
  - Supports different languages using the `useTranslationFromUrl` hook.

### Environment Variables

Create a `.env` file in your project and add the OpenWeatherMap API key:

```env
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
```

## Query Parameters

The `WeatherScreen` component's behavior can be controlled using query parameters:

| Parameter  | Description                                                        | Default Value      |
| ---------- | ------------------------------------------------------------------ | ------------------ |
| `location` | The location for which to fetch weather data (e.g., `Berlin`).     | `Berlin`           |
| `color`    | Theme color for the component (`dark`, `light`, etc.).             | `dark`             |
| `kind`     | Display mode: `forecast-summary`, `forecast`, or `today-forecast`. | `forecast-summary` |
| `language` | Language for weather data localization (e.g., `en`, `de`).         | Detected from URL  |

### Example Query

To display "On This Day" events in English with a light theme:

```
http://apps.paperlesspaper.de/weather?location=Dresden&color=light&kind=forecast-summary&language=en
```

## API Integration

The component uses the OpenWeatherMap API for fetching weather data.

### API Endpoints

- **Current Weather**:
  ```
  https://api.openweathermap.org/data/2.5/weather
  ```
- **Forecast**:
  ```
  https://api.openweathermap.org/data/2.5/forecast
  ```

### Local API Route

`app/api/weather/route.js` acts as a proxy to handle API calls securely.

---

## Display Modes

1. **Forecast Summary (`forecast-summary`)**

   - Summarizes the weather for the current day and provides an outlook for the next 3 days.

2. **Forecast Only (`forecast`)**

   - Displays detailed hourly forecasts, including temperature, humidity, and weather conditions.

3. **Current Weather (`today-forecast`)**
   - Displays the current weather conditions, including temperature, humidity, and wind speed.

---

## Error Handling

- **API Errors**:
  - Displays error messages if the API fails to fetch data.
- **Invalid Input**:
  - Provides a fallback location (`Berlin`) if no location is specified.

## Example Outputs

### Current Weather

- Location: Berlin
- Temperature: 10°C
- Humidity: 75%
- Wind: 5 m/s

### Forecast Summary

- Day: Monday
  - Min: 8°C, Max: 12°C
  - Description: Light rain

### Forecast Only

- Time: 14:00
  - Temperature: 9°C
  - Description: Overcast clouds
