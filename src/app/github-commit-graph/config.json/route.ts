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

  const manifest = {
    name: "PaperlessPaper — GitHub Commit Graph",
    version: "1.0.0",
    description: "Display a GitHub contributions graph and stats",
    icon: `${origin}/github-commit-graph/icon.png`,

    // Schema-only settings are enough; the host app will render these fields.
    formSchema: {
      type: "object",
      required: ["username"],
      properties: {
        username: {
          type: "string",
          description: "GitHub username (e.g. torvalds)",
          default: "torvalds",
        },
      },
    },

    renderPage: `${origin}/github-commit-graph/render`,
  };

  return new NextResponse(JSON.stringify(manifest, null, 2) + "\n", {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...corsHeaders(request),
    },
  });
}
