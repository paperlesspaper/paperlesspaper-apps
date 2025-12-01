/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import RescaleText from "../RescaleText/RescaleText";
import styles from "./forecastSummary.module.scss";
import { Trans } from "react-i18next";

export default function ForecastSummary({ language, weatherData }: any) {
  const { currentWeather, forecast } = weatherData;

  const summarizedData = Object.values(
    forecast.list.reduce((acc: any, entry: any) => {
      const dateKey = entry.dt_txt.split(" ")[0]; // Extract the date part
      const temp = entry.main.temp;

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          minTemp: temp,
          maxTemp: temp,
          weatherDescription: entry.weather[0].description,
          icon: entry.weather[0].icon,
        };
      } else {
        acc[dateKey].minTemp = Math.min(acc[dateKey].minTemp, temp);
        acc[dateKey].maxTemp = Math.max(acc[dateKey].maxTemp, temp);
      }

      return acc;
    }, {})
  );

  return (
    <div className={styles.day}>
      <div className={styles.summary}>
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
            <RescaleText id="description" maxFontSize={35}>
              {currentWeather.weather[0].description}
            </RescaleText>
          </div>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.todayForecast}>
          <h3 className={styles.todayForecastTitle}>
            <span>
              <Trans i18nKey="today-weather">Today</Trans>
            </span>
          </h3>
          <div className={styles.todayForecastContent}>
            {forecast.list.slice(0, 4).map((day: any) => (
              <>
                <div className={styles.forecastDate}>
                  <span className={styles.forecastTime}>
                    {new Date(day.dt * 1000).toLocaleTimeString(language, {
                      hour: "2-digit",
                    })}
                  </span>
                </div>

                <div className={styles.forecastDescription}>
                  <img
                    className={styles.forecastIcon}
                    src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@4x.png`}
                    alt="weather icon"
                  />
                </div>
                <div className={styles.forecastTemperature}>
                  <span className={styles.forecastTemperatureText}>
                    {Math.round(day.main.temp)}°C
                  </span>
                </div>
              </>
            ))}
          </div>
        </div>

        <div className={styles.outlook}>
          <h3 className={styles.outlookTitle}>
            <span>
              <Trans>Outlook</Trans>
            </span>
          </h3>
          <div className={styles.outlookContent}>
            {summarizedData.slice(0, 3).map((daySummary: any) => {
              console.log("daySummary", daySummary);

              return (
                <>
                  <div className={styles.forecastDate}>
                    <span className={styles.forecastTime}>
                      {new Date(daySummary.date).toLocaleDateString(language, {
                        weekday: "long",
                      })}
                    </span>
                  </div>
                  <div className={styles.forecastDescription}>
                    <img
                      className={styles.forecastIcon}
                      src={`http://openweathermap.org/img/wn/${daySummary.icon}@4x.png`}
                      alt="weather icon"
                    />
                  </div>
                  <div className={styles.forecastTemperature}>
                    <span className={styles.forecastTemperatureText}>
                      {Math.round(daySummary.minTemp)} –{" "}
                      {Math.round(daySummary.maxTemp)}°C
                    </span>
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
