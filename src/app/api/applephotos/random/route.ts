import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

type AlbumPhoto = {
  guid: string;
  caption?: string;
  createdAt?: string;
  preferredChecksum?: string;
};

function jsonResponse(
  request: NextRequest,
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
) {
  // Keep it usable in iframes and when hosted as an integration provider.
  const origin = request.headers.get("origin") || "*";
  return NextResponse.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type",
      ...extraHeaders,
    },
  });
}

export async function OPTIONS(request: NextRequest) {
  return jsonResponse(request, {}, 204);
}

function extractTokenFromInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return trimmed;
  }

  const url = new URL(trimmed);

  // Typical share link: https://www.icloud.com/sharedalbum/#<TOKEN>
  if (url.hash && url.hash.length > 1) {
    return url.hash.slice(1);
  }

  // Sometimes sharedalbum links can be path-based.
  const parts = url.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] || "";
  return last;
}

function pickRandom<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error("Cannot pick a random element from an empty array");
  }
  const index = crypto.randomInt(0, items.length);
  return items[index];
}

const tokenToOriginCache = new Map<string, string>();

function collectPhotoGuids(value: unknown): AlbumPhoto[] {
  const results: AlbumPhoto[] = [];
  const seen = new Set<string>();

  const queue: unknown[] = [value];

  while (queue.length) {
    const current = queue.shift();
    if (!current) continue;

    if (Array.isArray(current)) {
      for (const item of current) queue.push(item);
      continue;
    }

    if (typeof current === "object") {
      const obj = current as Record<string, unknown>;

      // Common key in shared album JSON.
      const guid =
        (typeof obj.photoGuid === "string" && obj.photoGuid) ||
        (typeof obj.photoGUID === "string" && obj.photoGUID) ||
        (typeof obj.guid === "string" && obj.guid) ||
        "";

      if (guid && !seen.has(guid)) {
        let preferredChecksum: string | undefined;

        const derivatives = obj.derivatives;
        if (derivatives && typeof derivatives === "object") {
          const d = derivatives as Record<string, unknown>;
          let bestSize = -1;
          for (const [sizeKey, derivativeValue] of Object.entries(d)) {
            const size = Number.parseInt(sizeKey, 10);
            if (!Number.isFinite(size)) continue;
            if (!derivativeValue || typeof derivativeValue !== "object")
              continue;
            const checksum = (derivativeValue as Record<string, unknown>)
              .checksum;
            if (typeof checksum !== "string" || !checksum) continue;

            if (size > bestSize) {
              bestSize = size;
              preferredChecksum = checksum;
            }
          }
        }

        seen.add(guid);
        results.push({
          guid,
          caption: typeof obj.caption === "string" ? obj.caption : undefined,
          createdAt:
            typeof obj.dateCreated === "string"
              ? obj.dateCreated
              : typeof obj.createdAt === "string"
                ? obj.createdAt
                : undefined,
          preferredChecksum,
        });
      }

      for (const v of Object.values(obj)) queue.push(v);
    }
  }

  return results;
}

function buildBestAssetUrl(assetData: unknown, preferredChecksum?: string) {
  if (!assetData || typeof assetData !== "object") return undefined;
  const root = assetData as Record<string, unknown>;

  const locations = root.locations;
  const items = root.items;

  if (!locations || typeof locations !== "object") return undefined;
  if (!items || typeof items !== "object") return undefined;

  const locationsObj = locations as Record<string, unknown>;
  const itemsObj = items as Record<string, unknown>;

  const pickItem = (checksum: string): string | undefined => {
    const item = itemsObj[checksum];
    if (!item || typeof item !== "object") return undefined;
    const i = item as Record<string, unknown>;

    const urlPath = i.url_path;
    const urlLocation = i.url_location;

    if (typeof urlPath !== "string" || !urlPath) return undefined;
    if (typeof urlLocation !== "string" || !urlLocation) return undefined;

    const loc = locationsObj[urlLocation];
    if (!loc || typeof loc !== "object") {
      // Fallback: url_location is often a hostname already.
      return `https://${urlLocation}${urlPath}`;
    }

    const l = loc as Record<string, unknown>;
    const scheme = typeof l.scheme === "string" ? l.scheme : "https";
    const hosts = Array.isArray(l.hosts) ? l.hosts : [];
    const host = typeof hosts[0] === "string" ? hosts[0] : urlLocation;

    return `${scheme}://${host}${urlPath}`;
  };

  if (preferredChecksum) {
    const url = pickItem(preferredChecksum);
    if (url) return url;
  }

  for (const checksum of Object.keys(itemsObj)) {
    const url = pickItem(checksum);
    if (url) return url;
  }

  return undefined;
}

