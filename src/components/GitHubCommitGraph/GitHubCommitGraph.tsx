"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./GitHubCommitGraph.module.scss";
import RescaleText from "../RescaleText/RescaleText";
import { LoadingProvider, useLoading } from "@/helpers/Loading";

type ContributionDay = {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

type ApiResponse = {
  username: string;
  range: {
    from: string;
    to: string;
    weeks: number;
    days: number;
    todayUTC: string;
  };
  stats: {
    contributionsLastYear: number;
    longestStreak: number;
    currentStreak: number;
    mostInADay: number;
    averagePerDay: number;
  };
  days: ContributionDay[];
};

type RenderPayload = {
  settings?: Record<string, unknown>;
  pluginSettings?: Record<string, unknown>;
  nativeSettings?: Record<string, unknown>;
  device?: Record<string, unknown>;
  app?: Record<string, unknown>;
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    value,
  );
}

function formatFloat(value: number): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function parseUTCDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatUTCDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildGrid(days: ContributionDay[]) {
  const byDate = new Map<string, ContributionDay>();
  for (const day of days) byDate.set(day.date, day);

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const from = sorted[0]?.date;
  const to = sorted[sorted.length - 1]?.date;

  if (!from || !to) {
    return { columns: [] as ContributionDay[][], from: "", to: "" };
  }

  const minDate = parseUTCDate(from);
  const maxDate = parseUTCDate(to);

  const start = new Date(minDate);
  start.setUTCDate(minDate.getUTCDate() - minDate.getUTCDay()); // Sunday

  const end = new Date(maxDate);
  end.setUTCDate(maxDate.getUTCDate() - maxDate.getUTCDay());

  const columns: ContributionDay[][] = [];
  const cursor = new Date(start);

  while (cursor.getTime() <= end.getTime()) {
    const col: ContributionDay[] = [];
    for (let row = 0; row < 7; row += 1) {
      const date = formatUTCDate(cursor);
      const existing = byDate.get(date);
      col.push(
        existing ?? {
          date,
          count: 0,
          level: 0,
        },
      );
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    columns.push(col);
  }

  return { columns, from, to };
}

function GitHubCommitGraph({ username }: { username?: string }) {
  const searchParams = useSearchParams();

  const activeUsername = username ?? searchParams.get("username");

  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setLoadingGitHub = useLoading({ id: "github-initial-loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!activeUsername) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/github-commit-graph?username=${encodeURIComponent(
            activeUsername,
          )}`,
          { cache: "no-store" },
        );

        const json = (await response.json()) as ApiResponse | { error: string };

        if (!response.ok) {
          const message = "error" in json ? json.error : "Request failed";
          throw new Error(message);
        }

        if (!cancelled) setData(json as ApiResponse);
        setLoadingGitHub(false);
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [activeUsername, setLoadingGitHub]);

  const grid = useMemo(() => (data ? buildGrid(data.days) : null), [data]);

  return (
    <RescaleText id="github-commit-graph" maxFontSize={90} checkHeight>
      <div className={styles.root}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <div className={styles.title}>
                GitHub Commits <strong>{activeUsername}</strong>
              </div>
              <div className={styles.subTitle}>
                range {data?.range?.from} to {data?.range?.to}
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            {loading && <div className={styles.loading}>Loading…</div>}

            {error && <div className={styles.error}>{error}</div>}

            {data && (
              <>
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>
                      Contributions
                      <br /> last year
                    </div>
                    <div className={styles.statValue}>
                      {formatNumber(data.stats.contributionsLastYear)}
                    </div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>
                      Longest
                      <br /> streak
                    </div>
                    <div className={styles.statValue}>
                      {formatNumber(data.stats.longestStreak)}
                    </div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>
                      Current
                      <br /> streak
                    </div>
                    <div className={styles.statValue}>
                      {formatNumber(data.stats.currentStreak)}
                    </div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>
                      Most in
                      <br /> a day
                    </div>
                    <div className={styles.statValue}>
                      {formatNumber(data.stats.mostInADay)}
                    </div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>
                      Average
                      <br /> per day
                    </div>
                    <div className={styles.statValue}>
                      {formatFloat(data.stats.averagePerDay)}
                    </div>
                  </div>
                </div>

                {grid && (
                  <div className={styles.graphWrap}>
                    <div
                      className={styles.graph}
                      style={
                        {
                          "--weeks": `${grid.columns.length}`,
                        } as React.CSSProperties
                      }
                      aria-label="GitHub contribution graph"
                    >
                      {grid.columns.map((col, colIndex) => (
                        <React.Fragment key={`c-${colIndex}`}>
                          {col.map((cell, rowIndex) => {
                            const levelClass =
                              cell.level === 0
                                ? styles.level0
                                : cell.level === 1
                                  ? styles.level1
                                  : cell.level === 2
                                    ? styles.level2
                                    : cell.level === 3
                                      ? styles.level3
                                      : styles.level4;

                            return (
                              <div
                                key={`c-${colIndex}-r-${rowIndex}`}
                                className={`${styles.cell} ${levelClass}`}
                                title={`${cell.date}: ${cell.count} contributions`}
                                role="img"
                                aria-label={`${cell.date}: ${cell.count} contributions`}
                              />
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!loading && !error && !data && (
              <div className={styles.loading}>
                Enter a username and click “Load”.
              </div>
            )}
          </div>
        </div>
      </div>
    </RescaleText>
  );
}

export default function GitHubCommitGraphWrapper() {
  return (
    <LoadingProvider>
      <GitHubCommitGraph />
    </LoadingProvider>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function GitHubCommitGraphWithUsername() {
  const [payload, setPayload] = React.useState<RenderPayload | null>(null);

  React.useEffect(() => {
    console.log("GitHubCommitGraphWithUsername mounted");
    const onMessage = (event: MessageEvent) => {
      console.log("GitHubCommitGraphWithUsername received message", event);
      const data: unknown = event.data;
      if (!isRecord(data)) return;

      console.log("GitHubCommitGraphWithUsername received message", data);

      // Legacy renderer format
      if (data.cmd === "message" && isRecord(data.data)) {
        setPayload(data.data as RenderPayload);
        return;
      }

      // New envelope (optional)
      if (
        data.source === "wirewire-app" &&
        data.type === "INIT" &&
        isRecord(data.payload)
      ) {
        setPayload(data.payload as RenderPayload);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const usernameFromSettings =
    typeof payload?.pluginSettings?.username === "string"
      ? payload?.pluginSettings?.username.trim()
      : typeof payload?.settings?.username === "string"
        ? payload?.settings?.username.trim()
        : "";

  // const usernameFromUrl = React.useMemo(() => getUsernameFromLocation(), []);

  const username = usernameFromSettings; //  || usernameFromUrl;

  return (
    <LoadingProvider>
      <GitHubCommitGraph username={username} />
    </LoadingProvider>
  );
}
