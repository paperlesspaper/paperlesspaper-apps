/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import styles from "./birthCalendar.module.scss";
import { useSearchParams } from "next/navigation";
import classnames from "classnames";
import RescaleText from "../RescaleText/RescaleText";
import pregnancyDataDe from "./pregnancyDe.json";
import pregnancyDataEn from "./pregnancyEn.json";
import useTranslationFromUrl from "@/i18n/useTranslationFromUrl";

import { Trans } from "react-i18next";

import Image from "next/image";
import week1 from "./assets/week1.png";
import week2 from "./assets/week2.png";
import week3 from "./assets/week3.png";
import week4 from "./assets/week4.png";
import week12 from "./assets/week12.png";
import week20 from "./assets/week20.png";
import week38 from "./assets/week38.png";

/**
 * Estimates the conception date from a given birth date.
 * Uses ~266 days (38 weeks) as the average time from conception to birth.
 *
 * @param {Date|string} birthDate – either a Date object or an ISO‐format string
 * @returns {Date} – estimated conception date
 */
export function estimateConceptionDate(birthDate: Date | string): Date {
  const date = new Date(birthDate);
  const GESTATION_DAYS = 280;
  date.setDate(date.getDate() - GESTATION_DAYS);
  return date;
}

export default function BirthCalendarScreen() {
  const searchParams = useSearchParams();

  const color = searchParams.get("color") || "dark";
  const kind = searchParams.get("kind") || "default";
  const accent = searchParams.get("accent") || "";
  const conceptionDate = estimateConceptionDate(
    searchParams.get("birthdate") || "2023-01-01"
  );

  const { language } = useTranslationFromUrl();

  // Get the quote for the current day, mod by 356 to stay within array bounds
  const pregnancyData = language === "de" ? pregnancyDataDe : pregnancyDataEn;

  // compute days since conception
  const conception = new Date(conceptionDate);
  const today = new Date();
  const daysPassed = Math.floor(
    (today.getTime() - conception.getTime()) / (1000 * 60 * 60 * 24)
  );

  // pick the latest entry whose day <= daysPassed
  const currentEntry =
    pregnancyData
      .filter((e) => e.day <= daysPassed)
      .sort((a, b) => b.day - a.day)[0] || pregnancyData[0];

  const classNames = classnames({
    [styles.dayCalendar]: true,
    [styles[color]]: color,
    [styles[kind]]: kind,
    [color]: color,
    [accent]: accent,
  });

  // list out all the weeks for which you have images:
  const availableWeeks = [1, 2, 3, 4, 12, 20, 38];

  function weekForDay(day: number): number {
    return Math.ceil(day / 7);
  }

  // 1) mark the literal object as `const` so its keys/values become literal types
  const images = {
    1: week1,
    2: week2,
    3: week3,
    4: week4,
    12: week12,
    20: week20,
    38: week38,
  } as const;

  type WeekKey = keyof typeof images;
  type WeekImage = (typeof images)[WeekKey];

  function imageForWeek(day: number): WeekImage {
    let week = weekForDay(day);

    while (week > 1 && !availableWeeks.includes(week)) {
      week--;
    }

    return images[week as WeekKey];
  }

  useTranslationFromUrl();

  return (
    <div className={classNames}>
      <div className={styles.day}>
        <div className={styles.image}>
          <Image
            src={imageForWeek(currentEntry.day)}
            alt="Week 12 of pregnancy"
          />
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>
            <RescaleText id="day" maxFontSize={60} checkHeight>
              {currentEntry.day < 280 ? (
                <>
                  <Trans>Day</Trans>: {currentEntry.day}
                </>
              ) : (
                currentEntry.age
              )}
              {/* currentEntry.age ? ` (${currentEntry.age})` : "" */}
            </RescaleText>
          </h1>
          <div className={styles.extract}>
            <RescaleText id="content" maxFontSize={35} checkHeight>
              {currentEntry.size && (
                <div className={styles.date}>
                  <Trans>Size</Trans>: {currentEntry.size} cm (
                  {currentEntry.comparison})
                </div>
              )}
              {currentEntry.explanation}
            </RescaleText>
          </div>
        </div>
      </div>
    </div>
  );
}
