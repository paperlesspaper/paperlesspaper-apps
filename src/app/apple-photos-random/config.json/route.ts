import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function jsonResponse(
  request: NextRequest,
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
) {
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

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  // Open Integration manifest (config.json)
  return jsonResponse(request, {
    name: "Apple Photos (Random)",
    version: "1.0.0",
    description: "Show a random image from a public Apple Photos shared album",
    icon: `${origin}/apple-photos-random/icon.png`,
    // No settingsPage for now; schema form is rendered by the host app.
    renderPage: "https://apps.paperlesspaper.de/apple-photos-random",
    formSchema: {
      type: "object",
      required: ["albumUrl"],
      properties: {
        albumUrl: {
          type: "string",
          description:
            "Public iCloud shared album URL, or the token from the share URL.",
        },
        refreshSeconds: {
          type: "integer",
          description: "How often to load a new random image (0 disables).",
          default: 60,
        },
        fit: {
          type: "string",
          description: "How the image should fit in the frame.",
          enum: ["cover", "contain"],
          default: "cover",
        },
        showCaption: {
          type: "boolean",
          description: "Show caption/date overlay if available.",
          default: false,
        },
      },
    },
  });
}
