"use client";
import React, { useEffect, useState } from "react";
import styles from "./weather.module.scss";
import { useSearchParams } from "next/navigation";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet, faWind } from "@fortawesome/pro-regular-svg-icons";
import RescaleText from "../RescaleText/RescaleText";

export default function WeatherScreen() {
  // Get the current date
  //const today = new Date();

  const searchParams = useSearchParams();

  const location = searchParams.get("location") || "Berlin";
  const color = searchParams.get("color") || "dark";
  const kind = searchParams.get("kind") || "default"; // default, today-forecast, 3-days

  //const showTime = searchParams.get("showTime") === "true";
  const language = searchParams.get("language") || "en-US";

  const classNames = classnames({
    [styles.dayCalendar]: true,
    [styles[color]]: color,
    [styles[kind]]: kind,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [weatherData, setWeatherData] = useState<any>(null);

  const getWeather = async () => {
    const response = await fetch(
      `/api/weather?location=${encodeURIComponent(
        location
      )}&language=${language}&kind=${kind}`
    );
    const data = await response.json();
    setWeatherData(data);
  };

  useEffect(() => {
    getWeather();
  }, []);

  console.log("weatherData", weatherData);

  if (!weatherData) {
    return null;
  }

  if (kind === "3-days") {
    return (
      <div className={classNames}>
        <div className={styles.day}>
          <div className={styles.weatherContainer}>
            {weatherData.list.map((day: any) => (
              <div key={day.dt} className={styles.forecast}>
                <div classname={styles.dateForecast}>
                  {new Date(day.dt * 1000).toLocaleDateString(language, {
                    weekday: "long",
                  })}
                </div>
                <div className={styles.temperatureForecast}>
                  {Math.round(day.main.temp)}°C
                </div>
                <div className={styles.description}>
                  {day.weather[0].description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames}>
      <div className={styles.day}>
        <div className={styles.weatherContainer}>
          <h1 className={styles.location}>
            <RescaleText id="location" maxFontSize={100} checkHeight>
              {weatherData.name}
            </RescaleText>
          </h1>
          <div className={styles.temperature}>
            <RescaleText id="temperature" maxFontSize={250} checkHeight>
              {Math.round(weatherData.main.temp)}°C
            </RescaleText>
          </div>
          <div className={styles.description}>
            <RescaleText id="description" maxFontSize={40}>
              {weatherData.weather[0].description}
            </RescaleText>
          </div>
          <div className={styles.details}>
            <div>
              <FontAwesomeIcon
                icon={faDroplet}
                className={styles.weatherIcon}
              />
              {weatherData.main.humidity}%
            </div>
            <div>
              <FontAwesomeIcon icon={faWind} className={styles.weatherIcon} />
              {weatherData.wind.speed} m/s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
