"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./googleCalendar.module.scss";
import { useSearchParams } from "next/navigation";
import classnames from "classnames";
import EventCard from "./EventCard";
import RescaleText from "../RescaleText/RescaleText";
import { LoadingProvider, useLoading } from "@/helpers/Loading";
import { googleCalendarSampleData } from "./sampleDate";
import useTranslationFromUrl from "@/i18n/useTranslationFromUrl";

const DEFAULT_DAY_RANGE = 3;
const DEFAULT_MAX_EVENTS = 50;
const DEFAULT_HIGHLIGHT_SCALE = 1.35;

const clampNumber = (
  value: number | undefined,
  { min, max, fallback }: { min: number; max: number; fallback: number },
) => {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value as number, min), max);
};

const parseIntegerParam = (
  value: string | null,
  { min, max, fallback }: { min: number; max: number; fallback: number },
) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return clampNumber(Number.isNaN(parsed) ? undefined : Math.round(parsed), {
    min,
    max,
    fallback,
  });
};

const parseFloatParam = (
  value: string | null,
  { min, max, fallback }: { min: number; max: number; fallback: number },
) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return clampNumber(Number.isNaN(parsed) ? undefined : parsed, {
    min,
    max,
    fallback,
  });
};

const parseBooleanParam = (value: string | null, fallback = false): boolean => {
  if (!value) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
};

const toDate = (value?: string): Date | null => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/* 
const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};
*/

export type EventData = {
  kind: string;
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
} & Record<string, unknown>;

type ProcessedEvent = {
  event: EventData;
  eventStart: Date | null;
};

type EventBucket = {
  key: string;
  label: string;
  items: ProcessedEvent[];
};

const getEventTimeZone = (event: EventData): string | undefined => {
  return event.start.timeZone || event.end.timeZone;
};

const formatDateLabel = (
  event: EventData,
  eventStart: Date | null,
  locale: string,
): string => {
  const timeZone = getEventTimeZone(event);
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone,
  });

  if (event.start.date) {
    return formatter.format(new Date(event.start.date));
  }

  if (!eventStart) {
    return "";
  }

  return formatter.format(eventStart);
};

const buildDateKey = (event: EventData, eventStart: Date | null): string => {
  if (event.start.date) {
    return event.start.date;
  }

  if (!eventStart) {
    return "undated";
  }

  const timeZone = getEventTimeZone(event);
  const keyFormatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  });

  return keyFormatter.format(eventStart);
};

