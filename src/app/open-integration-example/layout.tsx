export const dynamic = "force-dynamic";

export default function OpenIntegrationExampleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Intentionally minimal: this is meant to be embedded in an iframe and/or rendered by Puppeteer.
  return (
    <div
      style={{
        margin: 0,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
