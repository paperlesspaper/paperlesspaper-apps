/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import styles from "./wikipedia.module.scss";
import { useSearchParams } from "next/navigation";
import classnames from "classnames";
import RescaleText from "../RescaleText/RescaleText";
import truncateText from "@/helpers/truncateText";

type OnThisDayItem = {
  title: string;
  text: string;
  year: number;
};

export default function WikipediaScreen() {
  const searchParams = useSearchParams();

  const color = searchParams.get("color") || "dark";
  const kind = searchParams.get("kind") || "primary";
  //const showTime = searchParams.get("showTime") === "true";
  const language = searchParams.get("language") || "de";
  const accent = searchParams.get("accent") || "";
  const limit = searchParams.get("limit") || 10;
  const limitCharacters: number =
    parseInt(searchParams.get("limitCharacters") as string) || 550;

  const classNames = classnames({
    [styles.dayCalendar]: true,
    [styles[color]]: color,
    [styles[kind]]: kind,
    [color]: color,
    [accent]: accent,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wikipediaData, setWikipediaData] = useState<any>(null);

  const getWikipedia = async () => {
    const url = `https://${language}.wikipedia.org/api/rest_v1/feed/featured/`;
    // Get today's date in YYYY/MM/DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const apiUrl = `${url}${year}/${month}/${day}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    setWikipediaData(data);
  };

  useEffect(() => {
    getWikipedia();
  }, []);

  console.log("wikipediaData", wikipediaData);

  if (!wikipediaData) {
    return null;
  }

  if (kind === "onthisday") {
    const formattedTimeTitle = new Date().toLocaleDateString("de-DE", {
      /* wikipediaData.tfa.timestamp */
      day: "numeric",
      month: "long",
    });

    return (
      <div className={classNames}>
        <div className={styles.day}>
          <h2 className={styles.onThisDayTitle}>
            <span>{formattedTimeTitle}</span>
          </h2>
          <div className={styles.onThisDayWrapper}>
            <RescaleText id="temperature" maxFontSize={70} checkHeight>
              {wikipediaData.onthisday
                .slice(0, limit)
                .map((item: OnThisDayItem, i: number) => (
                  <div className={styles.onThisDay} key={i}>
                    <div className={styles.date}>{item.year}</div> · {item.text}
                  </div>
                ))}
            </RescaleText>
          </div>
        </div>
      </div>
    );
  }

  const formattedTime = new Date().toLocaleDateString("de-DE", {
    /* wikipediaData.tfa.timestamp */
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={classNames}>
      <div className={styles.day}>
        {wikipediaData.tfa?.thumbnail?.source && (
          <div className={styles.image}>
            <img
              // src={wikipediaData.image.image.source}
              src={wikipediaData.tfa.thumbnail.source}
              alt={wikipediaData.image.title}
            />
          </div>
        )}
        <h1 className={styles.title}>
          <RescaleText id="location" maxFontSize={60} checkHeight>
            {wikipediaData.tfa?.normalizedtitle}
          </RescaleText>
        </h1>
        <div className={styles.extract}>
          <RescaleText id="temperature" maxFontSize={70} checkHeight>
            <div className={styles.date}>{formattedTime} –</div>{" "}
            {truncateText(wikipediaData.tfa?.extract, limitCharacters)}
          </RescaleText>
        </div>
      </div>
    </div>
  );
}
