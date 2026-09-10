import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(rootDir, "output/playwright");
const resultsDir = resolve(outputDir, "test-results");
const galleryPath = resolve(outputDir, "screenshots.html");

function walk(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }

    return fullPath;
  });
}

function htmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function titleFromFile(filePath) {
  return basename(filePath, ".png")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dimensionsFromFile(filePath) {
  const match = basename(filePath).match(/-(\d+)x(\d+)-(landscape|portrait)\.png$/);
  if (!match) {
    return {
      width: 5,
      height: 3,
      orientation: "landscape",
    };
  }

  const [, width, height, orientation] = match;

  return {
    width: Number(width),
    height: Number(height),
    orientation,
  };
}

function toRelativeHref(filePath) {
  return relative(outputDir, filePath).split(sep).map(encodeURIComponent).join("/");
}

export function buildGallery() {
  const screenshots = walk(resultsDir)
    .filter((filePath) => filePath.endsWith(".png"))
    .filter((filePath) => !filePath.split(sep).includes("attachments"))
    .map((filePath) => {
      const dimensions = dimensionsFromFile(filePath);

      return {
        filePath,
        title: titleFromFile(filePath),
        href: toRelativeHref(filePath),
        modifiedAt: statSync(filePath).mtime,
        ...dimensions,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  mkdirSync(outputDir, { recursive: true });

  const generatedAt = new Date().toLocaleString();
  const cards = screenshots
    .map(
      (screenshot) => `
        <a class="card ${screenshot.orientation}" href="${screenshot.href}" target="_blank" rel="noreferrer">
          <img src="${screenshot.href}" alt="${htmlEscape(screenshot.title)}" loading="lazy" style="aspect-ratio: ${screenshot.width} / ${screenshot.height}" />
          <span>${htmlEscape(screenshot.title)}</span>
        </a>`,
    )
    .join("");

  const emptyState = screenshots.length
    ? ""
    : `<div class="empty">No screenshots found. Run <code>yarn test:screenshots</code> first.</div>`;

  writeFileSync(
    galleryPath,
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Integration Screenshots</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #f6f7f9;
        --fg: #17191d;
        --muted: #68707d;
        --line: #d9dee7;
        --card: #ffffff;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #101216;
          --fg: #f4f6f8;
          --muted: #a7afbc;
          --line: #2a3038;
          --card: #171b21;
        }
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--fg);
        font: 14px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      header {
        position: sticky;
        top: 0;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: baseline;
        padding: 18px 24px;
        background: color-mix(in srgb, var(--bg) 92%, transparent);
        border-bottom: 1px solid var(--line);
        backdrop-filter: blur(10px);
      }

      h1 {
        margin: 0;
        font-size: 20px;
      }

      .meta {
        color: var(--muted);
        white-space: nowrap;
      }

      main {
        padding: 24px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 18px;
      }

      .card {
        display: grid;
        gap: 10px;
        padding: 10px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--card);
        color: inherit;
        text-decoration: none;
      }

      .card:hover {
        border-color: var(--muted);
      }

      img {
        display: block;
        width: 100%;
        object-fit: contain;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: #fff;
      }

      span {
        font-weight: 650;
      }

      .empty {
        padding: 24px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--card);
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Integration Screenshots</h1>
      <div class="meta">${screenshots.length} images, generated ${htmlEscape(generatedAt)}</div>
    </header>
    <main>
      <div class="grid">${cards}</div>
      ${emptyState}
    </main>
  </body>
</html>
`,
  );

  return { galleryPath, screenshotCount: screenshots.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = buildGallery();
  console.log(`Wrote ${result.screenshotCount} screenshots to ${relative(rootDir, result.galleryPath)}`);
}