function GoogleCalendarContent() {
  const [eventsData, setEventsData] = useState<EventData[]>(
    googleCalendarSampleData,
  );

  const setLoading = useLoading({ id: "google-calendar-events" });

  const searchParams = useSearchParams();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslationFromUrl();

  const color = searchParams.get("color") || "dark";
  const kind = searchParams.get("kind") || "primary";
  const language = searchParams.get("language") || "de-DE";
  const dayRange = parseIntegerParam(searchParams.get("dayRange"), {
    min: 1,
    max: 100,
    fallback: DEFAULT_DAY_RANGE,
  });
  const maxEvents = parseIntegerParam(searchParams.get("maxEvents"), {
    min: 1,
    max: 200,
    fallback: DEFAULT_MAX_EVENTS,
  });
  const highlightToday = parseBooleanParam(
    searchParams.get("highlightToday"),
    false,
  );
  const highlightScale = parseFloatParam(searchParams.get("highlightScale"), {
    min: 1,
    max: 3,
    fallback: DEFAULT_HIGHLIGHT_SCALE,
  });

  const classNames = classnames(
    {
      [styles.dayCalendar]: true,
      [styles[color]]: color,
      [styles[kind]]: kind,
    },
    color,
    kind,
  );

  useEffect(() => {
    let completionTimer: ReturnType<typeof setTimeout> | null = null;

    const finishLoadingWithDelay = () => {
      if (completionTimer) {
        clearTimeout(completionTimer);
      }
      completionTimer = setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    setLoading(true);

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.cmd === "message") {
        console.log("Received data:", event.data.data);
        setLoading(true);

        // TODO: Temporary fix until we have unified data format
        const newEventsdata =
          event.data.data.calendarData?.events || event.data.data;

        setEventsData(newEventsdata);
        finishLoadingWithDelay();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      if (completionTimer) {
        clearTimeout(completionTimer);
      }
    };
  }, [setLoading]);

  const processedEvents = useMemo<ProcessedEvent[]>(() => {
    const windowStart = new Date();
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowStart.getDate() + Math.max(dayRange - 1, 0));
    windowEnd.setHours(23, 59, 59, 999);

    console.log("Filtering events", eventsData, windowStart, windowEnd);
    if (!eventsData || eventsData.length === 0) {
      return [];
    }

    return eventsData
      .map((event) => {
        const eventStart =
          toDate(event.start.dateTime) || toDate(event.start.date);
        const isWithinRange = eventStart
          ? eventStart.getTime() >= windowStart.getTime() &&
            eventStart.getTime() <= windowEnd.getTime()
          : true;

        return {
          event,
          eventStart,
          isWithinRange,
        };
      })
      .filter(({ isWithinRange }) => isWithinRange)
      .slice(0, maxEvents)
      .map(({ event, eventStart }) => ({
        event,
        eventStart,
      }));
  }, [eventsData, dayRange, maxEvents]);

  const groupedEvents = useMemo<EventBucket[]>(() => {
    const buckets = new Map<string, EventBucket>();

    processedEvents.forEach((item) => {
      const key = buildDateKey(item.event, item.eventStart);
      if (!buckets.has(key)) {
        const label = formatDateLabel(item.event, item.eventStart, language);
        buckets.set(key, { key, label, items: [] });
      }
      buckets.get(key)?.items.push(item);
    });

    return Array.from(buckets.values()).sort((a, b) =>
      a.key.localeCompare(b.key),
    );
  }, [processedEvents, language]);

  const shouldShowDayHeaders = groupedEvents.length > 1;

  const todayBanner = useMemo(() => {
    if (!highlightToday) {
      return null;
    }

    const now = new Date();
    const weekdayFormatter = new Intl.DateTimeFormat(language, {
      weekday: "long",
    });
    const dateFormatter = new Intl.DateTimeFormat(language, {
      month: "long",
      day: "numeric",
    });

    let relativeLabel: string | null = null;
    if (typeof Intl.RelativeTimeFormat !== "undefined") {
      try {
        const relativeFormatter = new Intl.RelativeTimeFormat(language, {
          numeric: "auto",
        });
        relativeLabel = relativeFormatter.format(0, "day");
      } catch (error) {
        console.warn("Unable to build relative label", error);
        relativeLabel = null;
      }
    }

    return {
      isoString: now.toISOString(),
      weekdayLabel: weekdayFormatter.format(now),
      dateLabel: dateFormatter.format(now),
      relativeLabel,
    };
  }, [highlightToday, language]);

  const todayBannerStyle = useMemo<CSSProperties | undefined>(() => {
    if (!highlightToday || highlightScale === 1) {
      return undefined;
    }

    return {
      // transform: `scale(${highlightScale})`,
    };
  }, [highlightToday, highlightScale]);

  console.log("GoogleCalendar render", processedEvents, groupedEvents);

  return (
    <div className={classNames}>
      {todayBanner && (
        <div className={styles.todayBanner} style={todayBannerStyle}>
          {/* todayBanner.relativeLabel && (
          <span className={styles.todayBannerHint}>
            {todayBanner.relativeLabel}
          </span>
        ) */}
          <span className={styles.todayBannerWeekday}>
            {todayBanner.weekdayLabel}
          </span>
          <time
            className={styles.todayBannerDate}
            dateTime={todayBanner.isoString}
          >
            {todayBanner.dateLabel}
          </time>
        </div>
      )}

      <div className={styles.dayCalendarContent}>
        <RescaleText id="google-calendar" maxFontSize={17} checkHeight>
          <div className={styles.dayCalendarInside}>
            {groupedEvents.length === 0 ? (
              <div className={styles.empty}>No events to show</div>
            ) : (
              groupedEvents.map(({ key, label, items }) => (
                <div key={key} className={styles.dayGroup}>
                  {shouldShowDayHeaders && label && (
                    <div className={styles.dayHeader}>{label}</div>
                  )}
                  {items.map(({ event }, i) => (
                    <EventCard
                      key={event.id || `${key}-${i}`}
                      event={event}
                      language={language}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </RescaleText>
      </div>
    </div>
  );
}

export default function GoogleCalendar() {
  return (
    <LoadingProvider>
      <GoogleCalendarContent />
    </LoadingProvider>
  );
}
