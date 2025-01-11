/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import styles from "./rss.module.scss";
import { useSearchParams } from "next/navigation";
import classnames from "classnames";

const stripHtmlTags = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

interface RssItem {
  title: string[];
  pubDate?: string[];
  updated?: string[];
  content?: { _: string }[];
  description?: string[];
}

interface RssData {
  feed?: {
    entry?: RssItem[];
  };
  rss?: {
    channel?: {
      item?: RssItem[];
    }[];
  };
}

export default function Day(): JSX.Element | null {
  const searchParams = useSearchParams();

  const feed = searchParams.get("feed") as string;
  const color = searchParams.get("color") || "dark";
  const kind = searchParams.get("kind") || "primary";

  const classNames = classnames({
    [styles.rssFeed]: true,
    [styles[color]]: color,
    [styles[kind]]: kind,
  });

  const [rssData, setRssData] = useState<RssData | null>(null);

  const getRss = async (): Promise<void> => {
    const response = await fetch(`/api/rss?feed=${encodeURIComponent(feed)}`);
    const data = await response.json();
    setRssData(data);
  };

  useEffect(() => {
    getRss();
  }, []);

  if (!rssData) {
    return null;
  }

  const items: RssItem[] =
    rssData?.feed?.entry || rssData?.rss?.channel?.[0]?.item || [];

  return (
    <div className={classNames}>
      {items.length > 0 ? (
        <div className={styles.content}>
          {items.map((item, index) => {
            const itemClasses = classnames({
              [styles.item]: true,
            });

            const content = item?.content?.[0]?._
              ? stripHtmlTags(item.content[0]._)
              : item.description?.[0] || "";

            return (
              <section key={index} className={itemClasses}>
                <h2>{item.title[0]}</h2>
                <p className={styles.description}>
                  <span className={styles.date}>
                    {item.pubDate?.[0] || item.updated?.[0]
                      ? new Date(
                          (item.pubDate?.[0] || item.updated?.[0]) as string
                        ).toLocaleString([], {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "No publication date."}{" "}
                    –{" "}
                  </span>
                  {content}
                </p>
              </section>
            );
          })}
        </div>
      ) : (
        <p>Failed loading rss feed.</p>
      )}
    </div>
  );
}
