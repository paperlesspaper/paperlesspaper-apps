"use client";
import React, { useEffect, useState } from "react";

import { LoadingProvider } from "@/helpers/Loading";
import styles from "./googleKeep.module.scss";
import { useSearchParams } from "next/navigation";
import classnames from "classnames";
import RescaleText from "@/components/RescaleText/RescaleText";

type KeepNote = {
  id: string;
  title: string;
  text: string;
  color?: string;
  pinned?: boolean;
};

export function GoogleKeep(): JSX.Element {
  const [notes, setNotes] = useState<KeepNote[]>([
    {
      id: "1",
      title: "Sample Note",
      text: "This is a placeholder note.",
      color: "#fffde7",
      pinned: true,
    },
    {
      id: "2",
      title: "Another Note",
      text: "Google Keep integration example.",
      color: "#e3f2fd",
      pinned: false,
    },
  ]);

  const searchParams = useSearchParams();
  const color = searchParams.get("color") || "dark";
  const kind = searchParams.get("kind") || "primary";
  const language = searchParams.get("language") || "en-US";

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
      if (event.data && event.data.cmd === "keep") {
        setNotes(event.data.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className={classNames}>
      <RescaleText id="googlekeep" maxFontSize={70} checkHeight>
        <div>
          {notes.map((note) => (
            <div
              key={note.id}
              className={styles.note}
              // style={{ background: note.color || "#fff" }}
            >
              <div className={styles.title}>
                {note.pinned && <span className={styles.pinned}>📌</span>}
                {note.title}
              </div>
              <div className={styles.text}>{note.text}</div>
            </div>
          ))}
        </div>
      </RescaleText>
    </div>
  );
}

export default function Wikipedia() {
  return (
    <LoadingProvider>
      <GoogleKeep />
    </LoadingProvider>
  );
}
