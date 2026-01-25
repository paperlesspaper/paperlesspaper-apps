"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import classnames from "classnames";
import { useSearchParams } from "next/navigation";
import styles from "./apothekenNotdienst.module.scss";
import { useLoading } from "@/helpers/Loading";
import RescaleText from "../RescaleText/RescaleText";
import { QRCodeSVG } from "qrcode.react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCarSide, faPersonWalking } from "@fortawesome/pro-regular-svg-icons";

const DEFAULT_COORDINATES = {
  lat: 52.4974,
  lon: 13.4596,
};
const DEFAULT_RADIUS = 5;
const DEFAULT_LIMIT = 5;
const DEFAULT_REFRESH_INTERVAL = 30 * 60 * 1000;
const MIN_REFRESH_INTERVAL = 20 * 60 * 1000;
const MAX_REFRESH_INTERVAL = 12 * 60 * 60 * 1000;
const MIN_RADIUS = 1;
const MAX_RADIUS = 50;
const MIN_LIMIT = 1;
const MAX_LIMIT = 20;

const clampNumber = (
  value: number,
  { min, max }: { min: number; max: number },
): number => Math.min(Math.max(value, min), max);

const parseFloatParam = (
  value: string | null,
  fallback: number,
  clamp?: { min: number; max: number },
): number => {
  if (value === null) {
    return fallback;
  }
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  if (clamp) {
    return clampNumber(parsed, clamp);
  }
  return parsed;
};

const parseIntegerParam = (
  value: string | null,
  fallback: number,
  clamp?: { min: number; max: number },
): number => {
  if (value === null) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  if (clamp) {
    return clampNumber(parsed, clamp);
  }
  return parsed;
};

type DayOption = "today" | "tomorrow";

const parseDayParam = (value: string | null): DayOption =>
  value === "tomorrow" ? "tomorrow" : "today";

const normalizeLocale = (value: string | null): string => value || "de-DE";

const TODAY_LABEL = "heute";
const TOMORROW_LABEL = "morgen";
const SERVICE_WINDOW_LABEL = "Notdienstzeitraum";
const ERROR_TITLE = "Fehler beim Laden";
const ERROR_SUBTITLE = "Bitte später erneut versuchen.";
const EMPTY_TITLE = "Keine Dienste gefunden";
const EMPTY_SUBTITLE = (radius: number) =>
  `Im ausgewählten Zeitraum ist in einem Radius von ${radius} km keine Apotheke im Notdienst.`;
const DATA_SOURCE_LABEL = "Datenquelle";
const DATA_SOURCE_VALUE = "www.aponet.de";
const RADIUS_LABEL = (radius: number) => `${radius} km Radius`;
const UPDATED_LABEL = (time: string) => `Stand ${time} Uhr`;
const DISTANCE_LABEL = (distance: string) => `${distance} km`;
const PHONE_LABEL = "Telefon";

type ContactLists = {
  phones: string[];
  faxNumbers: string[];
  emails: string[];
};

type PharmacyDuty = {
  id: string;
  name: string;
  chamber: string | null;
  distanceKm: number | null;
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  contact: ContactLists;
  coordinates: {
    lat: number | null;
    lon: number | null;
  };
  serviceWindow: {
    startDate: string | null;
    startTime: string | null;
    endDate: string | null;
    endTime: string | null;
  };
};

type ApiResponse = {
  data: PharmacyDuty[];
  meta: {
    requestedAt: string;
    day: DayOption;
    searchDate: string;
    location: { lat: number; lon: number };
    radiusKm: number;
    limit: number;
    source: string;
  };
};

