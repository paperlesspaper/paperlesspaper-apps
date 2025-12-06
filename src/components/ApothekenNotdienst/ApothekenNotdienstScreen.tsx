"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import classnames from "classnames";
import { useSearchParams } from "next/navigation";
import styles from "./apothekenNotdienst.module.scss";
import { useLoading } from "@/helpers/Loading";

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
  { min, max }: { min: number; max: number }
): number => Math.min(Math.max(value, min), max);

const parseFloatParam = (
  value: string | null,
  fallback: number,
  clamp?: { min: number; max: number }
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
  clamp?: { min: number; max: number }
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

type CopySet = {
  heading: string;
  kicker: (label: string) => string;
  emptyTitle: string;
  emptySubtitle: (radius: number) => string;
  errorTitle: string;
  errorSubtitle: string;
  radiusLabel: (radius: number) => string;
  refreshLabel: (minutes: number) => string;
  updatedLabel: (time: string) => string;
  distanceLabel: (distance: string) => string;
  serviceWindowLabel: string;
  contactLabel: string;
  phoneLabel: string;
  faxLabel: string;
  emailLabel: string;
  dataSourceLabel: string;
  dataSourceValue: string;
  mapsCta: string;
  todayLabel: string;
  tomorrowLabel: string;
};

const copySets: Record<string, CopySet> = {
  de: {
    heading: "Apotheken-Notdienst",
    kicker: (label) => `Bereitschaft ${label}`,
    emptyTitle: "Keine Dienste gefunden",
    emptySubtitle: (radius) =>
      `Im ausgewählten Zeitraum ist in einem Radius von ${radius} km keine Apotheke im Notdienst.`,
    errorTitle: "Fehler beim Laden",
    errorSubtitle: "Bitte später erneut versuchen.",
    radiusLabel: (radius) => `Radius ${radius} km`,
    refreshLabel: (minutes) => `Aktualisierung alle ${minutes} min`,
    updatedLabel: (time) => `Stand ${time}`,
    distanceLabel: (distance) => `${distance} km entfernt`,
    serviceWindowLabel: "Notdienstzeitraum",
    contactLabel: "Kontakt",
    phoneLabel: "Telefon",
    faxLabel: "Fax",
    emailLabel: "E-Mail",
    dataSourceLabel: "Datenquelle",
    dataSourceValue: "www.aponet.de",
    mapsCta: "Route anzeigen",
    todayLabel: "heute",
    tomorrowLabel: "morgen",
  },
  en: {
    heading: "Emergency Pharmacies",
    kicker: (label) => `On duty ${label}`,
    emptyTitle: "No duties nearby",
    emptySubtitle: (radius) =>
      `No pharmacies on duty within a ${radius} km radius for the selected day.`,
    errorTitle: "Unable to load data",
    errorSubtitle: "Please try again in a few minutes.",
    radiusLabel: (radius) => `Radius ${radius} km`,
    refreshLabel: (minutes) => `Refresh every ${minutes} min`,
    updatedLabel: (time) => `Updated ${time}`,
    distanceLabel: (distance) => `${distance} km away`,
    serviceWindowLabel: "Service window",
    contactLabel: "Contact",
    phoneLabel: "Phone",
    faxLabel: "Fax",
    emailLabel: "Email",
    dataSourceLabel: "Source",
    dataSourceValue: "www.aponet.de",
    mapsCta: "Open route",
    todayLabel: "today",
    tomorrowLabel: "tomorrow",
  },
};

const getCopy = (language: string): CopySet => {
  const base = language.split("-")[0]?.toLowerCase();
  return copySets[base as keyof typeof copySets] || copySets.en;
};

const parseServiceDate = (
  date: string | null,
  time: string | null
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

const sanitizePhoneHref = (value: string): string =>
  value.replace(/[^+\d]/g, "");

const sanitizeEmailHref = (value: string): string => value.trim();

export default function ApothekenNotdienstScreen(): JSX.Element {
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
    { min: -90, max: 90 }
  );
  const lon = parseFloatParam(
    searchParams.get("lon"),
    DEFAULT_COORDINATES.lon,
    { min: -180, max: 180 }
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
  const titleOverride = searchParams.get("title");
  const refreshIntervalMs = (() => {
    const parsed = parseIntegerParam(
      updateIntervalParam,
      DEFAULT_REFRESH_INTERVAL
    );
    return clampNumber(parsed, {
      min: MIN_REFRESH_INTERVAL,
      max: MAX_REFRESH_INTERVAL,
    });
  })();

  const copy = useMemo(() => getCopy(language), [language]);

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
    [language]
  );

  const distanceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(language, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    [language]
  );

  const updatedFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      }),
    [language]
  );

  const refreshMinutes = Math.round(refreshIntervalMs / 60000);

  const latestUpdateLabel = meta?.requestedAt
    ? copy.updatedLabel(updatedFormatter.format(new Date(meta.requestedAt)))
    : null;

  const highlightLabel = copy.kicker(
    day === "today" ? copy.todayLabel : copy.tomorrowLabel
  );

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
              parseError
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
          requestError instanceof Error
            ? requestError.message
            : copy.errorSubtitle
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
      refreshIntervalMs
    );

    return () => {
      abortControllerRef.current?.abort();
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [endpoint, refreshIntervalMs, setLoading, copy.errorSubtitle]);

  const formatServiceWindow = (pharmacy: PharmacyDuty): string => {
    const start = parseServiceDate(
      pharmacy.serviceWindow.startDate,
      pharmacy.serviceWindow.startTime
    );
    const end = parseServiceDate(
      pharmacy.serviceWindow.endDate,
      pharmacy.serviceWindow.endTime
    );
    if (start && end) {
      return `${serviceFormatter.format(start)} – ${serviceFormatter.format(
        end
      )}`;
    }
    if (pharmacy.serviceWindow.startDate && pharmacy.serviceWindow.endDate) {
      return `${pharmacy.serviceWindow.startDate} ${
        pharmacy.serviceWindow.startTime || ""
      } – ${pharmacy.serviceWindow.endDate} ${
        pharmacy.serviceWindow.endTime || ""
      }`.trim();
    }
    return copy.serviceWindowLabel;
  };

  const classNames = classnames(
    styles.apotheken,
    color && styles[color as keyof typeof styles],
    kind && styles[kind as keyof typeof styles],
    color,
    kind
  );

  const showSkeleton = isInitialLoad;
  const showEmpty = !isInitialLoad && pharmacies.length === 0 && !error;

  const skeletonItems = Array.from({ length: Math.min(limit, 4) });

  return (
    <div className={classNames}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>
            {highlightLabel}
            {meta?.searchDate ? ` • ${meta.searchDate}` : ""}
          </p>
          <h1>{titleOverride || copy.heading}</h1>
        </div>
        <div className={styles.chipRow}>
          <span className={styles.chip}>{copy.radiusLabel(radius)}</span>
          <span className={styles.chip}>
            {copy.refreshLabel(refreshMinutes)}
          </span>
          {latestUpdateLabel ? (
            <span className={styles.chip}>{latestUpdateLabel}</span>
          ) : null}
        </div>
      </header>

      {error ? (
        <section className={styles.statePanel}>
          <p className={styles.stateTitle}>{copy.errorTitle}</p>
          <p className={styles.stateMessage}>{error}</p>
        </section>
      ) : null}

      {showSkeleton ? (
        <section className={styles.grid}>
          {skeletonItems.map((_, index) => (
            <article key={`skeleton-${index}`} className={styles.cardSkeleton}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
            </article>
          ))}
        </section>
      ) : null}

      {showEmpty ? (
        <section className={styles.statePanel}>
          <p className={styles.stateTitle}>{copy.emptyTitle}</p>
          <p className={styles.stateMessage}>{copy.emptySubtitle(radius)}</p>
        </section>
      ) : null}

      {!showSkeleton && pharmacies.length > 0 ? (
        <section className={styles.grid}>
          {pharmacies.map((pharmacy) => (
            <article key={pharmacy.id} className={styles.card}>
              <header className={styles.cardHeader}>
                <div>
                  <p className={styles.cardLabel}>
                    {pharmacy.chamber?.toUpperCase() || copy.serviceWindowLabel}
                  </p>
                  <h2>{pharmacy.name}</h2>
                </div>
                {pharmacy.distanceKm !== null ? (
                  <span className={styles.distanceChip}>
                    {copy.distanceLabel(
                      distanceFormatter.format(pharmacy.distanceKm)
                    )}
                  </span>
                ) : null}
              </header>

              <address className={styles.address}>
                {pharmacy.address.street}
                <br />
                {pharmacy.address.postalCode} {pharmacy.address.city}
              </address>

              <div className={styles.serviceWindow}>
                <span className={styles.serviceLabel}>
                  {copy.serviceWindowLabel}
                </span>
                <p>{formatServiceWindow(pharmacy)}</p>
              </div>

              {(pharmacy.contact.phones.length > 0 ||
                pharmacy.contact.faxNumbers.length > 0 ||
                pharmacy.contact.emails.length > 0) && (
                <div className={styles.contactBlock}>
                  <span className={styles.serviceLabel}>
                    {copy.contactLabel}
                  </span>
                  <ul className={styles.contactList}>
                    {pharmacy.contact.phones.map((phone) => (
                      <li key={`phone-${pharmacy.id}-${phone}`}>
                        <span>{copy.phoneLabel}</span>
                        <a href={`tel:${sanitizePhoneHref(phone)}`}>{phone}</a>
                      </li>
                    ))}
                    {pharmacy.contact.faxNumbers.map((fax) => (
                      <li key={`fax-${pharmacy.id}-${fax}`}>
                        <span>{copy.faxLabel}</span>
                        <span>{fax}</span>
                      </li>
                    ))}
                    {pharmacy.contact.emails.map((email) => (
                      <li key={`email-${pharmacy.id}-${email}`}>
                        <span>{copy.emailLabel}</span>
                        <a href={`mailto:${sanitizeEmailHref(email)}`}>
                          {email}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </section>
      ) : null}

      <footer className={styles.footer}>
        <span>
          {copy.dataSourceLabel}: {copy.dataSourceValue}
        </span>
      </footer>
    </div>
  );
}
