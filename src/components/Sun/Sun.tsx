"use client";
import React, { useEffect, useState } from "react";
import { LoadingProvider, useLoading } from "@/helpers/Loading";
import SunDay from "./SunDay";
import styles from "./sun.module.scss";

import useTranslationFromUrl from "@/i18n/useTranslationFromUrl";

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

// Example coordinates for Berlin
const DEFAULT_LAT = 52.52;
const DEFAULT_LNG = 13.405;
const DEFAULT_TZ = 2;

export function Sun() {
  const [days, setDays] = useState<
    Record<string, { sunrise?: SunEvent; sunset?: SunEvent; date?: string }>
  >({});
  const [error, setError] = useState<string | null>(null);
  const setLoading = useLoading({ id: "sun-sunsethue" });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { language } = useTranslationFromUrl();

  useEffect(() => {
    async function fetchSunsethue() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/sunsethue?lat=${DEFAULT_LAT}&lng=${DEFAULT_LNG}&tz=${encodeURIComponent(
            DEFAULT_TZ
          )}&date=${new Date().toISOString().split("T")[0]}` // Use today's date
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch");
        }
        const data = await res.json();
        // Adapt to new API structure: group by date, pair sunrise/sunset
        if (data && Array.isArray(data.data)) {
          // Group events by date (YYYY-MM-DD)
          const grouped: Record<
            string,
            { sunrise?: SunEvent; sunset?: SunEvent }
          > = {};
          (data.data as SunEvent[]).forEach((event) => {
            const dateKey = event.time.slice(0, 10);
            if (!grouped[dateKey]) grouped[dateKey] = {};
            if (event.type === "sunrise") grouped[dateKey].sunrise = event;
            if (event.type === "sunset") grouped[dateKey].sunset = event;
          });

          console.info("Sunsethue data grouped by date:", grouped);
          setDays(grouped);
        } else {
          setDays({});
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchSunsethue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLoading]);

  return (
    <div className={styles.sunWrapper}>
      {/* <h1>
        <FontAwesomeIcon icon={faSun} style={{ marginRight: 8 }} />
        Sunrise & Sunset
        <FontAwesomeIcon icon={faMoon} style={{ marginLeft: 8 }} />
      </h1> */}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div className={styles.sunList}>
        {(() => {
          const firstDay = Object.entries(days)[0];
          return firstDay ? (
            <SunDay day={{ ...firstDay[1], date: firstDay[0] }} />
          ) : null;
        })()}
      </div>
    </div>
  );
}

export default function SunWrapper() {
  return (
    <LoadingProvider>
      <Sun />
    </LoadingProvider>
  );
}
