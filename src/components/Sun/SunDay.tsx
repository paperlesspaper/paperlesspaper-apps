import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/pro-light-svg-icons";
import styles from "./sun.module.scss";
import { Trans } from "react-i18next";
import RescaleText from "../RescaleText/RescaleText";

interface SunEvent {
  type: "sunrise" | "sunset";
  model_data: boolean;
  quality: number;
  cloud_cover: number;
  quality_text: string;
  time: string;
  direction: number;
  magics: {
    blue_hour: [string, string];
    golden_hour: [string, string];
  };
}

interface SunDayProps {
  date: string;
  sunrise?: SunEvent;
  sunset?: SunEvent;
}

export default function SunDay({ date, day }: { day: SunDayProps }) {
  function formatTime(val?: string) {
    if (!val) return "-";
    return new Date(val).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(val: string) {
    if (!val) return "-";
    const d = new Date(val);
    return d.toLocaleDateString([], {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className={styles.sunDay}>
      <div className={styles.date}>
        <RescaleText id="date">{formatDate(date)}</RescaleText>
      </div>

      <div className={styles.times}>
        <RescaleText checkHeight maxFontSize={100} id="times">
          <div className={styles.timesInside}>
            <div className={styles.sunrise}>
              <div className={styles.time}>
                <FontAwesomeIcon icon={faSun} className={styles.icon} />
                {formatTime(day.sunrise?.time)}
              </div>

              <div className={styles.cloudCover}>
                <strong>
                  <Trans>Quality</Trans>:
                </strong>{" "}
                {day.sunrise?.quality_text}
              </div>

              {(day.sunrise?.magics?.blue_hour ||
                day.sunset?.magics?.blue_hour) && (
                <div className={styles.blueHour}>
                  <strong>
                    <Trans>Blue hour</Trans>:
                  </strong>{" "}
                  {formatTime(
                    (day.sunrise?.magics?.blue_hour ||
                      day.sunset?.magics?.blue_hour)?.[0]
                  )}{" "}
                  –{" "}
                  {formatTime(
                    (day.sunrise?.magics?.blue_hour ||
                      day.sunset?.magics?.blue_hour)?.[1]
                  )}
                </div>
              )}
            </div>
            <div className={styles.sunset}>
              <div className={styles.time}>
                <FontAwesomeIcon icon={faMoon} className={styles.icon} />
                {formatTime(day.sunset?.time)}
              </div>

              <div className={styles.cloudCover}>
                <strong>
                  <Trans>Quality</Trans>:
                </strong>{" "}
                {day.sunset?.quality_text}
              </div>
              {(day.sunrise?.magics?.golden_hour ||
                day.sunset?.magics?.golden_hour) && (
                <div className={styles.goldenHour}>
                  <strong>
                    <Trans>Golden hour</Trans>:
                  </strong>{" "}
                  {formatTime(
                    (day.sunrise?.magics?.golden_hour ||
                      day.sunset?.magics?.golden_hour)?.[0]
                  )}{" "}
                  –{" "}
                  {formatTime(
                    (day.sunrise?.magics?.golden_hour ||
                      day.sunset?.magics?.golden_hour)?.[1]
                  )}
                </div>
              )}
            </div>
          </div>
        </RescaleText>
      </div>
    </div>
  );
}
