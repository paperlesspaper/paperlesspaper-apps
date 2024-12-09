/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./rss.module.scss";
import { useSearchParams } from "next/navigation";
import classnames from "classnames";

const stripHtmlTags = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

export default function Day() {
  // Get the current date
  //const today = new Date();

  const searchParams = useSearchParams();

  const feed = searchParams.get("feed") as string;
  const color = searchParams.get("color") || "dark";
  const kind = searchParams.get("kind") || "primary";
  // const language = searchParams.get("language") || "en-US";

  const [hiddenElements, setHiddenElements] = useState<any>([]);

  const containerRefs = useRef<any>([]);

  const classNames = classnames({
    [styles.rssFeed]: true,
    [styles[color]]: color,
    [styles[kind]]: kind,
  });

  const [rssData, setRssData] = useState<any>(null);

  const getRss = async () => {
    const response = await fetch(`/api/rss?feed=${encodeURIComponent(feed)}`);
    const data = await response.json();
    setRssData(data);
  };

  useEffect(() => {
    getRss();
  }, []);

  useEffect(() => {
    if (rssData) {
      const newHiddenElements: any = [];
      containerRefs.current.forEach((ref: any, i: number) => {
        if (ref) {
          if (ref.getBoundingClientRect().bottom > window.innerHeight) {
            console.log("Content is overflowing", ref);

            newHiddenElements.push(i);
          }
        }
      });

      if (newHiddenElements.length > 0) {
        setHiddenElements(newHiddenElements);
      }
    }
  }, [rssData]);

  if (!rssData) {
    return null;
  }

  const items = rssData?.feed?.entry || rssData?.rss?.channel?.[0]?.item || [];

  return (
    <div className={classNames}>
      {items.length > 0 ? (
        <div className={styles.content}>
          {items.map((item: any, index: number) => {
            const itemClasses = classnames({
              [styles.item]: true,
              [styles.visible]: !hiddenElements.includes(index),
              [styles.hidden]: hiddenElements.includes(index),
            });
            const Element = hiddenElements.includes(index) ? "section" : "div";

            const content = item?.content?.[0]._
              ? stripHtmlTags(item.content[0]._)
              : item.description && item.description[0];

            console.log("content", content);
            return (
              <Element
                key={index}
                className={itemClasses}
                ref={(el) => (containerRefs.current[index] = el) as any}
              >
                <h2>{item.title[0]}</h2>
                <p className={styles.description}>
                  <span className={styles.date}>
                    {item.pubDate || item.updated[0]
                      ? new Date(
                          item?.pubDate?.[0] ? item.pubDate[0] : item.updated[0]
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
              </Element>
            );
          })}
        </div>
      ) : (
        <p>Failed loading rss feed.</p>
      )}
    </div>
  );
}
