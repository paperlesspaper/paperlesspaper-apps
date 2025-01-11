/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { faDroplet } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styles from "./forecastOnly.module.scss";
import RescaleText from "../RescaleText/RescaleText";

export default function ForecastOnly({ language, weatherData }: any) {
  const { forecast } = weatherData;
  return (
    <div className={styles.day}>
      <RescaleText id="forecast" maxFontSize={100} checkHeight>
        <div className={styles.weatherContainer}>
          {forecast.list.slice(0, 7).map((day: any) => (
            <>
              <div className={styles.forecastDate}>
                <span className={styles.forecastTime}>
                  {new Date(day.dt * 1000).toLocaleTimeString(language, {
                    hour: "2-digit",
                  })}
                </span>
                <span className={styles.forecastDay}>
                  {new Date(day.dt * 1000).toLocaleDateString(language, {
                    weekday: "long",
                  })}
                </span>
              </div>
              <div className={styles.forecastTemperature}>
                <span className={styles.forecastTemperatureText}>
                  {Math.round(day.main.temp)}°C
                </span>
                <span className={styles.forecastDescriptionText}>
                  {day.weather[0].description}
                </span>
              </div>
              <div className={styles.forecastDescription}>
                <img
                  className={styles.forecastIcon}
                  src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@4x.png`}
                  alt="weather icon"
                />
              </div>
              <div className={styles.forecastRain}>
                <FontAwesomeIcon
                  icon={faDroplet}
                  className={styles.forecastRainIcon}
                />
                {day.main.humidity}%
              </div>
            </>
          ))}
        </div>
      </RescaleText>
    </div>
  );
}
