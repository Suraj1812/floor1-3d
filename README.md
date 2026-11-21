# Floor 1

An interactive 3D room design by **Suraj Rajput**.

A 12 × 12 ft bedroom and workspace with a dusty blue L-shaped sofa, anime feature wall, neutral frames below the AC, exposed gatar-patiya ceiling, wardrobe, bedside drawers, charging point, detailed PC setup, laptop holder and an adjustable TV-style screen.

## Run locally

Requires Node.js 20 or newer. No runtime packages or API keys are needed.

```sh
npm run check
npm run dev
```

Open the local URL printed by the server. Drag to look around, scroll or pinch to zoom, or choose a view from the compact toolbar. Icons control rotation, zoom, lighting and the fan. Open settings for sofa color, the zoom slider and TV tilt. Preferences are saved in the current browser.

## Build and deploy

```sh
npm run build
npm run preview
```

The output is `dist/`. Import this repository into Vercel with the **Other** framework preset. The included `vercel.json` sets the build command and output directory automatically. No environment variables are required.

The site is fully static. Three.js 0.160.1 is vendored under `vendor/`, and the supplied anime image is stored locally under `assets/`, so production rendering does not depend on a CDN or a chat application.

## Source

- `src/app.js`: geometry, materials, lights, camera and interactions.
- `src/room-markup.html`: controls and scene mount.
- `src/room.css`, `src/site.css`: responsive layout.
- `src/state.js`: browser-local preference storage.
- `scripts/build.mjs`: portable static build.

The room is a design visualization; furniture proportions and ceiling construction are approximate. The TV is an interactive model, not an actual streaming client.

## Third-party assets

Three.js is distributed under its MIT license, included in `vendor/THREE-LICENSE.txt`. Anime wall artwork was supplied as a design reference and remains the property of its respective rights holders.
