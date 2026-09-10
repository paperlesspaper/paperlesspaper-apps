import { expect, test, type Page } from "@playwright/test";

const fixedNowIso = "2025-12-05T08:30:00.000Z";

const transparentPixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

const svgImage = (label: string, background: string, foreground = "#ffffff") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <rect width="1200" height="800" fill="${background}"/>
    <circle cx="930" cy="210" r="150" fill="${foreground}" opacity="0.18"/>
    <circle cx="230" cy="610" r="210" fill="${foreground}" opacity="0.12"/>
    <text x="80" y="720" font-family="Arial, sans-serif" font-size="74" font-weight="700" fill="${foreground}">${label}</text>
  </svg>`;

const svgWeatherIcon = (label: string, stroke = "#111111", fill = "none") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
    <rect width="160" height="160" fill="transparent"/>
    <circle cx="58" cy="58" r="25" fill="${fill}" stroke="${stroke}" stroke-width="11"/>
    <path d="M48 105h62a24 24 0 0 0 0-48 34 34 0 0 0-65 13 18 18 0 0 0 3 35Z" fill="${fill}" stroke="${stroke}" stroke-width="11" stroke-linejoin="round"/>
    <text x="80" y="146" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="${stroke}">${label}</text>
  </svg>`;

const weatherCurrent = {
  name: "Berlin",
  dt: 1_764_925_200,
  main: { temp: 7.4, humidity: 82 },
  weather: [{ description: "light rain", icon: "10d" }],
  wind: { speed: 4.2 },
};

const weatherForecast = {
  list: Array.from({ length: 16 }, (_, index) => {
    const timestamp = Date.UTC(2025, 11, 5, 6 + index * 3) / 1000;
    const icons = ["10d", "04d", "01d", "02d", "13d", "03d"];
    const descriptions = [
      "light rain",
      "cloudy",
      "sunny",
      "partly cloudy",
      "snow showers",
      "overcast",
    ];

    return {
      dt: timestamp,
      dt_txt: new Date(timestamp * 1000).toISOString().replace("T", " ").slice(0, 19),
      main: {
        temp: 5 + (index % 6) * 1.8,
        humidity: 58 + (index % 5) * 7,
      },
      weather: [
        {
          description: descriptions[index % descriptions.length],
          icon: icons[index % icons.length],
        },
      ],
    };
  }),
};

const calendarEvents = [
  {
    kind: "calendar#event",
    id: "morning-focus",
    summary: "Focus block",
    start: { dateTime: "2025-12-05T09:00:00+01:00", timeZone: "Europe/Berlin" },
    end: { dateTime: "2025-12-05T11:00:00+01:00", timeZone: "Europe/Berlin" },
  },
  {
    kind: "calendar#event",
    id: "design-review",
    summary: "Design review",
    start: { dateTime: "2025-12-05T13:30:00+01:00", timeZone: "Europe/Berlin" },
    end: { dateTime: "2025-12-05T14:15:00+01:00", timeZone: "Europe/Berlin" },
  },
  {
    kind: "calendar#event",
    id: "family-dinner",
    summary: "Family dinner",
    start: { dateTime: "2025-12-06T18:00:00+01:00", timeZone: "Europe/Berlin" },
    end: { dateTime: "2025-12-06T20:00:00+01:00", timeZone: "Europe/Berlin" },
  },
];

const pharmacies = [
  {
    id: "apotheke-1",
    name: "Spree Apotheke",
    chamber: "BE",
    distanceKm: 0.8,
    address: { street: "Warschauer Str. 12", postalCode: "10243", city: "Berlin" },
    contact: { phones: ["030 1234567"], faxNumbers: [], emails: [] },
    coordinates: { lat: 52.505, lon: 13.45 },
    serviceWindow: {
      startDate: "05.12.2025",
      startTime: "08:00",
      endDate: "06.12.2025",
      endTime: "08:00",
    },
  },
  {
    id: "apotheke-2",
    name: "Kiez Apotheke",
    chamber: "BE",
    distanceKm: 2.6,
    address: { street: "Boxhagener Platz 4", postalCode: "10245", city: "Berlin" },
    contact: { phones: ["030 7654321"], faxNumbers: [], emails: [] },
    coordinates: { lat: 52.51, lon: 13.46 },
    serviceWindow: {
      startDate: "05.12.2025",
      startTime: "09:00",
      endDate: "06.12.2025",
      endTime: "09:00",
    },
  },
];

