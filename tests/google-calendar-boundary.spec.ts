import { expect, test, type Page } from "@playwright/test";

const fixedNowIso = "2025-12-05T08:30:00.000Z";

const calendarBoundaryEvents = [
  {
    kind: "calendar#event",
    id: "berlin-morning",
    summary: "Berlin morning sync",
    start: { dateTime: "2025-12-05T09:00:00+01:00", timeZone: "Europe/Berlin" },
    end: { dateTime: "2025-12-05T09:30:00+01:00", timeZone: "Europe/Berlin" },
  },
  {
    kind: "calendar#event",
    id: "berlin-next-day-midnight",
    summary: "Tomorrow after midnight",
    start: { dateTime: "2025-12-06T00:30:00+01:00", timeZone: "Europe/Berlin" },
    end: { dateTime: "2025-12-06T01:00:00+01:00", timeZone: "Europe/Berlin" },
  },
  {
    kind: "calendar#event",
    id: "offset-next-day-midnight",
    summary: "Offset-only tomorrow",
    start: { dateTime: "2025-12-06T00:45:00+01:00" },
    end: { dateTime: "2025-12-06T01:15:00+01:00" },
  },
  {
    id: "tomorrow-noon",
    summary: "Tomorrow in both timezones",
    start: { dateTime: "2025-12-06T12:00:00+01:00", timeZone: "Europe/Berlin" },
    end: { dateTime: "2025-12-06T13:00:00+01:00", timeZone: "Europe/Berlin" },
  },
];

const cachedInitEvents = [
  {
    kind: "calendar#event",
    id: "primary-late",
    summary: "Primary late",
    start: { dateTime: "2025-12-05T16:00:00+01:00", timeZone: "Europe/Berlin" },
    end: { dateTime: "2025-12-05T16:30:00+01:00", timeZone: "Europe/Berlin" },
  },
  {
    kind: "calendar#event",
    id: "work-early",
    summary: "Work early",
    start: { dateTime: "2025-12-05T09:00:00+01:00", timeZone: "Europe/Berlin" },
    end: { dateTime: "2025-12-05T09:30:00+01:00", timeZone: "Europe/Berlin" },
  },
  {
    kind: "calendar#event",
    id: "primary-mid",
    summary: "Primary mid-morning",
    start: { dateTime: "2025-12-05T10:00:00+01:00", timeZone: "Europe/Berlin" },
    end: { dateTime: "2025-12-05T10:30:00+01:00", timeZone: "Europe/Berlin" },
  },
];

test.use({ timezoneId: "UTC" });

test.beforeEach(async ({ page }) => {
  await page.route("**/api/translations**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ docs: [] }),
    });
  });

  await page.addInitScript((isoNow) => {
    const fixed = new Date(isoNow).getTime();
    const RealDate = Date;

    function MockDate(
      this: Date,
      ...args: [string | number | Date] | number[]
    ) {
      if (this instanceof MockDate) {
        if (args.length === 0) {
          return new RealDate(fixed);
        }

        if (args.length === 1) {
          return new RealDate(args[0]);
        }

        return new RealDate(
          args[0] as number,
          args[1] as number,
          args[2] as number | undefined,
          args[3] as number | undefined,
          args[4] as number | undefined,
          args[5] as number | undefined,
          args[6] as number | undefined,
        );
      }

      return new RealDate(fixed).toString();
    }

    MockDate.now = () => fixed;
    MockDate.UTC = RealDate.UTC;
    MockDate.parse = RealDate.parse;
    MockDate.prototype = RealDate.prototype;
    window.Date = MockDate as DateConstructor;
  }, fixedNowIso);
});

