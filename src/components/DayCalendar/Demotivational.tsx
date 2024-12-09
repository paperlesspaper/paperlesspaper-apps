import React from "react";
import { demotivationalQuotesDe } from "./data/demotivational.de";
import { demotivationalQuotesEn } from "./data/demotivational.en";
import { funnyFactsDe } from "./data/funnyFacts.de";
import { funnyFactsEn } from "./data/funnyFacts.en";
import useTranslationFromUrl from "@/i18n/useTranslationFromUrl";

const getDayOfYear = () => {
  const now: Date = new Date();
  const start: Date = new Date(now.getFullYear(), 0, 0);
  const diff: number = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
};

export default function Demotivational({
  kind,
}: {
  kind: "demotivational" | "funny";
}) {
  const dayOfYear = getDayOfYear();
  const { language } = useTranslationFromUrl();

  // Get the quote for the current day, mod by 356 to stay within array bounds
  const quotes =
    kind === "demotivational" && language === "de"
      ? demotivationalQuotesDe
      : kind === "demotivational"
      ? demotivationalQuotesEn
      : language === "de"
      ? funnyFactsDe
      : funnyFactsEn;

  const quoteOfTheDay = quotes[dayOfYear % quotes.length];

  const fontSize = quoteOfTheDay.length > 60 ? "0.65em" : "1em";

  return <span style={{ fontSize }}>{quoteOfTheDay}</span>;
}
