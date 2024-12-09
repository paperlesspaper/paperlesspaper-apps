"use client";
import React, { useEffect, useState } from "react";
import styles from "./googleCalendar.module.scss";
import { useSearchParams } from "next/navigation";
import classnames from "classnames";
import EventCard from "./EventCard";

export default function GoogleCalendar() {
  // Get the current date
  //const today = new Date();

  /*
  window.postMessage(
    {
      cmd: "message",
      data: [
        {
          kind: "calendar#event",
          id: "1",
          summary: '"Einfaches Tanzen" im Neuen Volkshaus Cotta',
          description:
            '<p>Wir bewegen mit Monika unsere Arme, Hüften und Beine zu schönen, rhythmischen Klängen. <br>Mal sanft, mal temperamentvoll, mal in Reihe, mal im Kreis, aber immer mit viel Freude und Lebenslust!</p><p>Komm einfach vorbei, auch ohne Partner*in.</p><p><strong>Kostet?</strong> Wir freuen uns über eine Spende!</p><p><strong>Wann? </strong>montags, 10 bis 11 Uhr </p><p>Meldet Euch an über <a href="mailto:mitmachen@neuesvolkshaus.de">mitmachen@neuesvolkshaus.de</a> oder kommt einfach vorbei!</p>',
          start: { dateTime: "2024-09-23T10:00:00+02:00" },
          end: { dateTime: "2024-09-23T11:00:00+02:00" },
        },
      ],
    },
    "*"
  );
  */

  const [eventsData, setEventsData] = useState([
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
  //const showTime = searchParams.get("showTime") === "true";
  const language = searchParams.get("language") || "en-US";

  console.log("color", color, language);

  // Format the date (you can customize the format as needed)
  /* const formattedDate = today.toLocaleDateString(language, {
    //  weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const weekday = today.toLocaleDateString(language, {
    weekday: "long",
  }); */

  const classNames = classnames(
    {
      [styles.dayCalendar]: true,
      [styles[color]]: color,
      [styles[kind]]: kind,
    },
    color,
    kind
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    // Function to handle incoming messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessage = (event: any) => {
      // Ensure the message is from a trusted source
      /* if (event.origin !== window.origin) {
        return;
      } */

      // Check for the specific command and data structure
      if (event.data && event.data.cmd === "message") {
        console.log("Received data:", event.data.data);
        setEventsData(event.data.data);
        // You can now access event.data.data.hello, which in this case is 'you'
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