const githubDays = Array.from({ length: 91 }, (_, index) => {
  const date = new Date(Date.UTC(2025, 8, 6 + index));
  const count = index % 9 === 0 ? 12 : index % 5 === 0 ? 6 : index % 3;
  const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;

  return {
    date: date.toISOString().slice(0, 10),
    count,
    level,
  };
});

type ScreenshotVariant = {
  id: string;
  title: string;
  path: string;
  ready?: (page: Page) => Promise<void>;
};

const postGoogleCalendarEvents = async (page: Page) => {
  await page.evaluate((events) => {
    window.postMessage(
      { cmd: "message", type: "DATA", data: { calendarData: { events } } },
      "*",
    );
  }, calendarEvents);
};

const postOpenIntegrationPayload = async (page: Page, theme: "dark" | "light") => {
  await page.evaluate((payload) => {
    window.postMessage({ cmd: "message", data: payload }, "*");
  }, {
    settings: {
      title: theme === "dark" ? "Night dashboard" : "Morning dashboard",
      theme,
      showClock: true,
    },
    device: { deviceId: "paper-frame-01", kind: "e-paper" },
  });
};

const postGithubPayload = async (page: Page) => {
  await page.evaluate(() => {
    window.postMessage(
      {
        cmd: "message",
        data: {
          pluginSettings: { username: "wirewire" },
          device: { deviceId: "paper-frame-01" },
        },
      },
      "*",
    );
  });
};

const waitForText = (text: string | RegExp) => async (page: Page) => {
  await expect(page.getByText(text).first()).toBeVisible({ timeout: 10_000 });
};

