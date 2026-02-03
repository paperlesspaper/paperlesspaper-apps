import { NextRequest, NextResponse } from "next/server";

type ContributionDay = {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

type ContributionStats = {
  contributionsLastYear: number;
  longestStreak: number;
  currentStreak: number;
  mostInADay: number;
  averagePerDay: number;
};

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

function daysBetweenUTC(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

function clampContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count <= 4) return 1;
  if (count <= 9) return 2;
  if (count <= 14) return 3;
  return 4;
}

function computeStats(days: ContributionDay[]): ContributionStats {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  const total = sorted.reduce((sum, d) => sum + d.count, 0);
  const mostInADay = sorted.reduce((max, d) => Math.max(max, d.count), 0);

  // Longest streak (consecutive days with count > 0)
  let longestStreak = 0;
  let currentRun = 0;
  let prevDate: Date | null = null;

  for (const day of sorted) {
    const date = parseUTCDate(day.date);
    const isConsecutive =
      prevDate && daysBetweenUTC(prevDate, date) === 1 ? true : false;

    if (day.count > 0) {
      if (!prevDate || isConsecutive) {
        currentRun += 1;
      } else {
        currentRun = 1;
      }
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 0;
    }

    prevDate = date;
  }

  // Current streak (ending at latest available day)
  let currentStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const day = sorted[i];
    if (day.count > 0) currentStreak += 1;
    else break;
  }

  const averagePerDay = sorted.length > 0 ? total / sorted.length : 0;

  return {
    contributionsLastYear: total,
    longestStreak,
    currentStreak,
    mostInADay,
    averagePerDay,
  };
}

function parseContributionDaysFromHtml(html: string): ContributionDay[] {
  const days: ContributionDay[] = [];

  // Variant A (older): SVG <rect ... data-date="YYYY-MM-DD" data-count="N" ...>
  const rectTagRegex = /<rect\b[^>]*\bdata-date="[^"]+"[^>]*>/g;
  const rectMatches = html.match(rectTagRegex) ?? [];

  for (const rectTag of rectMatches) {
    const dateMatch = rectTag.match(/data-date="([^"]+)"/);
    const countMatch = rectTag.match(/data-count="(\d+)"/);

    if (!dateMatch || !countMatch) continue;
    const date = dateMatch[1];
    const count = Number(countMatch[1]);
    if (!date || Number.isNaN(count)) continue;

    days.push({ date, count, level: clampContributionLevel(count) });
  }

  if (days.length > 0) {
    const byDate = new Map<string, ContributionDay>();
    for (const day of days) byDate.set(day.date, day);
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  // Variant B (current): table cells with data-date + data-level,
  // with count embedded in a <tool-tip for="<td id>">…</tool-tip>.
  // Example tooltip text:
  // - "No contributions on January 26th."
  // - "1 contribution on January 27th."
  // - "12 contributions on January 28th."
  const cellRegex =
    /<td\b[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*\bid="([^"]+)"[^>]*\bdata-level="([0-4])"[^>]*>/g;
  const tooltipRegex =
    /<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g;

  const cellsById = new Map<
    string,
    { date: string; level: 0 | 1 | 2 | 3 | 4 }
  >();
  for (const match of html.matchAll(cellRegex)) {
    const date = match[1];
    const id = match[2];
    const level = Number(match[3]) as 0 | 1 | 2 | 3 | 4;
    if (!date || !id) continue;
    cellsById.set(id, { date, level });
  }

  const countsById = new Map<string, number>();
  for (const match of html.matchAll(tooltipRegex)) {
    const id = match[1];
    const rawText = (match[2] ?? "")
      .replace(/\s+/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    if (!id || !rawText) continue;

    if (/^No contributions\b/i.test(rawText)) {
      countsById.set(id, 0);
      continue;
    }

    const m = rawText.match(/(\d+)\s+contribution(s)?\b/i);
    if (m) countsById.set(id, Number(m[1]));
  }

  for (const [id, cell] of cellsById.entries()) {
    const count = countsById.get(id) ?? 0;
    days.push({ date: cell.date, count, level: cell.level });
  }

  const byDate = new Map<string, ContributionDay>();
  for (const day of days) byDate.set(day.date, day);
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchGitHubContributionsHtml(username: string): Promise<string> {
  const url = `https://github.com/users/${encodeURIComponent(
    username,
  )}/contributions`;

  const response = await fetch(url, {
    headers: {
      // GitHub sometimes behaves differently without a UA.
      "User-Agent": "paperlesspaper-apps",
      Accept: "text/html",
    },
    // Avoid Next.js caching for frequently-updating data.
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `GitHub request failed (${response.status}): ${text.slice(0, 200)}`,
    );
  }

  return response.text();
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json(
      { error: "Please provide a username" },
      { status: 400 },
    );
  }

  try {
    const html = await fetchGitHubContributionsHtml(username);
    const days = parseContributionDaysFromHtml(html);

    if (days.length === 0) {
      return NextResponse.json(
        {
          error:
            "No contribution data found. The username may be invalid, or GitHub returned an unexpected response.",
        },
        { status: 404 },
      );
    }

    const stats = computeStats(days);

    const from = days[0]?.date;
    const to = days[days.length - 1]?.date;

    // Derive week count for easier rendering.
    const minDate = parseUTCDate(from);
    const maxDate = parseUTCDate(to);
    const startSunday = new Date(minDate);
    startSunday.setUTCDate(minDate.getUTCDate() - minDate.getUTCDay());
    const endSunday = new Date(maxDate);
    endSunday.setUTCDate(maxDate.getUTCDate() - maxDate.getUTCDay());
    const weeks = Math.floor(daysBetweenUTC(startSunday, endSunday) / 7) + 1;

    // Also return today's date (UTC) to let client display “as of”.
    const todayUTC = formatUTCDate(new Date());

    return NextResponse.json(
      {
        username,
        range: { from, to, weeks, days: days.length, todayUTC },
        stats,
        days,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching GitHub commit graph:", error);
    return NextResponse.json(
      { error: "Server error: unable to fetch GitHub contribution data" },
      { status: 500 },
    );
  }
}
