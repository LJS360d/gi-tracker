# Gi-Tracker

Web app that shows a delayed GPS track on a map so people can follow a traveler’s route without seeing real-time position. Built for 2G devices that send position in bursts.

## What it does

- **Public map**: One page with a dark map and the track, always delayed (e.g. 48-72h). No live position.
- **Traveler**: Can turn sharing on/off and set the delay; changes apply when the device next syncs.
- **Family**: Token-protected access to a closer (but still delayed) position.
- **Device**: Sends batched GPS points when it has connectivity; pulls a simple config file from the server.

## Tech stack

- [Astro](https://start.solidjs.com), Solidjs and astro:db integrations, TailwindCSS v4, Leaflet (CartoDB Dark Matter), PWA.
- Runtime: **Bun** (Node >=22 also supported).

## Setup

```bash
bun install
```

Copy `.env.development` to `.env.development.local` and set the variables (see below).

## Develop

```bash
bun run dev
```

Open the URL shown in the terminal (e.g. `https://localhost:3000`).

## Build and run

```bash
bun run build
bun run start
```

## Env

- `ASTRO_DATABASE_FILE` (for local development)
  - `ASTRO_DB_REMOTE_URL` (for managed remote libSQL compliant DB, Turso)
  - `ASTRO_DB_APP_TOKEN`
- `ADMIN_ACCESS_TOKEN`
- `UPLOAD_DIR`
- `INGEST_TOKEN`
