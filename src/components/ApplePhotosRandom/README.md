# Apple Photos (Random)

Renders a random image from a **public iCloud Shared Album** (Apple Photos).

## Usage

Open the route:

- `/apple-photos-random?albumUrl=<SHARED_ALBUM_URL>`

Where `<SHARED_ALBUM_URL>` is the public share link you get from Photos (e.g. `https://www.icloud.com/sharedalbum/#...`).

Optional query params:

- `refreshSeconds=3600` — auto-refresh (0 disables)
- `fit=cover|contain` — image fitting (default: `cover`)
- `showCaption=true` — show caption/date overlay

You can also configure a default album via env var:

- `APPLE_PHOTOS_SHARED_ALBUM_URL="https://www.icloud.com/sharedalbum/#..."`

Optional (advanced): if your deployment blocks the shard-probing fallback or you want faster cold starts, you can pin the sharedstreams origin:

- `APPLE_PHOTOS_SHAREDSTREAMS_ORIGINS="https://p44-sharedstreams.icloud.com,https://p101-sharedstreams.icloud.com"`

## Notes / limitations

Apple does not provide an official public API for shared albums. This integration resolves the underlying JSON endpoints used by iCloud Web and may break if Apple changes them.

If you hit errors, confirm:

- The album is set to **Public Website**.
- The share link is correct.
- Your deployment allows outbound HTTPS requests to `www.icloud.com` and `pXX-sharedstreams.icloud.com`.
