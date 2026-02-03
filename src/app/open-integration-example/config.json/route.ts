import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "../../../helpers/corsHeaders";

export const dynamic = "force-dynamic";

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
  const origin = request.nextUrl.origin;

  // Note: `nativeSettings` here is treated as “defaults” by the host app (memo-mono).
  // Keep it minimal to avoid surprising overrides.
  const manifest = {
    name: "PaperlessPaper — Open Integration Example",
    version: "0.1.0",
    description: "Demo integration provider hosted in paperlesspaper-apps",
    icon: `${origin}/open-integration-example/icon.png`,

    nativeSettings: {
      orientation: "portrait",
    },

    formSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Headline shown on the render page",
          default: "Hello from the plugin",
        },
        theme: {
          type: "string",
          description: "Simple palette selector",
          enum: ["light", "dark"],
          default: "light",
        },
        showClock: {
          type: "boolean",
          description: "Show current time on the render page",
          default: true,
        },
        tags: {
          type: "array",
          description: "Optional tags (string array)",
          items: { type: "string" },
          default: ["demo", "paperlesspaper"],
        },
      },
    },

    settingsPage: `${origin}/open-integration-example/settings`,
    renderPage: `${origin}/open-integration-example/render`,
  };

  return NextResponse.json(manifest, {
    status: 200,
    headers: {
      "cache-control": "no-store",
      ...corsHeaders(request),
    },
  });
}