const parseServiceDate = (
  date: string | null,
  time: string | null,
): Date | null => {
  if (!date) {
    return null;
  }
  const [day, month, year] = date.split(".");
  if (!day || !month || !year) {
    return null;
  }
  const timePart = time ? `${time}:00` : "00:00:00";
  const iso = `${year}-${month}-${day}T${timePart}`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/*
const buildMapsUrl = (pharmacy: PharmacyDuty): string => {
  const { lat, lon } = pharmacy.coordinates;
  if (lat !== null && lon !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  }
  const query = `${pharmacy.name}, ${pharmacy.address.street}, ${pharmacy.address.postalCode} ${pharmacy.address.city}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
};
*/

const sanitizePhoneHref = (value: string): string =>
  value.replace(/[^+\d]/g, "");

const APONET_PAGE_URL = "https://www.aponet.de/apotheke/notdienstsuche";

const buildAponetSearchResultsUrl = (
  meta: ApiResponse["meta"] | null,
  fallbackPharmacy?: PharmacyDuty,
): string | null => {
  if (!meta) {
    return null;
  }

  const city = fallbackPharmacy?.address.city?.trim() || "";
  const postalCode = fallbackPharmacy?.address.postalCode?.trim() || "";
  const street = fallbackPharmacy?.address.street?.trim() || " ";
  const plzOrt = [postalCode, city].filter(Boolean).join(" ").trim();
  const radius = meta.radiusKm?.toString() || "";

  const encodedPlzOrt = encodeURIComponent(plzOrt || city || " ");
  const encodedStreet = encodeURIComponent(street || " ");
  const encodedRadius = encodeURIComponent(radius || "");

  return `${APONET_PAGE_URL}/${encodedPlzOrt}/${encodedStreet}/${encodedRadius}`;
};

export default function ApothekenNotdienstScreen() {
  const searchParams = useSearchParams();

  const color = searchParams.get("color") || "dark";
  const kind = searchParams.get("kind") || "primary";
  const limitParam =
    searchParams.get("maxEntries") || searchParams.get("limit");
  const radiusParam = searchParams.get("radius");
  const updateIntervalParam =
    searchParams.get("refreshInterval") || searchParams.get("updateInterval");
  const lat = parseFloatParam(
    searchParams.get("lat"),
    DEFAULT_COORDINATES.lat,
    { min: -90, max: 90 },
  );
  const lon = parseFloatParam(
    searchParams.get("lon"),
    DEFAULT_COORDINATES.lon,
    { min: -180, max: 180 },
  );
  const radius = parseIntegerParam(radiusParam, DEFAULT_RADIUS, {
    min: MIN_RADIUS,
    max: MAX_RADIUS,
  });
  const limit = parseIntegerParam(limitParam, DEFAULT_LIMIT, {
    min: MIN_LIMIT,
    max: MAX_LIMIT,
  });
  const day = parseDayParam(searchParams.get("day"));
  const language = normalizeLocale(searchParams.get("language"));
  const refreshIntervalMs = (() => {
    const parsed = parseIntegerParam(
      updateIntervalParam,
      DEFAULT_REFRESH_INTERVAL,
    );
    return clampNumber(parsed, {
      min: MIN_REFRESH_INTERVAL,
      max: MAX_REFRESH_INTERVAL,
    });
  })();

  const [pharmacies, setPharmacies] = useState<PharmacyDuty[]>([]);
  const [meta, setMeta] = useState<ApiResponse["meta"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const setLoading = useLoading({ id: "apothekennotdienst" });
  const endpoint = useMemo(() => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      radius: radius.toString(),
      day,
      limit: limit.toString(),
    });
    return `/api/apothekennotdienst?${params.toString()}`;
  }, [lat, lon, radius, day, limit]);

  const serviceFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [language],
  );

  const distanceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(language, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    [language],
  );

  const updatedFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      }),
    [language],
  );

  const latestUpdateLabel = meta?.requestedAt
    ? UPDATED_LABEL(updatedFormatter.format(new Date(meta.requestedAt)))
    : null;

  const highlightLabel = `Bereitschaft ${
    day === "today" ? TODAY_LABEL : TOMORROW_LABEL
  }`;

  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setIsInitialLoad(true);

    const fetchData = async (trackLoading: boolean) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      if (trackLoading) {
        setLoading(true);
      }
      try {
        const response = await fetch(endpoint, {
          signal: abortControllerRef.current.signal,
        });
        if (!response.ok) {
          let message = `Request failed with status ${response.status}`;
          try {
            const payload = await response.json();
            if (payload?.error) {
              message = payload.error;
            }
          } catch (parseError) {
            console.warn(
              "Unable to parse Apothekennotdienst error",
              parseError,
            );
          }
          throw new Error(message);
        }
        const payload = (await response.json()) as ApiResponse;
        setPharmacies(payload.data);
        setMeta(payload.meta);
        setError(null);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }
        console.error("Apothekennotdienst request failed", requestError);
        setError(
          requestError instanceof Error ? requestError.message : ERROR_SUBTITLE,
        );
      } finally {
        if (trackLoading) {
          setLoading(false);
          setIsInitialLoad(false);
        }
      }
    };

    fetchData(true);
    intervalRef.current = window.setInterval(
      () => fetchData(false),
      refreshIntervalMs,
    );

    return () => {
      abortControllerRef.current?.abort();
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [endpoint, refreshIntervalMs, setLoading]);

  const formatServiceWindow = (pharmacy: PharmacyDuty): string => {
    const start = parseServiceDate(
      pharmacy.serviceWindow.startDate,
      pharmacy.serviceWindow.startTime,
    );
    const end = parseServiceDate(
      pharmacy.serviceWindow.endDate,
      pharmacy.serviceWindow.endTime,
    );
    if (start && end) {
      return `${serviceFormatter.format(start)} – ${serviceFormatter.format(
        end,
      )}`;
    }
    if (pharmacy.serviceWindow.startDate && pharmacy.serviceWindow.endDate) {
      return `${pharmacy.serviceWindow.startDate} ${
        pharmacy.serviceWindow.startTime || ""
      } – ${pharmacy.serviceWindow.endDate} ${
        pharmacy.serviceWindow.endTime || ""
      }`.trim();
    }
    return SERVICE_WINDOW_LABEL;
  };

  const classNames = classnames(
    styles.apotheken,
    color && styles[color as keyof typeof styles],
    kind && styles[kind as keyof typeof styles],
    color,
    kind,
  );

  const showSkeleton = isInitialLoad;
  const showEmpty = !isInitialLoad && pharmacies.length === 0 && !error;

  const skeletonItems = Array.from({ length: Math.min(limit, 4) });

  const searchResultsUrl = useMemo(
    () => buildAponetSearchResultsUrl(meta, pharmacies[0]),
    [meta, pharmacies],
  ) as string;

  return (
    <div className={classNames}>
      <RescaleText
        id="apotheken-notdienst-content"
        maxFontSize={28}
        checkHeight
        style={{ width: "100%", height: "100%" }}
        className={styles.contentWrapper}
      >
        <>
          <header className={styles.header}>
            <div>
              <h1>
                <span>{highlightLabel}</span>
                <span>{meta?.searchDate ? ` ${meta.searchDate}` : ""}</span>
              </h1>
              <div className={styles.source}>
                {DATA_SOURCE_LABEL}: {DATA_SOURCE_VALUE}
              </div>
            </div>
            <div className={styles.additionalRow}>
              <div className={styles.metaRow}>
                {latestUpdateLabel ? (
                  <span className={styles.meta}>{latestUpdateLabel}</span>
                ) : null}
                <span className={styles.meta}>{RADIUS_LABEL(radius)}</span>
                {/* <span className={styles.chip}>
                Aktualisierung alle {refreshMinutes} min
              </span> */}
              </div>

              <a
                className={styles.qrLink}
                href={searchResultsUrl}
                target="_blank"
                rel="noreferrer"
              >
                <QRCodeSVG value={searchResultsUrl} size={56} />
              </a>
            </div>
          </header>

          {error ? (
            <section className={styles.statePanel}>
              <p className={styles.stateTitle}>{ERROR_TITLE}</p>
              <p className={styles.stateMessage}>{error}</p>
            </section>
          ) : null}

          {showSkeleton ? (
            <section className={styles.grid}>
              {skeletonItems.map((_, index) => (
                <article
                  key={`skeleton-${index}`}
                  className={styles.cardSkeleton}
                >
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLineShort} />
                </article>
              ))}
            </section>
          ) : null}

          {showEmpty ? (
            <section className={styles.statePanel}>
              <p className={styles.stateTitle}>{EMPTY_TITLE}</p>
              <p className={styles.stateMessage}>{EMPTY_SUBTITLE(radius)}</p>
            </section>
          ) : null}

          {!showSkeleton && pharmacies.length > 0 ? (
            <section className={styles.grid}>
              {pharmacies.map((pharmacy) => (
                <article key={pharmacy.id} className={styles.card}>
                  <header className={styles.cardHeader}>
                    <h2>
                      <span>{pharmacy.name}</span>
                    </h2>

                    {pharmacy.distanceKm !== null ? (
                      <span className={styles.distanceChip}>
                        {pharmacy.distanceKm < 2 ? (
                          <FontAwesomeIcon
                            icon={faPersonWalking}
                            className={styles.distanceIcon}
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faCarSide}
                            className={styles.distanceIcon}
                          />
                        )}
                        {DISTANCE_LABEL(
                          distanceFormatter.format(pharmacy.distanceKm),
                        )}
                      </span>
                    ) : null}
                  </header>

                  <address className={styles.address}>
                    {pharmacy.address.street}, {pharmacy.address.postalCode}{" "}
                    {pharmacy.address.city}
                  </address>

                  <div className={styles.infoRow}>
                    <div className={styles.serviceWindow}>
                      <span className={styles.serviceLabel}>
                        {SERVICE_WINDOW_LABEL}
                      </span>
                      <p>{formatServiceWindow(pharmacy)}</p>
                    </div>

                    {(pharmacy.contact.phones.length > 0 ||
                      pharmacy.contact.faxNumbers.length > 0 ||
                      pharmacy.contact.emails.length > 0) && (
                      <div className={styles.serviceWindow}>
                        {pharmacy.contact.phones.map((phone, i) => (
                          <React.Fragment key={i}>
                            <span className={styles.serviceLabel}>
                              {PHONE_LABEL}
                            </span>
                            <a href={`tel:${sanitizePhoneHref(phone)}`}>
                              {phone}
                            </a>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </section>
          ) : null}
        </>
      </RescaleText>
    </div>
  );
}
