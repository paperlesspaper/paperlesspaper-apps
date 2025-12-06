import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_COORDINATES = {
  lat: 52.4974, // Berlin
  lon: 13.4596,
};

const DEFAULT_RADIUS = 5; // kilometers
const DEFAULT_LIMIT = 5;
const MIN_RADIUS = 1;
const MAX_RADIUS = 50;
const MIN_LIMIT = 1;
const MAX_LIMIT = 20;
const APONET_BASE_URL = "https://www.aponet.de/apotheke/notdienstsuche";
const APONET_TOKEN = process.env.APO_NET_TOKEN || "demo_token_please_replace";

type DayOption = "today" | "tomorrow";

type RawPharmacy = {
  name?: string;
  kammer?: string;
  id?: string;
  apo_id?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  distanz?: string;
  longitude?: string;
  latitude?: string;
  telefon?: string | string[];
  fax?: string | string[];
  email?: string | string[];
  startdatum?: string;
  startzeit?: string;
  enddatum?: string;
  endzeit?: string;
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
  contact: {
    phones: string[];
    faxNumbers: string[];
    emails: string[];
  };
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

const clampNumber = (
  value: number,
  { min, max }: { min: number; max: number }
): number => {
  return Math.min(Math.max(value, min), max);
};

const parseFloatParam = (value: string | null, fallback: number): number => {
  if (value === null) {
    return fallback;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseIntegerParam = (
  value: string | null,
  fallback: number,
  clamp: { min: number; max: number }
): number => {
  if (value === null) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return clampNumber(parsed, clamp);
};

const normalizeList = (value: string | string[] | undefined): string[] => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => entry?.trim())
      .filter((entry): entry is string => Boolean(entry));
  }
  const normalized = value.trim();
  return normalized ? [normalized] : [];
};

const parseNullableNumber = (
  value: string | number | undefined
): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (!value) {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const resolveSearchDate = (day: DayOption): string => {
  const base = new Date();
  if (day === "tomorrow") {
    base.setDate(base.getDate() + 1);
  }
  const dayString = base.getDate().toString().padStart(2, "0");
  const monthString = (base.getMonth() + 1).toString().padStart(2, "0");
  return `${dayString}.${monthString}.${base.getFullYear()}`;
};

const parseDayParam = (value: string | null): DayOption => {
  return value === "tomorrow" ? "tomorrow" : "today";
};

const buildPharmacyPayload = (raw: RawPharmacy): PharmacyDuty => {
  return {
    id: raw.apo_id || raw.id || randomUUID(),
    name: raw.name || "",
    chamber: raw.kammer ?? null,
    distanceKm: parseNullableNumber(raw.distanz),
    address: {
      street: raw.strasse || "",
      postalCode: raw.plz || "",
      city: raw.ort || "",
    },
    contact: {
      phones: normalizeList(raw.telefon),
      faxNumbers: normalizeList(raw.fax),
      emails: normalizeList(raw.email),
    },
    coordinates: {
      lat: parseNullableNumber(raw.latitude),
      lon: parseNullableNumber(raw.longitude),
    },
    serviceWindow: {
      startDate: raw.startdatum ?? null,
      startTime: raw.startzeit ?? null,
      endDate: raw.enddatum ?? null,
      endTime: raw.endzeit ?? null,
    },
  };
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const lat = parseFloatParam(searchParams.get("lat"), DEFAULT_COORDINATES.lat);
  const lon = parseFloatParam(searchParams.get("lon"), DEFAULT_COORDINATES.lon);
  const radius = parseIntegerParam(searchParams.get("radius"), DEFAULT_RADIUS, {
    min: MIN_RADIUS,
    max: MAX_RADIUS,
  });
  const limit = parseIntegerParam(searchParams.get("limit"), DEFAULT_LIMIT, {
    min: MIN_LIMIT,
    max: MAX_LIMIT,
  });
  const day = parseDayParam(searchParams.get("day"));

  const dateString = resolveSearchDate(day);

  const query = new URLSearchParams({
    "tx_aponetpharmacy_search[action]": "result",
    "tx_aponetpharmacy_search[controller]": "Search",
    "tx_aponetpharmacy_search[search][plzort]": "",
    "tx_aponetpharmacy_search[search][date]": dateString,
    "tx_aponetpharmacy_search[search][street]": "",
    "tx_aponetpharmacy_search[search][radius]": radius.toString(),
    "tx_aponetpharmacy_search[search][lat]": lat.toString(),
    "tx_aponetpharmacy_search[search][lng]": lon.toString(),
    "tx_aponetpharmacy_search[token]": APONET_TOKEN,
    type: "1981",
  });

  const url = `${APONET_BASE_URL}?${query.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: "Unable to fetch data from source", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawApotheken = data?.results?.apotheken?.apotheke;
    const list: RawPharmacy[] = Array.isArray(rawApotheken)
      ? rawApotheken
      : rawApotheken
      ? [rawApotheken]
      : [];

    const pharmacies = list.slice(0, limit).map(buildPharmacyPayload);

    return NextResponse.json({
      data: pharmacies,
      meta: {
        requestedAt: new Date().toISOString(),
        day,
        searchDate: dateString,
        location: { lat, lon },
        radiusKm: radius,
        limit,
        source: "aponet.de",
      },
    });
  } catch (error) {
    console.error("Error fetching Apothekennotdienst data", error);
    return NextResponse.json(
      {
        error: "Server error: unable to reach aponet.de",
      },
      { status: 500 }
    );
  }
}