const variants: ScreenshotVariant[] = [
  { id: "calendar-date-dark", title: "calendar date dark", path: "/calendar?color=dark&kind=primary&language=en-US" },
  { id: "calendar-funny-light", title: "calendar funny light", path: "/calendar?color=light&kind=funny&language=en-US" },
  { id: "calendar-demotivational-time", title: "calendar demotivational time", path: "/calendar?color=dark&kind=demotivational&language=de-DE&showTime=true" },
  { id: "babybirth-week-12", title: "baby birth week 12", path: "/babybirth?color=light&birthdate=2026-06-26&language=en" },
  { id: "babybirth-week-38", title: "baby birth week 38", path: "/babybirth?color=dark&birthdate=2025-12-19&language=de" },
  { id: "days-left", title: "days left", path: "/days-left?color=dark&from=2025-11-01&date=2026-01-01&description=Launch%20countdown&accent=green" },
  { id: "days-since", title: "days since", path: "/days-since?color=light&from=2025-10-01&date=2025-12-05&description=Days%20since%20kickoff&accent=blue" },
  {
    id: "weather-summary",
    title: "weather summary",
    path: "/weather?color=light&kind=forecast-summary&location=Berlin&language=en-US&displayLastUpdated=true",
    ready: waitForText("Berlin"),
  },
  {
    id: "weather-current",
    title: "weather current",
    path: "/weather?color=dark&kind=current&location=Berlin&language=en-US",
    ready: waitForText("Berlin"),
  },
  {
    id: "weather-forecast-light-icons",
    title: "weather forecast light icons",
    path: "/weather?color=dark&kind=forecast&location=Berlin&language=en-US&iconset=light",
    ready: waitForText("cloudy"),
  },
  {
    id: "weather-forecast-normal-icons",
    title: "weather forecast normal icons",
    path: "/weather?color=light&kind=forecast&location=Berlin&language=en-US&iconset=normal",
    ready: waitForText("cloudy"),
  },
  {
    id: "weather-forecast-qweather-icons",
    title: "weather forecast qweather icons",
    path: "/weather?color=dark&kind=forecast&location=Berlin&language=en-US&iconset=qweather",
    ready: waitForText("cloudy"),
  },
  {
    id: "weather-forecast-qweather-line-icons",
    title: "weather forecast qweather line icons",
    path: "/weather?color=light&kind=forecast&location=Berlin&language=en-US&iconset=qweather-line",
    ready: waitForText("cloudy"),
  },
  {
    id: "weather-forecast-glyphs-poly-icons",
    title: "weather forecast glyphs poly icons",
    path: "/weather?color=dark&kind=forecast&location=Berlin&language=en-US&iconset=glyphs-poly",
    ready: waitForText("cloudy"),
  },
  {
    id: "weather-forecast-noto-emoji-icons",
    title: "weather forecast noto emoji icons",
    path: "/weather?color=light&kind=forecast&location=Berlin&language=en-US&iconset=noto-emoji",
    ready: waitForText("cloudy"),
  },
  {
    id: "weather-forecast-openweather-icons",
    title: "weather forecast openweather icons",
    path: "/weather?color=dark&kind=forecast&location=Berlin&language=en-US&iconset=openweather",
    ready: waitForText("cloudy"),
  },
  {
    id: "google-calendar-agenda",
    title: "google calendar agenda",
    path: "/google-calendar?color=dark&dayRange=2&maxEvents=6&language=en-US",
    ready: postGoogleCalendarEvents,
  },
  {
    id: "google-calendar-highlight",
    title: "google calendar today highlight",
    path: "/google-calendar?color=light&dayRange=2&maxEvents=6&highlightToday=true&language=de-DE",
    ready: postGoogleCalendarEvents,
  },
  { id: "rss-dark", title: "rss dark", path: "/rss?feed=https%3A%2F%2Fexample.test%2Ffeed.xml&color=dark" },
  { id: "rss-light", title: "rss light", path: "/rss?feed=https%3A%2F%2Fexample.test%2Ffeed.xml&color=light" },
  { id: "wikipedia-featured", title: "wikipedia featured", path: "/wikipedia?color=dark&language=en&limitCharacters=420" },
  { id: "wikipedia-on-this-day", title: "wikipedia on this day", path: "/wikipedia?color=light&kind=onthisday&language=en&limit=5" },
  { id: "apotheken-primary", title: "apotheken primary", path: "/apothekennotdienst?kind=primary&radius=5&limit=4&day=today&language=de-DE" },
  { id: "apotheken-compact-tomorrow", title: "apotheken compact tomorrow", path: "/apothekennotdienst?kind=compact&radius=12&limit=2&day=tomorrow&language=de-DE" },
  { id: "upcoming-movies-dark", title: "upcoming movies dark", path: "/upcomingmovies?color=dark&count=4&language=en" },
  { id: "upcoming-movies-light", title: "upcoming movies light", path: "/upcomingmovies?color=light&count=2&language=de" },
  { id: "sun", title: "sun", path: "/sun" },
  { id: "apple-photos-cover", title: "apple photos cover", path: "/apple-photos-random?token=test-token&fit=cover&showCaption=true&color=dark" },
  { id: "apple-photos-contain", title: "apple photos contain", path: "/apple-photos-random?token=test-token&fit=contain&showCaption=true&color=light" },
  { id: "github-commit-graph", title: "github commit graph", path: "/github-commit-graph?username=wirewire" },
  {
    id: "github-commit-graph-render",
    title: "github commit graph render payload",
    path: "/github-commit-graph/render",
    ready: postGithubPayload,
  },
  {
    id: "open-integration-render-dark",
    title: "open integration render dark",
    path: "/open-integration-example/render",
    ready: (page) => postOpenIntegrationPayload(page, "dark"),
  },
  {
    id: "open-integration-render-light",
    title: "open integration render light",
    path: "/open-integration-example/render",
    ready: (page) => postOpenIntegrationPayload(page, "light"),
  },
  { id: "emptywebsite", title: "empty website", path: "/emptywebsite" },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(`
    (() => {
      const fixed = new Date("${fixedNowIso}").getTime();
      const RealDate = Date;

      function MockDate(...args) {
        if (this instanceof MockDate) {
          return new RealDate(...(args.length ? args : [fixed]));
        }

        return RealDate();
      }

      MockDate.now = () => fixed;
      MockDate.UTC = RealDate.UTC;
      MockDate.parse = RealDate.parse;
      MockDate.prototype = RealDate.prototype;
      window.Date = MockDate;
    })();
  `);

  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === "/api/weather") {
      const kind = url.searchParams.get("kind");
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(kind === "forecast" ? weatherForecast : weatherCurrent),
      });
      return;
    }

    if (
      url.hostname === "api.iconify.design" ||
      url.hostname === "cdn.jsdelivr.net" ||
      url.hostname === "openweathermap.org"
    ) {
      const iconName = url.pathname.split("/").pop()?.replace(/\.(svg|png)$/i, "") || "icon";
      const isOpenWeather = url.hostname === "openweathermap.org";
      await route.fulfill({
        contentType: "image/svg+xml",
        body: svgWeatherIcon(
          isOpenWeather ? "OWM" : iconName.slice(0, 10),
          isOpenWeather ? "#222222" : "#111111",
          isOpenWeather ? "#f4f4f4" : "none",
        ),
      });
      return;
    }

    if (url.pathname === "/api/translations") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ docs: [] }),
      });
      return;
    }

    if (url.pathname === "/api/translations/create-missing") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
      return;
    }

    if (url.pathname === "/api/rss") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          rss: {
            channel: [
              {
                item: [
                  {
                    title: ["Product notes for December"],
                    pubDate: ["Fri, 05 Dec 2025 08:00:00 GMT"],
                    description: ["A compact release recap with fixes, polish, and better rendering."],
                  },
                  {
                    title: ["Integration spotlight"],
                    pubDate: ["Thu, 04 Dec 2025 17:30:00 GMT"],
                    description: ["How teams are using lightweight displays for ambient status."],
                  },
                ],
              },
            ],
          },
        }),
      });
      return;
    }

    if (url.hostname.endsWith("wikipedia.org") && url.pathname.includes("/api/rest_v1/feed/featured/")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          image: { title: "Featured image" },
          tfa: {
            normalizedtitle: "Ada Lovelace",
            extract:
              "Ada Lovelace was an English mathematician and writer, chiefly known for her work on Charles Babbage's proposed mechanical general-purpose computer.",
            thumbnail: { source: "https://assets.test/wikipedia-featured.svg" },
          },
          onthisday: [
            { year: 1766, title: "Auction", text: "Christie's held its first sale in London." },
            { year: 1901, title: "Animation", text: "Walt Disney was born in Chicago." },
            { year: 1933, title: "Prohibition", text: "The Twenty-first Amendment ended Prohibition in the United States." },
            { year: 1952, title: "Smog", text: "The Great Smog began over London." },
            { year: 2013, title: "Mandela", text: "Nelson Mandela died in Johannesburg." },
          ],
        }),
      });
      return;
    }

    if (url.pathname === "/api/apothekennotdienst") {
      const day = url.searchParams.get("day") === "tomorrow" ? "tomorrow" : "today";
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: pharmacies.slice(0, Number(url.searchParams.get("limit") || 2)),
          meta: {
            requestedAt: fixedNowIso,
            day,
            searchDate: day === "tomorrow" ? "06.12.2025" : "05.12.2025",
            location: { lat: 52.4974, lon: 13.4596 },
            radiusKm: Number(url.searchParams.get("radius") || 5),
            limit: Number(url.searchParams.get("limit") || 2),
            source: "www.aponet.de",
          },
        }),
      });
      return;
    }

    if (url.pathname === "/api/upcomingmovies") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          results: [
            {
              id: 1,
              title: "The Long Winter",
              release_date: "2026-01-09",
              overview: "A quiet science-fiction story about a city learning to share heat, light, and hope.",
              poster_path: "/poster-one.svg",
            },
            {
              id: 2,
              title: "Signal Hill",
              release_date: "2026-02-14",
              overview: "Two engineers restore an old observatory and discover messages hidden in weather data.",
              poster_path: "/poster-two.svg",
            },
            {
              id: 3,
              title: "Paper Trails",
              release_date: "2026-03-20",
              overview: "A fast, bright documentary about the small tools that keep communities organized.",
              poster_path: "/poster-three.svg",
            },
            {
              id: 4,
              title: "Northbound",
              release_date: "2026-04-02",
              overview: "A family road film with snowy landscapes, lost maps, and one very stubborn deadline.",
              poster_path: "/poster-four.svg",
            },
          ],
        }),
      });
      return;
    }

    if (url.pathname === "/api/sunsethue") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              type: "sunrise",
              model_data: true,
              quality: 84,
              cloud_cover: 28,
              quality_text: "Good",
              time: "2025-12-05T07:58:00+01:00",
              direction: 124,
              magics: { blue_hour: ["07:10", "07:42"], golden_hour: ["08:05", "08:44"] },
            },
            {
              type: "sunset",
              model_data: true,
              quality: 71,
              cloud_cover: 35,
              quality_text: "Nice",
              time: "2025-12-05T15:54:00+01:00",
              direction: 236,
              magics: { blue_hour: ["16:22", "16:57"], golden_hour: ["15:10", "15:50"] },
            },
          ],
        }),
      });
      return;
    }

    if (url.pathname === "/api/github-commit-graph") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          username: url.searchParams.get("username") || "wirewire",
          range: { from: "2025-09-06", to: "2025-12-05", weeks: 13, days: 91, todayUTC: "2025-12-05" },
          stats: {
            contributionsLastYear: 814,
            longestStreak: 28,
            currentStreak: 9,
            mostInADay: 12,
            averagePerDay: 2.23,
          },
          days: githubDays,
        }),
      });
      return;
    }

    if (url.pathname === "/api/applephotos/random") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          imageUrl: "https://assets.test/apple-photo.svg",
          caption: "Winter light over the studio",
          createdAt: "2025-12-05",
          token: "test-token",
        }),
      });
      return;
    }

    if (url.hostname === "assets.test") {
      const label = url.pathname.includes("apple") ? "Apple Photos" : "Wikipedia";
      await route.fulfill({
        contentType: "image/svg+xml",
        body: svgImage(label, url.pathname.includes("apple") ? "#315f72" : "#5b4b8a"),
      });
      return;
    }

    if (url.hostname === "image.tmdb.org") {
      await route.fulfill({
        contentType: "image/svg+xml",
        body: svgImage("Poster", "#7b3f55"),
      });
      return;
    }

    if (url.hostname === "fonts.gstatic.com" || url.hostname === "fonts.googleapis.com") {
      await route.fulfill({
        status: 200,
        body: url.hostname === "fonts.googleapis.com" ? "" : transparentPixel,
      });
      return;
    }

    await route.continue();
  });
});

for (const variant of variants) {
  test(`captures ${variant.title}`, async ({ page }, testInfo) => {
    await page.goto(variant.path);
    if (variant.ready) {
      await variant.ready(page);
    }

    await expect(page.locator("body")).toBeVisible();
    await waitForRenderReady(page);
    await page.waitForTimeout(250);

    const screenshotPath = testInfo.outputPath(
      `${variant.id}-${testInfo.project.name}.png`,
    );
    await page.screenshot({
      animations: "disabled",
      caret: "hide",
      fullPage: false,
      path: screenshotPath,
    });

    await testInfo.attach(variant.id, {
      path: screenshotPath,
      contentType: "image/png",
    });
  });
}

async function waitForRenderReady(page: Page) {
  const loadingMarker = page.locator("#website-has-loading-element");
  if ((await loadingMarker.count()) === 0) {
    await page.waitForLoadState("networkidle");
    return;
  }

  try {
    await expect(page.locator("#website-has-loaded")).toBeAttached({
      timeout: 2_500,
    });
  } catch {
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  }
}
