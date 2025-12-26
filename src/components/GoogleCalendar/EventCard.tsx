import { Trans } from "react-i18next";
import styles from "./eventCard.module.scss";
import useTranslationFromUrl from "@/i18n/useTranslationFromUrl";
import type { EventData } from "./GoogleCalendar";

type EventCardProps = {
  event: EventData;
  language: string;
};

const EventCard = ({ event, language }: EventCardProps) => {
  const { summary, /* description, */ start, end } = event;
  const timeZone = start.timeZone || end.timeZone;

  const formatTime = (dateTime?: string) => {
    if (!dateTime) {
      return "";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    };
    return new Date(dateTime).toLocaleTimeString(language, options);
  };

  useTranslationFromUrl();

  return (
    <div className={styles.card}>
      <p className={styles.time}>
        {start.date ? (
          <Trans>All day</Trans>
        ) : (
          <>
            {formatTime(start.dateTime)} - {formatTime(end.dateTime)}
          </>
        )}
      </p>
      <h2 className={styles.title}>{summary}</h2>
      {/* <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: description.slice(0, 100) }}
      /> */}
    </div>
  );
};

export default EventCard;
