import Link from "next/link";

export const dynamic = "force-dynamic";

export default function OpenIntegrationExampleIndex() {
  return (
    <main style={{ padding: 16, lineHeight: 1.4 }}>
      <h1 style={{ margin: "0 0 8px" }}>Open Integration Example</h1>
      <p style={{ margin: 0 }}>
        This route hosts a demo “plugin provider” (manifest + settings + render)
        for the WireWire open integration system.
      </p>

      <ul style={{ marginTop: 16 }}>
        <li>
          Manifest:{" "}
          <Link href="/open-integration-example/config.json">
            /open-integration-example/config.json
          </Link>
        </li>
        <li>
          Settings UI:{" "}
          <Link href="/open-integration-example/settings">
            /open-integration-example/settings
          </Link>
        </li>
        <li>
          Render page:{" "}
          <Link href="/open-integration-example/render">
            /open-integration-example/render
          </Link>
        </li>
      </ul>
    </main>
  );
}
