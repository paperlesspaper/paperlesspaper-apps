"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Trans } from "react-i18next";
import classNames from "classnames";
import styles from "./daysLeft.module.scss";
import { LoadingProvider } from "@/helpers/Loading";
import RescaleText from "../RescaleText/RescaleText";
import useTranslationFromUrl from "@/i18n/useTranslationFromUrl";

export default function DaysLeftWrapper() {
  return (
    <LoadingProvider finishedLoading>
      <DaysLeft />
    </LoadingProvider>
  );
}

export function DaysLeft() {
  const params = useSearchParams();
  const dateParam = params.get("date") || "";
  const fromDateParam = params.get("from") || "";
  const color = params.get("color") || "dark";
  const description = params.get("description") || "";
  const accent = params.get("accent") || "";

  const fromDate = fromDateParam ? new Date(fromDateParam) : new Date();
  const today = new Date();
  fromDate.setHours(0, 0, 0, 0);

  const targetDate = dateParam ? new Date(dateParam) : new Date();

  if (targetDate) targetDate.setHours(0, 0, 0, 0);

  const msInDay = 1000 * 60 * 60 * 24;
  const diffMs = targetDate ? targetDate.getTime() - today.getTime() : 0;
  const daysLeft = targetDate ? Math.max(Math.ceil(diffMs / msInDay), 0) : 0;

  const diff = Date.now() - new Date(fromDate).getTime();
  const daysPassed = Math.floor(diff / msInDay);

  // Difference in days between from date and date
  const totalDaysFromStart = Math.max(
    Math.ceil(
      (targetDate ? targetDate.getTime() : today.getTime()) - fromDate.getTime()
    ) / msInDay,
    0
  );

  const icons = Array.from({ length: totalDaysFromStart }, (_, i) => (
    <span
      key={i}
      className={classNames(styles.icon, {
        [styles.passed]: i < daysPassed,
        [styles.left]: i >= daysPassed,
      })}
    />
  ));

  const { translation } = useTranslationFromUrl();

  const classes = classNames({
    [styles.daysLeft]: true,
    [styles[color]]: color,
    // [styles[kind]]: kind,
    [color]: color,
    [accent]: accent,
  });

  return (
    <div className={classes}>
      <div className={styles.header}>
        <div className={styles.counts}>
          <span className={styles.passedCount}>
            {daysPassed}
            <span className={styles.countsDescription}>
              <Trans>days passed</Trans>
            </span>
          </span>
          <span className={styles.leftCount}>
            {daysLeft}{" "}
            <span className={styles.countsDescription}>
              <Trans>days left</Trans>
            </span>
          </span>
        </div>
      </div>
      <div className={styles.progressWrapper}>
        <RescaleText id="progress" maxFontSize={40} checkHeight>
          <div className={styles.progress}>{icons}</div>
        </RescaleText>{" "}
      </div>{" "}
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
