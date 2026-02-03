/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./applePhotosRandom.module.scss";
import classnames from "classnames";
import { useSearchParams } from "next/navigation";
import { useLoading } from "@/helpers/Loading";

type ApiResponse = {
  imageUrl: string;
  guid?: string;
  caption?: string;
  createdAt?: string;
  token?: string;
  error?: string;
};

type PluginSettings = {
  albumUrl?: unknown;
  token?: unknown;
  refreshSeconds?: unknown;
  fit?: unknown;
  showCaption?: unknown;
};

function asNumber(value: string | null, fallback: number): number {
  const n = value ? Number.parseFloat(value) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

export default function ApplePhotosRandomScreen() {
  const searchParams = useSearchParams();
  const setLoading = useLoading({ id: "apple-photos-random" });

  const color = searchParams.get("color") || "dark";
  const kind = searchParams.get("kind") || "default";
  const accent = searchParams.get("accent") || "";

  const albumUrl = searchParams.get("albumUrl") || "";
  const token = searchParams.get("token") || "";

  // 0 disables auto-refresh.
  const refreshSeconds = asNumber(searchParams.get("refreshSeconds"), 0);
  const fit = searchParams.get("fit") || "cover"; // cover | contain
  const showCaption = (searchParams.get("showCaption") || "false") === "true";

  const [pluginSettings, setPluginSettings] = useState<PluginSettings | null>(
    null,
  );

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const raw = (event as MessageEvent).data;
      if (!raw || typeof raw !== "object") return;

      const msg = raw as Record<string, unknown>;
      if (msg.cmd !== "message") return;

      const data = msg.data;
      if (!data || typeof data !== "object") return;

      const payload = data as Record<string, unknown>;
      const settings = payload.settings;
      if (!settings || typeof settings !== "object") return;

      setPluginSettings(settings as PluginSettings);
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const effectiveAlbumUrl = String(
    (pluginSettings?.albumUrl ?? albumUrl) || "",
  );
  const effectiveToken = String((pluginSettings?.token ?? token) || "");

  const effectiveRefreshSeconds = (() => {
    const raw = pluginSettings?.refreshSeconds;
    const n = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(n) ? n : refreshSeconds;
  })();

  const effectiveFit = String((pluginSettings?.fit ?? fit) || "cover");
  const effectiveShowCaption =
    typeof pluginSettings?.showCaption === "boolean"
      ? pluginSettings.showCaption
      : showCaption;

  const classNames = classnames({
    [styles.wrapper]: true,
    [styles[color]]: color,
    [styles[kind]]: kind,
    [color]: color,
    [accent]: accent,
  });

  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (effectiveAlbumUrl) params.set("albumUrl", effectiveAlbumUrl);
    if (effectiveToken) params.set("token", effectiveToken);

    const query = params.toString();
    return query
      ? `/api/applephotos/random?${query}`
      : "/api/applephotos/random";
  }, [effectiveAlbumUrl, effectiveToken]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl, { cache: "no-store" });
      const json = (await res.json()) as ApiResponse;

      if (!res.ok || json.error) {
        throw new Error(json.error || `Request failed (${res.status})`);
      }

      setData(json);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Unable to load image");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, setLoading]);

  useEffect(() => {
    // For plugin renders, settings arrive via postMessage. Avoid throwing an
    // error screen before we have either `albumUrl` or `token`.
    if (!effectiveAlbumUrl && !effectiveToken) return;
    load();
  }, [load, effectiveAlbumUrl, effectiveToken]);

  useEffect(() => {
    if (!effectiveRefreshSeconds || effectiveRefreshSeconds <= 0) return;
    const id = window.setInterval(() => load(), effectiveRefreshSeconds * 1000);
    return () => window.clearInterval(id);
  }, [load, effectiveRefreshSeconds]);

  if (error) {
    return (
      <div className={classNames}>
        <div className={styles.center}>
          <div className={styles.errorTitle}>Apple Photos</div>
          <div className={styles.errorText}>{error}</div>
          <div className={styles.hint}>
            Provide <code>albumUrl</code> or <code>token</code> as query param.
          </div>
        </div>
      </div>
    );
  }

  // Plugin render: wait for settings payload.
  if (!effectiveAlbumUrl && !effectiveToken) {
    return (
      <div className={classNames}>
        <div className={styles.center}>
          <div className={styles.errorTitle}>Apple Photos</div>
          <div className={styles.errorText}>Waiting for settings…</div>
        </div>
      </div>
    );
  }

  if (!data?.imageUrl) {
    return <div className={classNames} />;
  }

  return (
    <div className={classNames}>
      <div className={styles.image}>
        <img
          src={data.imageUrl}
          alt={data.caption || "Apple Photos"}
          style={{
            objectFit: effectiveFit === "contain" ? "contain" : "cover",
          }}
        />
      </div>

      {effectiveShowCaption && (data.caption || data.createdAt) && (
        <div className={styles.caption}>
          {data.caption ? (
            <div className={styles.captionText}>{data.caption}</div>
          ) : null}
          {data.createdAt ? (
            <div className={styles.captionMeta}>{data.createdAt}</div>
          ) : null}
        </div>
      )}

      <button className={styles.refresh} onClick={() => load()}>
        Refresh
      </button>
    </div>
  );
}
