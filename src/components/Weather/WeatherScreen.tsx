/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import styles from "./weather.module.scss";
import { useSearchParams } from "next/navigation";
import classnames from "classnames";
import CurrentWeather from "./CurrentWeather";
import ForecastOnly from "./ForecastOnly";
import ForcecastSummary from "./ForecastSummary";
import useTranslationFromUrl from "@/i18n/useTranslationFromUrl";
import ErrorMessage from "../Error/ErrorMessage";
import { useLoading } from "@/helpers/Loading";

export default function WeatherScreen() {
  // Get the current date
  //const today = new Date();

  const { language } = useTranslationFromUrl();

  const searchParams = useSearchParams();

  const location = searchParams.get("location") || "Berlin";
  const color = searchParams.get("color") || "light";
  const kind = searchParams.get("kind") || "forecast-summary"; // default, today-forecast, 3-days
  const displayLastUpdated = searchParams.get("displayLastUpdated") === "true";
  const needsForecast = kind === "forecast" || kind === "forecast-summary";
  const needsCurrent = kind !== "forecast" || displayLastUpdated;
  const iconStyle =
    searchParams.get("iconset") || searchParams.get("iconstyle") || "normal";

  //const showTime = searchParams.get("showTime") === "true";
  // const language = searchParams.get("language") || "en-US";

  const classNames = classnames({
    [styles.dayCalendar]: true,
    [styles[color]]: color,
    [styles[kind]]: kind,
    [kind]: kind,
    [color]: color,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [weatherData, setWeatherData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<any>(null);
  const setLoading = useLoading({ id: "weather-data" });

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const timeout = setTimeout(() => controller.abort(), 20_000);
    setLoading(true);
    setWeatherData(null);
    setErrorMessage(null);

    const fetchWeather = async (weatherKind: string) => {
      const query = new URLSearchParams({ location, language, kind: weatherKind });
      const response = await fetch(`/api/weather?${query}`, {
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to load weather data");
      }
      return data;
    };

    Promise.all([
      needsCurrent ? fetchWeather("current") : Promise.resolve(null),
      needsForecast ? fetchWeather("forecast") : Promise.resolve(null),
    ])
      .then(([currentWeather, forecast]) => {
        if ((needsCurrent && (!currentWeather?.main || !currentWeather.weather?.length)) ||
            (needsForecast && (!Array.isArray(forecast?.list) || forecast.list.some((entry: any) =>
              !entry?.main || !entry.weather?.length || !entry.dt_txt)))) {
          throw new Error("Invalid weather data received");
        }
        if (!cancelled) setWeatherData({ currentWeather, forecast });
      })
      .catch((error) => {
        if (!cancelled) setErrorMessage({ message: controller.signal.aborted
          ? "Weather request timed out"
          : error.message || "Unable to load weather data" });
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [location, language, needsCurrent, needsForecast, setLoading]);

  const Design =
    kind === "forecast-summary"
      ? ForcecastSummary
      : kind === "forecast"
      ? ForecastOnly
      : CurrentWeather;

  const formattedUpdateTime = (() => {
    const unixSeconds = weatherData?.currentWeather?.dt;
    if (!unixSeconds) {
      return null;
    }

    const timestamp = Number(unixSeconds) * 1000;
    if (Number.isNaN(timestamp)) {
      return null;
    }

    try {
      return new Date(timestamp).toLocaleString(language, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (error) {
      return new Date(timestamp).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
  })();

  if (errorMessage) {
    return <ErrorMessage errorMessage={errorMessage} />;
  }

  if (!weatherData ||
      (needsCurrent && !weatherData.currentWeather) ||
      (needsForecast && !weatherData.forecast)) {
    return null;
  }

  return (
    <div className={classNames}>
      {displayLastUpdated && formattedUpdateTime ? (
        <div className={styles.updatedAt}>
          {formattedUpdateTime} – 
          {new Date().toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>
      ) : null}
      <Design
        weatherData={weatherData}
        language={language}
        iconStyle={iconStyle}
      />
    </div>
  );
}