function collectHttpUrls(value: unknown): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const queue: unknown[] = [value];

  while (queue.length) {
    const current = queue.shift();
    if (!current) continue;

    if (typeof current === "string") {
      if (current.startsWith("http://") || current.startsWith("https://")) {
        if (!seen.has(current)) {
          seen.add(current);
          urls.push(current);
        }
      }
      continue;
    }

    if (Array.isArray(current)) {
      for (const item of current) queue.push(item);
      continue;
    }

    if (typeof current === "object") {
      const obj = current as Record<string, unknown>;
      for (const v of Object.values(obj)) queue.push(v);
    }
  }

  return urls;
}

type JsonResult = { data: unknown; finalUrl: string };

async function tryFetchJson(
  url: string,
  redirectDepth = 0,
): Promise<JsonResult> {
  // Apple endpoints sometimes accept both GET and POST; try GET first.
  const getRes = await fetch(url, {
    method: "GET",
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
    headers: {
      accept: "application/json,text/plain,*/*",
      "user-agent": "paperlesspaper-apps/1.0",
    },
  });

  if (getRes.ok) {
    return { data: await getRes.json(), finalUrl: url };
  }

  // Fallback: POST with a minimal payload seen in the wild.
  const postRes = await fetch(url, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
    headers: {
      accept: "application/json,text/plain,*/*",
      "content-type": "application/json",
      "user-agent": "paperlesspaper-apps/1.0",
    },
    body: JSON.stringify({ streamCtag: null }),
  });

  // Apple uses a non-standard redirect to move clients to the correct shard.
  // Example: 330 + X-Apple-MMe-Host: p101-sharedstreams.icloud.com
  if (postRes.status === 330 && redirectDepth < 3) {
    const headerHost = postRes.headers.get("x-apple-mme-host");
    let bodyHost: string | undefined;
    try {
      const maybe = (await postRes.clone().json()) as Record<string, unknown>;
      const hostValue = maybe?.["X-Apple-MMe-Host"];
      if (typeof hostValue === "string") bodyHost = hostValue;
    } catch {
      // ignore
    }

    const host = headerHost || bodyHost;
    if (host) {
      const next = new URL(url);
      next.protocol = "https:";
      next.host = host;
      return tryFetchJson(next.toString(), redirectDepth + 1);
    }
  }

  if (!postRes.ok) {
    const text = await postRes.text().catch(() => "");
    throw new Error(
      `Apple shared album request failed (${postRes.status}): ${text.slice(0, 200)}`,
    );
  }

  return { data: await postRes.json(), finalUrl: url };
}

