"use client";
import React, { useEffect, useState } from "react";
import styles from "./googleCalendar.module.scss";
import { useSearchParams } from "next/navigation";
import classnames from "classnames";
import EventCard from "./EventCard";

type EventData = {
  kind: string;
  id: string;
  summary: string;
  description: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
};

export default function GoogleCalendar(): JSX.Element {
  const [eventsData, setEventsData] = useState<EventData[]>([
    {
      kind: "calendar#event",
      id: "1",
      summary: "Platzhalter lorem ipsum",
      description: "Platzhalter",
      start: { dateTime: "2024-09-23T10:00:00+02:00" },
      end: { dateTime: "2024-09-23T11:00:00+02:00" },
    },
    {
      kind: "calendar#event",
      id: "2",
      summary: "Dolor et jome sit amet consectetur adipiscing elit",
      description: "Platzhalter",
      start: { date: "2024-09-23T09:00:00+02:00" },
      end: { dateTime: "2024-09-23T13:00:00+02:00" },
    },
    {
      kind: "calendar#event",
      id: "3",
      summary: "Platzhalter",
      description: "Platzhalter",
      start: { dateTime: "2024-09-23T10:00:00+02:00" },
      end: { dateTime: "2024-09-23T14:30:00+02:00" },
    },
  ]);

  const searchParams = useSearchParams();

  const color = searchParams.get("color") || "dark";
  const kind = searchParams.get("kind") || "primary";
  const language = searchParams.get("language") || "en-US";

  console.log("color", color, language);

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

  return (
    <div className={classNames}>
      <div>
        {eventsData.map((event, i) => (
          <EventCard key={i} event={event} />
        ))}
      </div>
    </div>
  );
}
