# Open Integration

This document describes the **Open Integration** system used by paperlesspaper and how to build a compatible **plugin provider** (manifest + settings UI + render page).

A working reference implementation ships in this repo under:

- `src/app/open-integration-example/config.json/route.ts` (manifest)
- `src/app/open-integration-example/settings/page.tsx` (settings iframe)
- `src/app/open-integration-example/render/page.tsx` (render target)
- `src/app/open-integration-example/auth/page.tsx` (optional mock OAuth helper)

---

## Terminology

- **Host app**: the paperlesspaper where users install/configure integrations.
- **Plugin provider**: your web app/server that hosts the integration.
- **Manifest**: JSON document describing the provider (install URL).
- **Settings page**: a web page embedded as an iframe inside the host app.
- **Render page**: a web page opened by a renderer (Puppeteer) and screenshot for ePaper.

---

## Overview

An Open Integration plugin provider exposes three things:

1. **Manifest** (install URL)
   - A public URL returning a JSON manifest.
   - Must be fetchable from the host app browser.

2. **Render page** (can be any website, Puppeteer target)
   - Opened by the renderer.
   - Receives its runtime payload via `window.postMessage`.
   - Produces a stable layout for screenshotting.

3. **Settings page** (iframe, optional)
   - Hosted in an iframe in the host app.
   - Uses `window.postMessage` to exchange settings and optional redirect/auth payloads.

---

## 1) Manifest (config URL)

### Required fields

The host expects at least:

- `name: string`
- `version: string`

### Optional fields

- `description?: string`
- `icon?: string` (absolute URL)
- `nativeSettings?: Record<string, any>`
  - Treated as **defaults** by the host app.
  - Applied only if the host-side value is currently `undefined`.
- `formSchema?: JsonSchema` (a small subset of JSON Schema)
- `settingsPage?: string` (absolute URL)
- `renderPage?: string` (absolute URL)

### Example manifest

```json
{
  "name": "My Integration",
  "version": "1.0.0",
  "description": "Shows a thing",
  "icon": "https://example.com/icon.png",
  "nativeSettings": {
    "orientation": "portrait"
  },
  "formSchema": {
    "type": "object",
    "required": ["apiKey"],
    "properties": {
      "apiKey": {
        "type": "string",
        "description": "API key for Example"
      },
      "refreshSeconds": {
        "type": "integer",
        "description": "Refresh interval",
        "minimum": 60,
        "maximum": 86400,
        "default": 900
      },
      "tags": {
        "type": "array",
        "description": "Optional tags",
        "items": { "type": "string" },
        "default": []
      }
    }
  },
  "settingsPage": "https://example.com/my-plugin/settings",
  "renderPage": "https://example.com/my-plugin/render"
}
```

### JSON Schema support (host-side)

The host uses `formSchema` to render a simple schema-driven form. Supported property types:

- `string` (`enum` supported)
- `boolean`
- `number` / `integer`
- `array` of `string`

“Required” can be expressed in two ways:

- Standard: `schema.required: string[]`
- Non-standard convenience: `property.required: true`

Defaults:

- If `default` is provided, the host applies it once (when the field is `undefined`).
- Otherwise the host initializes:
  - `array` → `[]`
  - `boolean` → `false`
  - everything else → `""`

### CORS requirements

The host fetches the manifest from the browser. Your config URL should:

- respond to `GET`
- ideally respond to `OPTIONS`
- include CORS headers (at minimum `Access-Control-Allow-Origin`)

The example in this repo uses:

- `Access-Control-Allow-Origin: <echo Origin> | *`
- `Access-Control-Allow-Methods: GET,OPTIONS`
- `Vary: Origin` when echoing

If you need credentials/cookies, you must echo the caller origin and send `Access-Control-Allow-Credentials: true`.

---

## 2) Settings page (iframe)

The settings UI runs inside an iframe in the paperlesspaper app and allows more advanced UI and customizations.

It communicates with the app via a message protocol.

### Message protocol

The preferred protocol is a structured envelope.

#### Host → Plugin

```ts
type OpenIntegrationAppToPluginMessage =
  | {
      source: "wirewire-app";
      type: "INIT";
      payload: {
        settings: Record<string, any>;
        nativeSettings: Record<string, any>;
        device: { deviceId?: string; kind?: string };
        app: { language?: string };
      };
    }
  | {
      source: "wirewire-app";
      type: "REDIRECT";
      payload: {
        redirectUrl: string;
        tempToken: string;
      };
    };
```

- `INIT` is sent after the iframe loads.
- `REDIRECT` is optional and may arrive later. It is used to support OAuth-like flows.

#### Plugin → Host