async function postJsonWithShardRedirect(
  url: string,
  payload: unknown,
  redirectDepth = 0,
): Promise<JsonResult> {
  const res = await fetch(url, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
    headers: {
      accept: "application/json,text/plain,*/*",
      "content-type": "application/json",
      "user-agent": "paperlesspaper-apps/1.0",
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 330 && redirectDepth < 3) {
    const headerHost = res.headers.get("x-apple-mme-host");
    let bodyHost: string | undefined;
    try {
      const maybe = (await res.clone().json()) as Record<string, unknown>;
      const hostValue = maybe?.["X-Apple-MMe-Host"];
      if (typeof hostValue === "string") bodyHost = hostValue;
    } catch {
      // ignore
    }

    const host = headerHost || bodyHost;
    if (host) {
      const next = new URL(url);
      next.protocol = "https:";
      next.host = host;
      return postJsonWithShardRedirect(
        next.toString(),
        payload,
        redirectDepth + 1,
      );
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Asset URL request failed (${res.status}): ${text.slice(0, 200)}`,
    );
  }

  return { data: await res.json(), finalUrl: url };
}

function parseOriginsCsv(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function candidateOriginsForToken(token: string): string[] {
  const configured = parseOriginsCsv(
    process.env.APPLE_PHOTOS_SHAREDSTREAMS_ORIGINS,
  );
  const cached = tokenToOriginCache.get(token);

  const origins: string[] = [];
  if (cached) origins.push(cached);
  origins.push(...configured);

  // If we already have configured/cached candidates, do not brute-force.
  if (origins.length > 0) {
    return Array.from(new Set(origins));
  }

  // Fallback: try a small seed set. Apple will respond with a 330 redirect
  // (X-Apple-MMe-Host) to move us to the correct shard.
  origins.push(
    "https://p01-sharedstreams.icloud.com",
    "https://p02-sharedstreams.icloud.com",
    "https://p03-sharedstreams.icloud.com",
    "https://p04-sharedstreams.icloud.com",
    "https://p05-sharedstreams.icloud.com",
  );

  return origins;
}

function webstreamUrlFor(origin: string, token: string) {
  return `${origin}/${encodeURIComponent(token)}/sharedstreams/webstream`;
}

function webasseturlsUrlFor(origin: string, token: string) {
  return `${origin}/${encodeURIComponent(token)}/sharedstreams/webasseturls`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const albumUrl = searchParams.get("albumUrl") || "";
  const tokenParam = searchParams.get("token") || "";

  const token =
    extractTokenFromInput(tokenParam || albumUrl || "") ||
    extractTokenFromInput(process.env.APPLE_PHOTOS_SHARED_ALBUM_URL || "");

  if (!token) {
    return jsonResponse(
      request,
      {
        error:
          "Missing albumUrl/token. Provide ?albumUrl=<iCloud shared album URL> or set APPLE_PHOTOS_SHARED_ALBUM_URL.",
      },
      400,
    );
  }

  try {
    const originCandidates = candidateOriginsForToken(token);
    const webstreamCandidates = originCandidates.map((o) =>
      webstreamUrlFor(o, token),
    );
    const webasseturlsCandidates = originCandidates.map((o) =>
      webasseturlsUrlFor(o, token),
    );

    let webstreamData: unknown | undefined;
    let lastError: unknown;

    let resolvedOrigin: string | undefined;

    for (const url of webstreamCandidates) {
      try {
        const result = await tryFetchJson(url);
        webstreamData = result.data;
        resolvedOrigin = new URL(result.finalUrl).origin;
        break;
      } catch (e) {
        lastError = e;
      }
    }

    if (!webstreamData) {
      throw lastError instanceof Error
        ? lastError
        : new Error("Unable to fetch album feed");
    }

    const photos = collectPhotoGuids(webstreamData);

    if (photos.length === 0) {
      return jsonResponse(
        request,
        {
          error:
            "Album feed loaded, but no photos were discovered. The album may be empty or Apple changed the response format.",
        },
        502,
      );
    }

    const chosen = pickRandom(photos);

    if (resolvedOrigin) {
      tokenToOriginCache.set(token, resolvedOrigin);
    }

    // Fetch actual media URLs.
    let assetData: unknown | undefined;
    lastError = undefined;

    for (const url of webasseturlsCandidates) {
      try {
        const result = await postJsonWithShardRedirect(url, {
          photoGuids: [chosen.guid],
        });
        assetData = result.data;

        // If webstream resolution didn't give us an origin (or gave a seed),
        // upgrade the cache to the real shard.
        try {
          resolvedOrigin = new URL(result.finalUrl).origin;
          tokenToOriginCache.set(token, resolvedOrigin);
        } catch {
          // ignore
        }
        break;
      } catch (e) {
        lastError = e;
      }
    }

    // If asset lookup failed, fall back to scanning webstreamData for a direct URL.
    const imageUrlFromAssets = buildBestAssetUrl(
      assetData,
      chosen.preferredChecksum,
    );

    const candidateUrls = [...collectHttpUrls(webstreamData)].filter(
      (u) => !u.includes("/sharedalbum/"),
    );

    const imageUrl =
      imageUrlFromAssets ||
      candidateUrls.find((u) => /\.(jpg|jpeg|png|webp)(\?|$)/i.test(u)) ||
      candidateUrls[0];

    if (!imageUrl) {
      throw lastError instanceof Error
        ? lastError
        : new Error("Unable to resolve an image URL");
    }

    return jsonResponse(request, {
      imageUrl,
      guid: chosen.guid,
      caption: chosen.caption,
      createdAt: chosen.createdAt,
      token,
      origin: resolvedOrigin,
    });
  } catch (error) {
    console.error("Apple Photos random image error:", error);
    return jsonResponse(
      request,
      {
        error:
          error instanceof Error
            ? error.message
            : "Server error: unable to fetch shared album",
      },
      500,
    );
  }
}
