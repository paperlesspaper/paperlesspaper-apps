"use client";

import React from "react";

type RenderPayload = {
  settings?: Record<string, any>;
  nativeSettings?: Record<string, any>;
  device?: { deviceId?: string; kind?: string };
  app?: { language?: string };
  paper?: Record<string, any>;
};

function formatTime(now: Date) {
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export const dynamic = "force-dynamic";

export default function OpenIntegrationExampleRenderPage() {
  const [payload, setPayload] = React.useState<RenderPayload | null>(null);
  const [receivedAt, setReceivedAt] = React.useState<number | null>(null);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data: any = event.data;
      if (!data || typeof data !== "object") return;

      // The server-side renderer posts `{ cmd: 'message', data: payload }`.
      if (
        data.cmd === "message" &&
        data.data &&
        typeof data.data === "object"
      ) {
        setPayload(data.data as RenderPayload);
        setReceivedAt(Date.now());
        return;
      }

      // Optional support for the newer INIT envelope.
      if (
        data.source === "wirewire-app" &&
        data.type === "INIT" &&
        data.payload
      ) {
        setPayload(data.payload as RenderPayload);
        setReceivedAt(Date.now());
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const settings = payload?.settings || {};
  const title =
    typeof settings.title === "string"
      ? settings.title
      : "Hello from the plugin";
  const theme = settings.theme === "dark" ? "dark" : "light";
  const showClock =
    typeof settings.showClock === "boolean" ? settings.showClock : true;

  const bg = theme === "dark" ? "#0b0f1a" : "#ffffff";
  const fg = theme === "dark" ? "#ffffff" : "#111827";
  const muted =
    theme === "dark" ? "rgba(255,255,255,0.75)" : "rgba(17,24,39,0.7)";

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: bg,
        color: fg,
        display: "grid",
        padding: 28,
        boxSizing: "border-box",
        gridTemplateRows: "auto 1fr auto",
      }}
    >
      {/* The renderer checks for this and can wait for #website-has-loaded */}
      <div id="website-has-loading-element" style={{ display: "none" }} />

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div
          style={{ fontSize: 44, fontWeight: 750, letterSpacing: "-0.02em" }}
        >
          {title}
        </div>
        {showClock ? (
          <div style={{ fontSize: 34, fontWeight: 650 }}>
            {formatTime(new Date())}
          </div>
        ) : null}
      </header>

      <main style={{ display: "grid", alignContent: "center", gap: 14 }}>
        <div style={{ fontSize: 22, opacity: 0.92 }}>
          This page is meant to be screenshot-rendered by Puppeteer.
        </div>
        <div style={{ fontSize: 16, color: muted }}>
          deviceId: {payload?.device?.deviceId || "(unknown)"} · kind:{" "}
          {payload?.device?.kind || "(unknown)"}
        </div>
        <div style={{ fontSize: 16, color: muted }}>
          received:{" "}
          {receivedAt
            ? new Date(receivedAt).toISOString()
            : "(waiting for INIT/message)"}
        </div>
      </main>

      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 14,
          color: muted,
        }}
      >
        <div>PaperlessPaper Open Integration Example</div>
        <div id="website-has-loaded">ready</div>
      </footer>
    </div>
  );
}
