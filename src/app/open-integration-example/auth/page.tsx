"use client";

import React from "react";

export const dynamic = "force-dynamic";

export default function OpenIntegrationExampleAuthPage() {
  const [redirectUrl, setRedirectUrl] = React.useState<string | null>(null);
  const [tempToken, setTempToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    setRedirectUrl(url.searchParams.get("redirectUrl"));
    setTempToken(url.searchParams.get("tempToken"));
  }, []);

  const canRedirect = Boolean(redirectUrl && tempToken);

  return (
    <main style={{ padding: 16, lineHeight: 1.4 }}>
      <h1 style={{ margin: "0 0 8px" }}>Mock OAuth</h1>
      <p style={{ margin: "0 0 16px" }}>
        This page simulates an OAuth provider. Clicking “Approve” redirects back
        to the host redirectUrl with the tempToken.
      </p>

      <div style={{ display: "grid", gap: 8, fontSize: 12, opacity: 0.8 }}>
        <div>
          <strong>redirectUrl:</strong> {redirectUrl || "(missing)"}
        </div>
        <div>
          <strong>tempToken:</strong>{" "}
          {tempToken ? `${tempToken.slice(0, 6)}…` : "(missing)"}
        </div>
      </div>

      <button
        disabled={!canRedirect}
        onClick={() => {
          if (!redirectUrl || !tempToken) return;
          const u = new URL(redirectUrl);
          u.searchParams.set("tempToken", tempToken);
          u.searchParams.set("provider", "mock");
          u.searchParams.set("status", "approved");
          window.location.assign(u.toString());
        }}
        style={{
          marginTop: 16,
          padding: "10px 12px",
          borderRadius: 10,
          border: "none",
          background: canRedirect ? "#111827" : "#9CA3AF",
          color: "#fff",
          cursor: canRedirect ? "pointer" : "not-allowed",
        }}
      >
        Approve
      </button>
    </main>
  );
}
