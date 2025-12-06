"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./googleCalendar.module.scss";
import { useSearchParams } from "next/navigation";
import classnames from "classnames";
import EventCard from "./EventCard";
import RescaleText from "../RescaleText/RescaleText";
import { LoadingProvider } from "@/helpers/Loading";

const DEFAULT_DAY_RANGE = 3;
const DEFAULT_MAX_EVENTS = 50;
const DEFAULT_HIGHLIGHT_SCALE = 1.35;

const clampNumber = (
  value: number | undefined,
  { min, max, fallback }: { min: number; max: number; fallback: number }
) => {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value as number, min), max);
};

const parseIntegerParam = (
  value: string | null,
  { min, max, fallback }: { min: number; max: number; fallback: number }
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
  { min, max, fallback }: { min: number; max: number; fallback: number }
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

const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

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

export default function GoogleCalendar(): JSX.Element {
  const [eventsData, setEventsData] = useState<EventData[]>([
    {
      kind: "calendar#event",
      etag: '"3526097255168670"',
      id: "215c7qocl4gvukjnqh8h7k07h3_20251205T130000Z",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=MjE1Yzdxb2NsNGd2dWtqbnFoOGg3azA3aDNfMjAyNTEyMDVUMTMwMDAwWiBnajVldTF2ZDI0aGVsMTFhZGRwcWJsYzA3OEBn",
      created: "2025-11-13T15:16:23.000Z",
      updated: "2025-11-13T15:43:47.584Z",
      summary: "Sprint Planung",
      creator: {
        email: "danielboeber@gmail.com",
      },
      organizer: {
        email: "gj5eu1vd24hel11addpqblc078@group.calendar.google.com",
        displayName: "wirewire",
        self: true,
      },
      start: {
        dateTime: "2025-12-05T14:00:00+01:00",
        timeZone: "Europe/Berlin",
      },
      end: {
        dateTime: "2025-12-05T15:30:00+01:00",
        timeZone: "Europe/Berlin",
      },
      recurringEventId: "215c7qocl4gvukjnqh8h7k07h3",
      originalStartTime: {
        dateTime: "2025-12-05T14:00:00+01:00",
        timeZone: "Europe/Berlin",
      },
      iCalUID: "215c7qocl4gvukjnqh8h7k07h3@google.com",
      sequence: 0,
      attendees: [
        {
          email: "daniel@wirewire.de",
          responseStatus: "accepted",
        },
        {
          email: "robert@wirewire.de",
          responseStatus: "accepted",
        },
      ],
      hangoutLink: "https://meet.google.com/yhg-zzwc-sma",
      conferenceData: {
        entryPoints: [
          {
            entryPointType: "video",
            uri: "https://meet.google.com/yhg-zzwc-sma",
            label: "meet.google.com/yhg-zzwc-sma",
          },
        ],
        conferenceSolution: {
          key: {
            type: "hangoutsMeet",
          },
          name: "Google Meet",
          iconUri:
            "https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png",
        },
        conferenceId: "yhg-zzwc-sma",
      },
      guestsCanInviteOthers: false,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
    },
    {
      kind: "calendar#event",
      etag: '"3529535368490430"',
      id: "c4pmap1hcoo3ibb6chgjeb9kckpj0b9p6lj62bb269i66dj370q64e1l6g",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=YzRwbWFwMWhjb28zaWJiNmNoZ2plYjlrY2twajBiOXA2bGo2MmJiMjY5aTY2ZGozNzBxNjRlMWw2ZyA0NjdlZDk1ZGZiNWEyYmE0NjE1MDBjY2JhMTZhN2MwYWU2YjE3NDdhMTNhMjVkY2ViMTUzMjcwY2Y4YjI5NGNmQGc",
      created: "2025-11-08T08:15:41.000Z",
      updated: "2025-12-03T13:14:44.245Z",
      summary: "Weihnachtsmarkt Podemus?",
      creator: {
        email: "c.schier92@googlemail.com",
      },
      organizer: {
        email:
          "467ed95dfb5a2ba461500ccba16a7c0ae6b1747a13a25dceb153270cf8b294cf@group.calendar.google.com",
        displayName: "CAROBERT",
        self: true,
      },
      start: {
        dateTime: "2025-12-05T16:30:00+01:00",
        timeZone: "Europe/Berlin",
      },
      end: {
        dateTime: "2025-12-05T18:30:00+01:00",
        timeZone: "Europe/Berlin",
      },
      transparency: "transparent",
      iCalUID:
        "c4pmap1hcoo3ibb6chgjeb9kckpj0b9p6lj62bb269i66dj370q64e1l6g@google.com",
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
    },
    {
      kind: "calendar#event",
      etag: '"3517422753979646"',
      id: "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NjBvMzZkcjE3MWgzNmI5aGNnb204YjlrNjFqNjRiOW82b3AzMGJiMmNwaGowb2I1NjBzNjJwaGpjYyA0NjdlZDk1ZGZiNWEyYmE0NjE1MDBjY2JhMTZhN2MwYWU2YjE3NDdhMTNhMjVkY2ViMTUzMjcwY2Y4YjI5NGNmQGc",
      created: "2025-09-24T10:56:16.000Z",
      updated: "2025-09-24T10:56:16.989Z",
      summary: "Dankesessen bei Anna?",
      creator: {
        email: "c.schier92@googlemail.com",
      },
      organizer: {
        email:
          "467ed95dfb5a2ba461500ccba16a7c0ae6b1747a13a25dceb153270cf8b294cf@group.calendar.google.com",
        displayName: "CAROBERT",
        self: true,
      },
      start: {
        dateTime: "2025-12-06T18:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: "2025-12-06T22:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      iCalUID:
        "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc@google.com",
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
    },
    {
      kind: "calendar#event",
      etag: '"3517422753979646"',
      id: "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NjBvMzZkcjE3MWgzNmI5aGNnb204YjlrNjFqNjRiOW82b3AzMGJiMmNwaGowb2I1NjBzNjJwaGpjYyA0NjdlZDk1ZGZiNWEyYmE0NjE1MDBjY2JhMTZhN2MwYWU2YjE3NDdhMTNhMjVkY2ViMTUzMjcwY2Y4YjI5NGNmQGc",
      created: "2025-09-24T10:56:16.000Z",
      updated: "2025-09-24T10:56:16.989Z",
      summary: "Dankesessen bei Anna?",
      creator: {
        email: "c.schier92@googlemail.com",
      },
      organizer: {
        email:
          "467ed95dfb5a2ba461500ccba16a7c0ae6b1747a13a25dceb153270cf8b294cf@group.calendar.google.com",
        displayName: "CAROBERT",
        self: true,
      },
      start: {
        dateTime: "2025-12-06T18:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: "2025-12-06T22:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      iCalUID:
        "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc@google.com",
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
    },
    {
      kind: "calendar#event",
      etag: '"3517422753979646"',
      id: "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NjBvMzZkcjE3MWgzNmI5aGNnb204YjlrNjFqNjRiOW82b3AzMGJiMmNwaGowb2I1NjBzNjJwaGpjYyA0NjdlZDk1ZGZiNWEyYmE0NjE1MDBjY2JhMTZhN2MwYWU2YjE3NDdhMTNhMjVkY2ViMTUzMjcwY2Y4YjI5NGNmQGc",
      created: "2025-09-24T10:56:16.000Z",
      updated: "2025-09-24T10:56:16.989Z",
      summary: "Dankesessen bei Anna?",
      creator: {
        email: "c.schier92@googlemail.com",
      },
      organizer: {
        email:
          "467ed95dfb5a2ba461500ccba16a7c0ae6b1747a13a25dceb153270cf8b294cf@group.calendar.google.com",
        displayName: "CAROBERT",
        self: true,
      },
      start: {
        dateTime: "2025-12-06T18:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: "2025-12-06T22:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      iCalUID:
        "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc@google.com",
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
    },
    {
      kind: "calendar#event",
      etag: '"3517422753979646"',
      id: "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NjBvMzZkcjE3MWgzNmI5aGNnb204YjlrNjFqNjRiOW82b3AzMGJiMmNwaGowb2I1NjBzNjJwaGpjYyA0NjdlZDk1ZGZiNWEyYmE0NjE1MDBjY2JhMTZhN2MwYWU2YjE3NDdhMTNhMjVkY2ViMTUzMjcwY2Y4YjI5NGNmQGc",
      created: "2025-09-24T10:56:16.000Z",
      updated: "2025-09-24T10:56:16.989Z",
      summary: "Dankesessen bei Anna?",
      creator: {
        email: "c.schier92@googlemail.com",
      },
      organizer: {
        email:
          "467ed95dfb5a2ba461500ccba16a7c0ae6b1747a13a25dceb153270cf8b294cf@group.calendar.google.com",
        displayName: "CAROBERT",
        self: true,
      },
      start: {
        dateTime: "2025-12-06T18:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: "2025-12-06T22:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      iCalUID:
        "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc@google.com",
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
    },
    {
      kind: "calendar#event",
      etag: '"3517422753979646"',
      id: "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NjBvMzZkcjE3MWgzNmI5aGNnb204YjlrNjFqNjRiOW82b3AzMGJiMmNwaGowb2I1NjBzNjJwaGpjYyA0NjdlZDk1ZGZiNWEyYmE0NjE1MDBjY2JhMTZhN2MwYWU2YjE3NDdhMTNhMjVkY2ViMTUzMjcwY2Y4YjI5NGNmQGc",
      created: "2025-09-24T10:56:16.000Z",
      updated: "2025-09-24T10:56:16.989Z",
      summary: "Dankesessen bei Anna?",
      creator: {
        email: "c.schier92@googlemail.com",
      },
      organizer: {
        email:
          "467ed95dfb5a2ba461500ccba16a7c0ae6b1747a13a25dceb153270cf8b294cf@group.calendar.google.com",
        displayName: "CAROBERT",
        self: true,
      },
      start: {
        dateTime: "2025-12-06T18:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: "2025-12-06T22:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      iCalUID:
        "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc@google.com",
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
    },
    {
      kind: "calendar#event",
      etag: '"3517422753979646"',
      id: "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NjBvMzZkcjE3MWgzNmI5aGNnb204YjlrNjFqNjRiOW82b3AzMGJiMmNwaGowb2I1NjBzNjJwaGpjYyA0NjdlZDk1ZGZiNWEyYmE0NjE1MDBjY2JhMTZhN2MwYWU2YjE3NDdhMTNhMjVkY2ViMTUzMjcwY2Y4YjI5NGNmQGc",
      created: "2025-09-24T10:56:16.000Z",
      updated: "2025-09-24T10:56:16.989Z",
      summary: "Dankesessen bei Anna?",
      creator: {
        email: "c.schier92@googlemail.com",
      },
      organizer: {
        email:
          "467ed95dfb5a2ba461500ccba16a7c0ae6b1747a13a25dceb153270cf8b294cf@group.calendar.google.com",
        displayName: "CAROBERT",
        self: true,
      },
      start: {
        dateTime: "2025-12-06T18:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: "2025-12-06T22:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      iCalUID:
        "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc@google.com",
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
    },
    {
      kind: "calendar#event",
      etag: '"3517422753979646"',
      id: "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NjBvMzZkcjE3MWgzNmI5aGNnb204YjlrNjFqNjRiOW82b3AzMGJiMmNwaGowb2I1NjBzNjJwaGpjYyA0NjdlZDk1ZGZiNWEyYmE0NjE1MDBjY2JhMTZhN2MwYWU2YjE3NDdhMTNhMjVkY2ViMTUzMjcwY2Y4YjI5NGNmQGc",
      created: "2025-09-24T10:56:16.000Z",
      updated: "2025-09-24T10:56:16.989Z",
      summary: "Dankesessen bei Anna?",
      creator: {
        email: "c.schier92@googlemail.com",
      },
      organizer: {
        email:
          "467ed95dfb5a2ba461500ccba16a7c0ae6b1747a13a25dceb153270cf8b294cf@group.calendar.google.com",
        displayName: "CAROBERT",
        self: true,
      },
      start: {
        dateTime: "2025-12-06T18:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: "2025-12-06T22:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      iCalUID:
        "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc@google.com",
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
    },
    {
      kind: "calendar#event",
      etag: '"3517422753979646"',
      id: "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NjBvMzZkcjE3MWgzNmI5aGNnb204YjlrNjFqNjRiOW82b3AzMGJiMmNwaGowb2I1NjBzNjJwaGpjYyA0NjdlZDk1ZGZiNWEyYmE0NjE1MDBjY2JhMTZhN2MwYWU2YjE3NDdhMTNhMjVkY2ViMTUzMjcwY2Y4YjI5NGNmQGc",
      created: "2025-09-24T10:56:16.000Z",
      updated: "2025-09-24T10:56:16.989Z",
      summary: "Dankesessen bei Anna?",
      creator: {
        email: "c.schier92@googlemail.com",
      },
      organizer: {
        email:
          "467ed95dfb5a2ba461500ccba16a7c0ae6b1747a13a25dceb153270cf8b294cf@group.calendar.google.com",
        displayName: "CAROBERT",
        self: true,
      },
      start: {
        dateTime: "2025-12-06T18:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: "2025-12-06T22:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      iCalUID:
        "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc@google.com",
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
    },
    {
      kind: "calendar#event",
      etag: '"3517422753979646"',
      id: "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NjBvMzZkcjE3MWgzNmI5aGNnb204YjlrNjFqNjRiOW82b3AzMGJiMmNwaGowb2I1NjBzNjJwaGpjYyA0NjdlZDk1ZGZiNWEyYmE0NjE1MDBjY2JhMTZhN2MwYWU2YjE3NDdhMTNhMjVkY2ViMTUzMjcwY2Y4YjI5NGNmQGc",
      created: "2025-09-24T10:56:16.000Z",
      updated: "2025-09-24T10:56:16.989Z",
      summary: "Dankesessen bei Anna?",
      creator: {
        email: "c.schier92@googlemail.com",
      },
      organizer: {
        email:
          "467ed95dfb5a2ba461500ccba16a7c0ae6b1747a13a25dceb153270cf8b294cf@group.calendar.google.com",
        displayName: "CAROBERT",
        self: true,
      },
      start: {
        dateTime: "2025-12-06T18:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: "2025-12-06T22:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      iCalUID:
        "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc@google.com",
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
    },
    {
      kind: "calendar#event",
      etag: '"3517422753979646"',
      id: "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NjBvMzZkcjE3MWgzNmI5aGNnb204YjlrNjFqNjRiOW82b3AzMGJiMmNwaGowb2I1NjBzNjJwaGpjYyA0NjdlZDk1ZGZiNWEyYmE0NjE1MDBjY2JhMTZhN2MwYWU2YjE3NDdhMTNhMjVkY2ViMTUzMjcwY2Y4YjI5NGNmQGc",
      created: "2025-09-24T10:56:16.000Z",
      updated: "2025-09-24T10:56:16.989Z",
      summary: "Dankesessen bei Anna?",
      creator: {
        email: "c.schier92@googlemail.com",
      },
      organizer: {
        email:
          "467ed95dfb5a2ba461500ccba16a7c0ae6b1747a13a25dceb153270cf8b294cf@group.calendar.google.com",
        displayName: "CAROBERT",
        self: true,
      },
      start: {
        dateTime: "2025-12-06T18:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: "2025-12-06T22:00:00+01:00",
        timeZone: "Europe/Paris",
      },
      iCalUID:
        "60o36dr171h36b9hcgom8b9k61j64b9o6op30bb2cphj0ob560s62phjcc@google.com",
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
    },
  ]);

  const searchParams = useSearchParams();

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
    false
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
    kind
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.cmd === "message") {
        console.log("Received data:", event.data.data);
        setEventsData(event.data.data);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const processedEvents = useMemo<ProcessedEvent[]>(() => {
    const windowStart = new Date();
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowStart.getDate() + Math.max(dayRange - 1, 0));
    windowEnd.setHours(23, 59, 59, 999);

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
    const formatter = new Intl.DateTimeFormat(language, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const buckets = new Map<string, EventBucket>();

    processedEvents.forEach((item) => {
      const key = item.eventStart
        ? item.eventStart.toISOString().split("T")[0]
        : "undated";
      if (!buckets.has(key)) {
        const label = item.eventStart ? formatter.format(item.eventStart) : "";
        buckets.set(key, { key, label, items: [] });
      }
      buckets.get(key)?.items.push(item);
    });

    return Array.from(buckets.values()).sort((a, b) =>
      a.key.localeCompare(b.key)
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

  console.log("GoogleCalendar render", processedEvents);

  return (
    <LoadingProvider>
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
              {groupedEvents.map(({ key, label, items }) => (
                <div key={key} className={styles.dayGroup}>
                  {shouldShowDayHeaders && label && (
                    <div className={styles.dayHeader}>{label}</div>
                  )}
                  {items.map(({ event }, i) => (
                    <EventCard key={event.id || `${key}-${i}`} event={event} />
                  ))}
                </div>
              ))}
            </div>
          </RescaleText>
        </div>
      </div>
    </LoadingProvider>
  );
}
