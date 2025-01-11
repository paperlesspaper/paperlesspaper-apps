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

export default function WeatherScreen() {
  // Get the current date
  //const today = new Date();

  const { language } = useTranslationFromUrl();

  const searchParams = useSearchParams();

  const location = searchParams.get("location") || "Berlin";
  const color = searchParams.get("color") || "dark";
  const kind = searchParams.get("kind") || "forecast-summary"; // default, today-forecast, 3-days

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<any>(true);

  const getWeather = async () => {
    const currentWeatherCall = await fetch(
      `/api/weather?location=${encodeURIComponent(
        location
      )}&language=${language}&kind=current`
    );
    const currentWeather = await currentWeatherCall.json();

    const forecastCall = await fetch(
      `/api/weather?location=${encodeURIComponent(
        location
      )}&language=${language}&kind=forecast`
    );

    const forecast = await forecastCall.json();

    if (!currentWeatherCall.ok) {
      console.log("errorMessage", currentWeather.error);
      setErrorMessage({ message: currentWeather.error });
    }
    if (!forecastCall.ok) {
      console.log("errorMessage", forecast.error);
      setErrorMessage({ message: forecast.error });
    }

    setLoading(false);
    setWeatherData({ currentWeather, forecast });
  };

  useEffect(() => {
    getWeather();
  }, []);

  const Design =
    kind === "forecast-summary"
      ? ForcecastSummary
      : kind === "forecast"
      ? ForecastOnly
      : CurrentWeather;

  if (!weatherData) {
    return null;
  }

  if (errorMessage) {
    return <ErrorMessage errorMessage={errorMessage} />;
  }

  return (
    <div className={classNames}>
      <Design weatherData={weatherData} language={language} />
    </div>
  );
}
