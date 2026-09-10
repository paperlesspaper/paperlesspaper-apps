import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "output/playwright/test-results",
  reporter: [["list"], ["html", { outputFolder: "output/playwright/html-report" }]],
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "yarn dev",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "800x480-landscape",
      use: {
        browserName: "chromium",
        deviceScaleFactor: 1,
        viewport: { width: 800, height: 480 },
      },
    },
    {
      name: "800x480-portrait",
      use: {
        browserName: "chromium",
        deviceScaleFactor: 1,
        viewport: { width: 480, height: 800 },
      },
    },
    {
      name: "1600x1200-landscape",
      use: {
        browserName: "chromium",
        deviceScaleFactor: 1,
        viewport: { width: 1600, height: 1200 },
      },
    },
    {
      name: "1600x1200-portrait",
      use: {
        browserName: "chromium",
        deviceScaleFactor: 1,
        viewport: { width: 1200, height: 1600 },
      },
    },
  ],
});
