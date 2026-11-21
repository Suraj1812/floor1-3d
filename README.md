# Floor 1

An interactive 3D first-floor design by **Suraj Rajput**.

A 12 × 12 ft bedroom and workspace with a dusty blue L-shaped sofa, anime feature wall, neutral frames below the AC, exposed gatar-patiya ceiling, wardrobe, bedside drawers, charging point, detailed PC setup, laptop holder and an adjustable TV-style screen.

## Run locally

Requires Node.js 20 or newer. No runtime packages or API keys are needed.

```sh
npm run check
npm run dev
```

Open the local URL printed by the server. Each load starts at the center of the completed back room. Drag the circular joystick to walk, or use WASD / arrow keys; drag the scene to look around. Walk through the existing door into the passage, stairs, WC and shower/wash area, front lounge and empty balcony (flooring and railing only). The view selector includes room shortcuts, whole-floor overview and top view. Scroll or pinch to zoom. Icons control rotation, zoom, lighting and the fan. Open settings for sofa color, the zoom slider and TV tilt. Preferences are saved in the current browser.

## Build and deploy

```sh
npm run build
npm run preview
```

The output is `dist/`. Import this repository into Vercel with the **Other** framework preset. The included `vercel.json` sets the build command and output directory automatically. No environment variables are required.

The site is fully static. Three.js 0.160.1 is vendored under `vendor/`, and the supplied anime image is stored locally under `assets/`, so production rendering does not depend on a CDN or a chat application.

## Source

- `src/app.js`: original back-room geometry, materials, lights, walkthrough camera and interactions.
- `src/floor-extension.js`: added stairs, Western WC, wash/shower, front lounge and empty balcony (flooring and railing only).
- `src/room-markup.html`: controls and scene mount.
- `src/room.css`, `src/site.css`: responsive layout.
- `src/state.js`: browser-local preference storage.
- `scripts/build.mjs`: portable static build.

The new areas follow the supplied floor sketch with assumed 12 ft width, 14 ft service/passage zone, 12 ft front room and 4 ft balcony. The front room uses solid plaster masonry, a paneled timber balcony door, one grilled window with cotton curtains, a deep stone sill and a projecting chajja. Local surface maps add plaster grain, vitrified tile variation, woven upholstery and granite stair treads; the empty balcony uses anti-skid tiles. Dedicated daylight and warm fittings light the extension, with a simple neighboring roofscape visible from the front. The existing back-room furnishings and finishes are preserved. The ground-floor stair is an entry reference; there is no ground-floor or second-floor interior. Exterior exploration remains at first-floor level.

The room is a design visualization; furniture proportions and ceiling construction are approximate. The TV is an interactive model, not an actual streaming client.

## Third-party assets

Three.js is distributed under its MIT license, included in `vendor/THREE-LICENSE.txt`. Anime wall artwork was supplied as a design reference and remains the property of its respective rights holders.
