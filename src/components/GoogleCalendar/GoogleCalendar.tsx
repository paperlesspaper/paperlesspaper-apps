"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

const padDatePart = (value: number): string => String(value).padStart(2, "0");

const toDateKey = (date: Date, timeZone?: string): string => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return year && month && day ? `${year}-${month}-${day}` : "";
};

const toFixedOffsetDateKey = (date: Date, offsetMinutes: number): string => {
  const shiftedDate = new Date(date.getTime() + offsetMinutes * 60_000);

  return [
    shiftedDate.getUTCFullYear(),
    padDatePart(shiftedDate.getUTCMonth() + 1),
    padDatePart(shiftedDate.getUTCDate()),
  ].join("-");
};

const dateKeyFromDateTime = (value?: string): string | null => {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match?.[0] || null;
};

const offsetMinutesFromDateTime = (value?: string): number | null => {
  const match = value?.match(/(?:Z|([+-])(\d{2}):?(\d{2}))$/);
  if (!match) {
    return null;
  }

  if (match[0] === "Z") {
    return 0;
  }

  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
};

const dateKeyToUtcDay = (dateKey: string): number | null => {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
};

const dateFromDateKey = (dateKey: string): Date | null => {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, 12);
};

const isDateKeyInRange = (
  dateKey: string,
  startDateKey: string,
  dayRange: number,
): boolean => {
  const dateDay = dateKeyToUtcDay(dateKey);
  const startDay = dateKeyToUtcDay(startDateKey);
  if (dateDay === null || startDay === null) {
    return true;
  }

  return dateDay >= startDay && dateDay < startDay + dayRange;
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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

const validEvents = (events: unknown[]): EventData[] =>
  events.filter((event): event is EventData =>
    isRecord(event) && isRecord(event.start) &&
    Boolean(toDate(event.start.dateTime as string) || toDate(event.start.date as string)),
  );

const extractEventsFromPayload = (payload: unknown): EventData[] | null => {
  if (Array.isArray(payload)) {
    return validEvents(payload);
  }

  if (!isRecord(payload)) {
    return null;
  }

  const calendarData = payload.calendarData;
  if (isRecord(calendarData) && Array.isArray(calendarData.events)) {
    return validEvents(calendarData.events);
  }

  const meta = payload.meta;
  if (isRecord(meta)) {
    const metaCalendarData = meta.calendarData;
    if (
      isRecord(metaCalendarData) &&
      Array.isArray(metaCalendarData.events)
    ) {
      return validEvents(metaCalendarData.events);
    }
  }

  if (Array.isArray(payload.events)) {
    return validEvents(payload.events);
  }

  return null;
};

const getEventStartTime = (item: ProcessedEvent): number => {
  return item.eventStart?.getTime() ?? Number.MAX_SAFE_INTEGER;
};

const getEventTimeZone = (event: EventData): string | undefined => {
  return event.start?.timeZone || event.end?.timeZone;
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

  if (event.start?.date) {
    const allDayDate = dateFromDateKey(event.start.date);
    const allDayFormatter = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    return allDayDate ? allDayFormatter.format(allDayDate) : event.start.date;
  }

  if (!eventStart) {
    return "";
  }

  return formatter.format(eventStart);
};

const buildDateKey = (event: EventData, eventStart: Date | null): string => {
  if (event.start?.date) {
    return event.start.date;
  }

  if (!eventStart) {
    return "undated";
  }

  const timeZone = getEventTimeZone(event);
  if (timeZone) {
    return toDateKey(eventStart, timeZone);
  }

  return dateKeyFromDateTime(event.start?.dateTime) || toDateKey(eventStart);
};

const buildCurrentDateKeyForEvent = (event: EventData, now: Date): string => {
  const timeZone = getEventTimeZone(event);
  if (timeZone) {
    return toDateKey(now, timeZone);
  }

  const offsetMinutes = offsetMinutesFromDateTime(event.start?.dateTime);
  if (offsetMinutes !== null) {
    return toFixedOffsetDateKey(now, offsetMinutes);
  }

  return toDateKey(now);
};

function GoogleCalendarContent() {
  const [eventsData, setEventsData] = useState<EventData[]>(
    googleCalendarSampleData,
  );
  const hasReceivedCalendarData = useRef(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

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
      }, 150);
    };

    setLoading(true);

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || event.data.cmd !== "message") {
        return;
      }

      const nextEvents = extractEventsFromPayload(event.data.data);
      if (!nextEvents) {
        return;
      }

      if (!hasReceivedCalendarData.current) {
        setLoading(true);
      }

      hasReceivedCalendarData.current = true;
      setEventsData(nextEvents);
      finishLoadingWithDelay();
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
    if (!eventsData || eventsData.length === 0) {
      return [];
    }

    return eventsData
      .map((event) => {
        const eventStart =
          toDate(event.start?.dateTime) || toDate(event.start?.date);
        const eventDateKey = buildDateKey(event, eventStart);
        const windowStartDateKey = buildCurrentDateKeyForEvent(event, now);
        // The top date header represents a single day, regardless of dayRange.
        // Header, timed events and day boundaries use the renderer/browser's
        // display timezone. All-day dates are floating dates with exclusive ends.
        const today = toDateKey(now);
        const startDay = event.start.date || (eventStart ? toDateKey(eventStart) : "");
        const eventEnd = toDate(event.end?.dateTime);
        const lastDay = event.end?.date
          ? event.end.date
          : eventEnd
            ? toDateKey(new Date(eventEnd.getTime() - 1))
            : startDay;
        const overlapsToday = startDay <= today && (event.end?.date
          ? lastDay > today
          : lastDay >= today);
        const isWithinRange = highlightToday
          ? overlapsToday
          : eventDateKey === "undated" ||
            isDateKeyInRange(eventDateKey, windowStartDateKey, dayRange);

        return {
          event,
          eventStart,
          isWithinRange,
        };
      })
      .filter(({ isWithinRange }) => isWithinRange)
      .sort((a, b) => getEventStartTime(a) - getEventStartTime(b))
      .slice(0, maxEvents)
      .map(({ event, eventStart }) => ({
        event,
        eventStart,
      }));
  }, [eventsData, dayRange, maxEvents, highlightToday, now]);

  const groupedEvents = useMemo<EventBucket[]>(() => {
    const buckets = new Map<string, EventBucket>();

    processedEvents.forEach((item) => {
      const key = highlightToday ? toDateKey(now) : buildDateKey(item.event, item.eventStart);
      if (!buckets.has(key)) {
        const label = formatDateLabel(item.event, item.eventStart, language);
        buckets.set(key, { key, label, items: [] });
      }
      buckets.get(key)?.items.push(item);
    });

    return Array.from(buckets.values()).sort((a, b) =>
      a.key.localeCompare(b.key),
    );
  }, [processedEvents, language, highlightToday, now]);

  const shouldShowDayHeaders = groupedEvents.length > 1;

  const todayBanner = useMemo(() => {
    if (!highlightToday) {
      return null;
    }

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
  }, [highlightToday, language, now]);

  const todayBannerStyle = useMemo<CSSProperties | undefined>(() => {
    if (!highlightToday || highlightScale === 1) {
      return undefined;
    }

    return {
      // transform: `scale(${highlightScale})`,
    };
  }, [highlightToday, highlightScale]);

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
                      useDisplayTimeZone={highlightToday}
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