```ts
type OpenIntegrationPluginToAppMessage =
  | {
      source: "wirewire-plugin";
      type: "UPDATE_SETTINGS";
      payload: Record<string, any>; // patch (merge)
    }
  | {
      source: "wirewire-plugin";
      type: "SET_HEIGHT";
      payload: { height: number };
    }
  | {
      source: "wirewire-plugin";
      type: "INFO";
      payload: Record<string, any>;
    };
```

The host merges `UPDATE_SETTINGS` payloads into its stored settings object, that are saved in the "paper".

### Legacy compatibility messages

The host also supports the legacy messages below (and the example provider sends both):

- Plugin → Host settings patch:
  - `{ cmd: "message", data: { ...patch } }`
- Plugin → Host height:
  - `{ height: 520 }`

And the plugin may receive from older hosts/renderers:

- Host → Plugin init:
  - `{ cmd: "message", data: { ...payload } }`
- Host → Plugin redirect:
  - `{ cmd: "redirect", data: { redirectUrl, tempToken } }`

### Height / sizing

The host will size the iframe based on messages from the plugin.

Recommended approach:

- Compute `document.documentElement.scrollHeight`
- Clamp to a sane range (e.g. 240–1400)
- Post `SET_HEIGHT` whenever the layout changes

### Security recommendations

- Validate `event.origin` against your expected host origin once you’ve learned it.
- Reply to the specific `event.source` window with a strict `targetOrigin`.
- Avoid putting secrets directly into settings messages (treat them as user-controlled config).

---

## 3) Redirect / OAuth-style flows (optional)

If the host provides a `REDIRECT` payload, you can start an external auth flow.

1. Host sends `REDIRECT` with:
   - `redirectUrl`: where to send the user back to
   - `tempToken`: a short-lived token generated by the host

2. Plugin opens an auth URL (popup or new tab).

3. After success, the auth flow redirects back to `redirectUrl`.

### Passing results back

In memo-mono, the host looks for query params such as:

- `tempToken` (or `integrationTempToken`)
- `settings` (or `integrationSettings`) — a JSON string representing settings to merge

After redeeming the token, the host merges the provided settings and cleans the URL.

Practical notes:

- Keep the `settings` payload small (URL length limits).
- Consider encoding/escaping carefully; JSON should be valid and URL-encoded.

---

## 4) Render page (Puppeteer target)

The render page is opened by the renderer to take a screenshot.

### Incoming payload

At runtime, the page receives data via `window.postMessage`.

Legacy renderer format:

```js
{ cmd: "message", data: payload }
```

Newer envelope (optional):

```js
{ source: "wirewire-app", type: "INIT", payload }
```

A typical payload shape:

```ts
type RenderPayload = {
  settings?: Record<string, any>;
  nativeSettings?: Record<string, any>;
  device?: { deviceId?: string; kind?: string };
  app?: { language?: string };
  paper?: Record<string, any>;
};
```

### Rendering contract (loading markers)

To support reliable screenshot timing, follow the “Puppeteer rendering contract” used by paperlesspaper:

- Always include `#website-has-loading-element` (can be hidden)
- When fully ready, render `#website-has-loaded`

Example:

```html
<div id="website-has-loading-element" style="display:none"></div>
<div id="website-has-loaded">ready</div>
```

If you have real async loading, you can also temporarily show a loading marker (see the repo README for details).

---

## Local development & testing

### Run the example provider (this repo)

```bash
npm install
npm run dev
```

The example manifest is available at:

- `http://localhost:3001/open-integration-example/config.json`

### Install into memo-mono

1. Start this repo locally (default `http://localhost:3001`).
2. In memo-mono, open the **Integration Plugin** editor.
3. Install using the config URL:

`http://localhost:3001/open-integration-example/config.json`

---

## Implementation checklist (for your own provider)

- [ ] Host a manifest JSON at a stable public URL
- [ ] Add correct CORS headers for browser fetches
- [ ] Provide an iframe-friendly settings page that:
  - [ ] consumes `INIT`
  - [ ] emits `UPDATE_SETTINGS`
  - [ ] emits `SET_HEIGHT`
  - [ ] (optional) handles `REDIRECT`
- [ ] Provide a render page that:
  - [ ] listens for the payload via `postMessage`
  - [ ] renders a deterministic 100vw/100vh layout
  - [ ] exposes `#website-has-loaded`

---

## FAQ

### Do I need both `formSchema` and a settings page?

No. You can provide either:

- a schema-only integration (`formSchema` only), or
- an iframe settings integration (`settingsPage`), or
- both (common for simple + advanced settings).

### Where are settings stored?

In paperlesspaper, plugin settings are stored in the integration metadata and merged from schema defaults and iframe updates.

### Can my settings page be cross-origin?

Yes. The host iframe bridge validates origin when available, and you communicate via `postMessage`.
