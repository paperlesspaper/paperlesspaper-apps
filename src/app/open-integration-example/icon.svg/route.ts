import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin");
  const allowOrigin = origin || "*";

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
    ...(origin ? { "access-control-allow-credentials": "true" } : {}),
    ...(origin ? { vary: "Origin" } : {}),
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      "cache-control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="8" width="80" height="80" rx="16" fill="#111827"/>
  <path d="M28 58c0-14 10-26 26-26 6 0 11 2 14 5l-6 7c-2-2-5-3-8-3-10 0-16 7-16 17v2h30v10H28V58z" fill="#F9FAFB"/>
  <path d="M27 29h42v8H27v-8z" fill="#9CA3AF"/>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "no-store",
      ...corsHeaders(request),
    },
  });
}
