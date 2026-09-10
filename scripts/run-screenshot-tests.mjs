import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildGallery } from "./build-screenshot-gallery.mjs";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const playwrightBin = resolve(
  rootDir,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "playwright.cmd" : "playwright",
);

const child = spawn(playwrightBin, ["test"], {
  cwd: rootDir,
  stdio: "inherit",
});

child.on("close", (code, signal) => {
  const result = buildGallery();
  console.log(`Screenshot gallery: ${result.galleryPath}`);

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
