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

type PregnancySource = {
  title: string;
  url: string;
};

type PregnancyEntry = {
  day: number;
  age?: string;
  explanation: string;
  size?: number;
  comparison?: string;
  sources?: PregnancySource[];
  imagePrompt?: string;
};

/**
 * Estimates the gestational start date from a due/birth date.
 * Pregnancy day counts use gestational age, which starts at the last menstrual
 * period and is conventionally about 280 days before the due date.
 *
 * @param {Date|string} birthDate - either a Date object or an ISO-format string
 * @returns {Date} - estimated gestational start date
 */
export function estimateGestationalStartDate(birthDate: Date | string): Date {
  const date = new Date(birthDate);
  const GESTATION_DAYS = 280;
  date.setDate(date.getDate() - GESTATION_DAYS);
  return date;
}

export const estimateConceptionDate = estimateGestationalStartDate;

export default function BirthCalendarScreen() {
  const searchParams = useSearchParams();

  const color = searchParams.get("color") || "dark";
  const kind = searchParams.get("kind") || "default";
  const accent = searchParams.get("accent") || "";
  const gestationalStartDate = estimateGestationalStartDate(
    searchParams.get("birthdate") || "2023-01-01"
  );

  const { language } = useTranslationFromUrl();

  const pregnancyData = (
    language === "de" ? pregnancyDataDe : pregnancyDataEn
  ) as PregnancyEntry[];

  // compute gestational age in days
  const gestationalStart = new Date(gestationalStartDate);
  const today = new Date();
  const daysPassed = Math.floor(
    (today.getTime() - gestationalStart.getTime()) / (1000 * 60 * 60 * 24)
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

  function availableImageWeekForDay(day: number): WeekKey {
    let week = weekForDay(day);

    while (week > 1 && !availableWeeks.includes(week)) {
      week--;
    }

    return week as WeekKey;
  }

  function imageForWeek(day: number): WeekImage {
    return images[availableImageWeekForDay(day)];
  }

  useTranslationFromUrl();

  return (
    <div className={classNames}>
      <div className={styles.day}>
        <div className={styles.image}>
          <Image
            src={imageForWeek(currentEntry.day)}
            alt={`Pregnancy week ${availableImageWeekForDay(
              currentEntry.day
            )} illustration`}
          />
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>
            <RescaleText id="day" maxFontSize={60} checkHeight>
              {currentEntry.age ? (
                currentEntry.age
              ) : (
                <>
                  <Trans>Day</Trans>: {currentEntry.day}
                </>
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
              {currentEntry.sources && currentEntry.sources.length > 0 && (
                <div className={styles.source}>
                  Source:{" "}
                  {currentEntry.sources.map((source, index) => (
                    <React.Fragment key={source.url}>
                      {index > 0 ? ", " : ""}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {source.title}
                      </a>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </RescaleText>
          </div>
        </div>
      </div>
    </div>
  );
}
