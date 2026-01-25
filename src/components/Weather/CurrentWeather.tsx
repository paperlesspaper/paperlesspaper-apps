import React from "react";
import RescaleText from "../RescaleText/RescaleText";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet, faWind } from "@fortawesome/pro-regular-svg-icons";
import styles from "./currentWeather.module.scss";

type WeatherData = {
  currentWeather: {
    name: string;
    main: {
      temp: number;
      humidity: number;
    };
    weather: {
      description: string;
    }[];
    wind: {
      speed: number;
    };
  };
};

type CurrentWeatherProps = {
  language: string;
  weatherData: WeatherData;
  iconStyle?: string;
};

export default function CurrentWeather({ weatherData }: CurrentWeatherProps) {
  const { currentWeather } = weatherData;
  return (
    <div className={styles.day}>
      <div className={styles.weatherContainer}>
        <h1 className={styles.location}>
          <RescaleText id="location" maxFontSize={100} checkHeight>
            {currentWeather.name}
          </RescaleText>
        </h1>
        <div className={styles.temperature}>
          <RescaleText id="temperature" maxFontSize={250} checkHeight>
            {Math.round(currentWeather.main.temp)}°C
          </RescaleText>
        </div>
        <div className={styles.description}>
          <RescaleText id="description" maxFontSize={40}>
            {currentWeather.weather[0].description}
          </RescaleText>
        </div>
        <div className={styles.details}>
          <div>
            <FontAwesomeIcon icon={faDroplet} className={styles.weatherIcon} />
            {currentWeather.main.humidity}%
          </div>
          <div>
            <FontAwesomeIcon icon={faWind} className={styles.weatherIcon} />
            {currentWeather.wind.speed} m/s
          </div>
        </div>
      </div>
    </div>
  );
}
