# Floor 1

An interactive 3D first-floor design by **Suraj Rajput**.

A 12 × 12 ft bedroom and workspace with a dusty blue L-shaped sofa, anime feature wall, neutral frames below the AC, simple off-white PVC ceiling, wardrobe, bedside drawers, charging point, detailed PC setup, laptop holder and an adjustable TV-style screen.

## Run locally

Requires Node.js 20 or newer. No runtime packages or API keys are needed.

```sh
npm run check
npm run dev
```

Open the local URL printed by the server. Each load starts at the center of the completed back room at maximum zoom-out. The canvas uses icon-only controls without room labels or instruction overlays. Drag the circular directional buttons to walk, or use WASD / arrow keys; drag the scene to look around. Walk through the existing door into the passage, stairs, WC and shower/wash area, front lounge and empty balcony (flooring and railing only). The view selector includes room shortcuts, whole-floor overview and top view. Scroll or pinch to zoom. Icons control rotation, zoom, lighting and the fan. Open settings for sofa color, the zoom slider and TV tilt. Preferences are saved in the current browser.

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

The new areas follow the supplied floor sketch with assumed 12 ft width, 14 ft service/passage zone, 12 ft front room and 4 ft balcony. The front room uses solid plaster masonry, a paneled timber balcony door, one grilled window with cotton curtains, a deep stone sill and a projecting chajja. Local surface maps add plaster grain, vitrified tile variation, woven upholstery and granite stair treads; the empty balcony uses anti-skid tiles. Dedicated daylight and warm fittings light the extension, with a simple neighboring roofscape visible from the front. The existing back-room furnishings and finishes are preserved. An open slab reveals the ground-to-first stair flights, with treads, risers, landing and guardrails; there is no ground-floor or second-floor furnished interior. The back room has a flat warm off-white PVC finish beneath its gatar-patiya, with fine panel joints, six warm recessed downlights and a shallow perimeter tray with soft cove lighting. The other spaces retain exposed gatar-patiya ceilings, with clear headroom above the stairwell. The front lounge has an animated three-blade ceiling fan controlled together with the existing fan. Exterior exploration remains at first-floor level.

The room is a design visualization; furniture proportions and ceiling construction are approximate. The TV is an interactive model, not an actual streaming client.

## Third-party assets

Three.js is distributed under its MIT license, included in `vendor/THREE-LICENSE.txt`. Anime wall artwork was supplied as a design reference and remains the property of its respective rights holders.

Anime decor is isolated from the reference photo at runtime so the continuous peach plaster and scene lighting show between frames, swords and shelves, without a rectangular photo backdrop.

Phones and narrow screens use direct antialiased lighting and soft contact shadows, avoiding precision-sensitive shadow maps and depth-based postprocessing that can cause diagonal bands on mobile GPUs. Desktop retains its shadow and ambient-occlusion pass.

Movement uses four fixed arrow buttons: tap for a small step, hold to walk, or focus a button and press Enter/Space. Drag the scene to look; WASD and keyboard arrows remain available. Movement stops on release, cancellation, a view change or loss of focus.


The desk is lamp-free, with a staggered compact keyboard, larger modifier keys, spacebar and printed legends, plus a sculpted wireless mouse with separate buttons, wheel and side controls. The wall accessories organizer has been removed.

The main monitor follows the supplied curved Samsung-style reference, with a genuinely curved screen and shell, slim black bezels, a cylindrical neck and round base; it tilts backward 10 degrees. A silver MacBook Air M2-style model on the stand has black keys, a large trackpad, a notched display and the M2 Air port layout. The MacBook retains its calm macOS-inspired landscape desktop, menu bar and dock. The PC monitor has a separate Windows-style blue silk wallpaper, full-width taskbar and dark coding window.

The PC tower sits beneath the far end of the desk on a low riser, with cables routed behind the desk and the central chair space kept clear.

The curved monitor is turned sideways 15 degrees while retaining its backward tilt. A black and muted red racing-style gaming chair replaces the office chair, with a shaped high back, headrest and lumbar cushions, seat bolsters, adjustable armrests, recline hardware and twin-wheel casters.

An interactive wall switchboard beside the desk has separate ceiling, cove, fan and desk-power rockers, two three-pin outlets and USB-A/USB-C ports. Tap the 3D rockers or use Room settings for lights and desk power; the fan toolbar stays synchronized. Circuit preferences persist locally. Desk power switches the monitor and TV display; the MacBook remains on battery.
