type RequestLike = {
  headers: Headers;
};

type CorsHeaderOptions = {
  allowMethods?: string;
  allowHeaders?: string;
};

/**
 * Minimal CORS helper for Next.js route handlers.
 *
 * - If an Origin is provided, echo it back (required for credentialed requests).
 * - Otherwise fall back to '*'.
 */
export function corsHeaders(
  request: RequestLike,
  options: CorsHeaderOptions = {},
): Record<string, string> {
  const origin = request.headers.get("origin");
  const allowOrigin = origin || "*";

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": options.allowMethods || "GET,OPTIONS",
    "access-control-allow-headers":
      options.allowHeaders || "content-type, authorization",
    ...(origin ? { "access-control-allow-credentials": "true" } : {}),
    ...(origin ? { vary: "Origin" } : {}),
  };
}
