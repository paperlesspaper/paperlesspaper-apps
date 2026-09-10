/* eslint-disable @typescript-eslint/no-explicit-any */
import { faDroplet } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styles from "./forecastOnly.module.scss";
import RescaleText from "../RescaleText/RescaleText";
import WeatherConditionIcon from "./WeatherConditionIcon";

export default function ForecastOnly({ iconStyle, language, weatherData }: any) {
  const { forecast } = weatherData;

  console.log("ForecastOnly", weatherData);
  return (
    <div className={styles.day}>
      <RescaleText id="forecast" maxFontSize={100} checkHeight>
        <div className={styles.weatherContainer}>
          {forecast.list.slice(0, 7).map((day: any) => (
            <React.Fragment key={day.dt}>
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
                <WeatherConditionIcon
                  classNameMap={styles}
                  fontAwesomeClassName={styles.forecastIconFontAwesome}
                  iconCode={day.weather[0].icon}
                  iconSet={iconStyle}
                  imageClassName={styles.forecastIcon}
                />
              </div>
              <div className={styles.forecastRain}>
                <FontAwesomeIcon
                  icon={faDroplet}
                  className={styles.forecastRainIcon}
                />
                {day.main.humidity}%
              </div>
            </React.Fragment>
          ))}
        </div>
      </RescaleText>
    </div>
  );
}
