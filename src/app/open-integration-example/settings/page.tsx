"use client";

import React from "react";

type HostInitPayload = {
  settings?: Record<string, any>;
  nativeSettings?: Record<string, any>;
  device?: { deviceId?: string; kind?: string };
  app?: { language?: string };
};

type HostRedirectPayload = {
  redirectUrl: string;
  tempToken: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export default function OpenIntegrationExampleSettingsPage() {
  const [hostOrigin, setHostOrigin] = React.useState<string | null>(null);
  const [hostWindow, setHostWindow] = React.useState<Window | null>(null);

  const [init, setInit] = React.useState<HostInitPayload | null>(null);
  const [redirect, setRedirect] = React.useState<HostRedirectPayload | null>(
    null,
  );

  const [title, setTitle] = React.useState("Hello from the plugin");
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [showClock, setShowClock] = React.useState(true);

  const postToHost = React.useCallback(
    (msg: any) => {
      if (!hostWindow) return;
      hostWindow.postMessage(msg, hostOrigin || "*");
    },
    [hostWindow, hostOrigin],
  );

  const reportHeight = React.useCallback(() => {
    // Give layout a moment to settle.
    window.requestAnimationFrame(() => {
      const h = clamp(
        document.documentElement.scrollHeight ||
          document.body.scrollHeight ||
          520,
        220,
        1400,
      );
      postToHost({
        source: "wirewire-plugin",
        type: "SET_HEIGHT",
        payload: { height: h },
      });
      postToHost({ height: h });
    });
  }, [postToHost]);

  const sendSettings = React.useCallback(
    (patch: Record<string, any>) => {
      postToHost({
        source: "wirewire-plugin",
        type: "UPDATE_SETTINGS",
        payload: patch,
      });
      postToHost({ cmd: "message", data: patch });
    },
    [postToHost],
  );

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data: any = event.data;
      if (!data || typeof data !== "object") return;

      // Record host origin/window from the first valid message so we can reply with a strict target origin.
      if (!hostOrigin) setHostOrigin(event.origin);
      if (
        !hostWindow &&
        event.source &&
        typeof (event.source as any).postMessage === "function"
      ) {
        setHostWindow(event.source as Window);
      }

      // New protocol
      if (data.source === "wirewire-app" && data.type === "INIT") {
        setInit(data.payload || null);
        return;
      }
      if (data.source === "wirewire-app" && data.type === "REDIRECT") {
        setRedirect(data.payload || null);
        return;
      }

      // Legacy protocol (render service + older plugins)
      if (
        data.cmd === "message" &&
        data.data &&
        typeof data.data === "object"
      ) {
        setInit(data.data as HostInitPayload);
        return;
      }
      if (
        data.cmd === "redirect" &&
        data.data &&
        typeof data.data === "object"
      ) {
        setRedirect(data.data as HostRedirectPayload);
        return;
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [hostOrigin, hostWindow]);

  // Initialize the form from host-provided settings.
  React.useEffect(() => {
    const s = init?.settings || {};
    if (typeof s.title === "string") setTitle(s.title);
    if (s.theme === "light" || s.theme === "dark") setTheme(s.theme);
    if (typeof s.showClock === "boolean") setShowClock(s.showClock);
  }, [init]);

  React.useEffect(() => {
    sendSettings({ title, theme, showClock });
    reportHeight();
  }, [title, theme, showClock, sendSettings, reportHeight]);

  React.useEffect(() => {
    reportHeight();
  }, [init, redirect, reportHeight]);

  const connectUrl = React.useMemo(() => {
    if (!redirect?.redirectUrl || !redirect?.tempToken) return null;
    const u = new URL("/open-integration-example/auth", window.location.origin);
    u.searchParams.set("redirectUrl", redirect.redirectUrl);
    u.searchParams.set("tempToken", redirect.tempToken);
    return u.toString();
  }, [redirect]);

  return (
    <main style={{ padding: 12 }}>
      <h2 style={{ margin: "0 0 10px" }}>Integration Settings</h2>

      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Title</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: "8px 10px",
              border: "1px solid rgba(0,0,0,0.2)",
              borderRadius: 8,
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Theme</div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            style={{
              padding: "8px 10px",
              border: "1px solid rgba(0,0,0,0.2)",
              borderRadius: 8,
            }}
          >
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={showClock}
            onChange={(e) => setShowClock(e.target.checked)}
          />
          <span>Show clock</span>
        </label>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgba(0,0,0,0.12)",
            margin: "6px 0",
          }}
        />

        <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.35 }}>
          <div>
            <strong>Host deviceId:</strong>{" "}
            {init?.device?.deviceId || "(unknown)"}
          </div>
          <div>
            <strong>Host language:</strong> {init?.app?.language || "(unknown)"}
          </div>
          <div>
            <strong>Native orientation:</strong>{" "}
            {String(init?.nativeSettings?.orientation || "(unset)")}
          </div>
        </div>

        {connectUrl ? (
          <a
            href={connectUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "10px 12px",
              borderRadius: 10,
              background: "#111827",
              color: "#fff",
              textDecoration: "none",
              width: "fit-content",
            }}
            onClick={() => {
              postToHost({
                source: "wirewire-plugin",
                type: "INFO",
                payload: { action: "open-auth" },
              });
            }}
          >
            Connect (mock OAuth)
          </a>
        ) : (
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            “Connect” becomes available after the host sends a REDIRECT message.
          </div>
        )}
      </div>
    </main>
  );
}
