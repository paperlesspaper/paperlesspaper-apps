"use client";
import React from "react";
import styles from "./day.module.scss";
import { useSearchParams } from "next/navigation";
import classnames from "classnames";
import Demotivational from "./Demotivational";
import RescaleText from "../RescaleText/RescaleText";

export default function Day() {
  // Get the current date
  const today = new Date();

  const searchParams = useSearchParams();

  const color = searchParams.get("color") || "dark";
  const kind = searchParams.get("kind") || "primary";
  const showTime = searchParams.get("showTime") === "true";
  const language = searchParams.get("language") || "en-US";

  // Format the date (you can customize the format as needed)
  const formattedDate = today.toLocaleDateString(language, {
    //  weekday: "long",
    // year: "numeric",
    month: "long",
    day: "numeric",
  });

  const weekday = today.toLocaleDateString(language, {
    weekday: "long",
  });

  const showQuote = kind === "demotivational" || kind === "funny";

  const classNames = classnames({
    [styles.dayCalendar]: true,
    [styles[color]]: color,
    [styles[kind]]: kind,
    [styles.showQuote]: showQuote,
    [styles.showOnlyDate]: !showQuote,
  });

  return (
    <div className={classNames}>
      {showQuote && (
        <div className={styles.quote}>
          <RescaleText checkHeight maxFontSize={100} id="quote">
            <Demotivational kind={kind} />
          </RescaleText>
        </div>
      )}
      {/* Display the week day */}

      {showQuote ? (
        <>
          <p className={styles.date}>
            <RescaleText id="formattedDate" maxFontSize={150} checkHeight>
              {formattedDate}
            </RescaleText>
          </p>
          <h1 className={styles.weekday}>
            <RescaleText id="weekday" maxFontSize={100} checkHeight>
              {weekday}
            </RescaleText>
          </h1>
        </>
      ) : (
        <>
          <p className={styles.day}>
            <RescaleText id="formattedDate" maxFontSize={300} checkHeight>
              {today.toLocaleDateString(language, {
                day: "numeric",
              })}
            </RescaleText>
          </p>
          <p className={styles.month}>
            <RescaleText id="formattedDate" maxFontSize={100} checkHeight>
              {today.toLocaleDateString(language, {
                month: "long",
              })}
            </RescaleText>
          </p>
          <h1 className={styles.weekday}>
            <RescaleText id="weekday" maxFontSize={100} checkHeight>
              {weekday}
            </RescaleText>
          </h1>
        </>
      )}

      {/* Display the current time */}
      {showTime && (
        <p className={styles.time}> {today.toLocaleTimeString(language)}</p>
      )}
    </div>
  );
}