test("filters Google Calendar events by their event-local day", async ({
  page,
}, testInfo) => {
  await page.goto(
    "/google-calendar?color=dark&dayRange=1&maxEvents=6&language=en-US",
  );
  await expect(page.locator("#website-has-loading-element")).toBeAttached();

  await postGoogleCalendarEvents(page);

  await expect(page.getByText("Berlin morning sync")).toBeVisible();
  await expect(page.getByText("Tomorrow after midnight")).toHaveCount(0);
  await expect(page.getByText("Offset-only tomorrow")).toHaveCount(0);
  await expect(page.locator("#website-has-loaded")).toBeAttached({
    timeout: 3_000,
  });

  const screenshotPath = testInfo.outputPath(
    `google-calendar-boundary-${testInfo.project.name}.png`,
  );
  await page.screenshot({
    animations: "disabled",
    caret: "hide",
    fullPage: false,
    path: screenshotPath,
  });

  await testInfo.attach("google-calendar-boundary", {
    path: screenshotPath,
    contentType: "image/png",
  });
});

test("renders cached calendarData from INIT messages without a second payload", async ({
  page,
}) => {
  await page.goto(
    "/google-calendar?color=dark&dayRange=1&maxEvents=2&language=en-US",
  );
  await expect(page.locator("#website-has-loading-element")).toBeAttached();

  await page.evaluate((events) => {
    window.postMessage(
      {
        cmd: "message",
        type: "INIT",
        data: { meta: { calendarData: { events } } },
      },
      "*",
    );
  }, cachedInitEvents);

  await expect(page.getByText("Work early")).toBeVisible();
  await expect(page.getByText("Primary mid-morning")).toBeVisible();
  await expect(page.getByText("Primary late")).toHaveCount(0);

  const renderedTitles = await page.locator("h2").allTextContents();
  expect(renderedTitles.slice(0, 2)).toEqual([
    "Work early",
    "Primary mid-morning",
  ]);
});

test("top header restricts the default range to today in the display timezone", async ({ page }) => {
  await page.goto("/google-calendar?highlightToday=true&language=en-US");
  await expect(page.locator("#website-has-loading-element")).toBeAttached();
  await postGoogleCalendarEvents(page);

  await expect(page.locator("time").first()).toHaveText("December 5");
  await expect(page.getByText("Berlin morning sync")).toBeVisible();
  // The display is UTC: 00:30 in Berlin is still 23:30 today on this display.
  await expect(page.getByText("Tomorrow after midnight")).toBeVisible();
  await expect(page.getByText("Offset-only tomorrow")).toBeVisible();
  await expect(page.getByText("Tomorrow in both timezones")).toHaveCount(0);
});

test("top header shows an empty day when only future all-day events exist", async ({ page }) => {
  await page.goto("/google-calendar?highlightToday=1&dayRange=30&language=en-US");
  await expect(page.locator("#website-has-loading-element")).toBeAttached();
  await page.evaluate(() => {
    window.postMessage({ cmd: "message", data: { events: [{
      id: "tomorrow-all-day", summary: "Tomorrow all day",
      start: { date: "2025-12-06" }, end: { date: "2025-12-07" },
    }] } }, "*");
  });
  await expect(page.getByText("No events to show")).toBeVisible();
  await expect(page.getByText("Tomorrow all day")).toHaveCount(0);
});

test("without the top header the configured multi-day range remains visible", async ({ page }) => {
  await page.goto("/google-calendar?highlightToday=false&dayRange=3&language=en-US");
  await expect(page.locator("#website-has-loading-element")).toBeAttached();
  await postGoogleCalendarEvents(page);

  await expect(page.getByText("Berlin morning sync")).toBeVisible();
  await expect(page.getByText("Tomorrow after midnight")).toBeVisible();
  await expect(page.getByText("Offset-only tomorrow")).toBeVisible();
});

async function postGoogleCalendarEvents(page: Page) {
  await page.evaluate((events) => {
    window.postMessage(
      { cmd: "message", type: "DATA", data: { calendarData: { events } } },
      "*",
    );
  }, calendarBoundaryEvents);
}
