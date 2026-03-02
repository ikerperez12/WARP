# WARP Gaming Visual Professionalization Handoff

## Goal

Bring `gaming.html` to a visual quality level that feels intentionally authored and comparable in craft to Bruno Simon's portfolio runtime, while preserving the current gameplay loop, UI flow, asset pipeline, and compatibility fixes already in place.

This document is written so another coding agent can continue the visual pass without rediscovering the runtime constraints.

## Current Status

The game is now functionally stable and locally validated.

Validated:

- `npm test` passes
- `npm run build` passes
- local preview loads and enters gameplay
- the player vehicle now renders as a coherent car instead of floating wheels

Recently fixed:

- `folio2019` vehicle and prop assets are effectively `z-up`; they now instantiate correctly
- the vehicle no longer forces the broken `cybertruck` asset set
- optional scenery can preload before world boot in full-quality mode
- Boot Relay has a denser authored spawn composition
- ground treatment is no longer just a flat solid plane

## Files That Matter Most

### Runtime Composition

- [GameWorld.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/world/GameWorld.js)
- [assets.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/world/assets.js)
- [materials.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/world/materials.js)
- [props.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/world/props.js)
- [camera.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/systems/camera.js)

### Vehicle

- [vehicle.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/entities/vehicle.js)
- [vehicle.test.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/entities/vehicle.test.js)

### Local Debug / Boot

- [gaming.js](/C:/Users/ijpg1/projects/WARP/src/gaming.js)
- [diagnose-gaming.mjs](/C:/Users/ijpg1/projects/WARP/scripts/diagnose-gaming.mjs)
- [capture-gaming-visuals.mjs](/C:/Users/ijpg1/projects/WARP/scripts/capture-gaming-visuals.mjs)

### Original Reference Source

These are the most relevant original files inside `personal/modelos`:

- [Car.js](/C:/Users/ijpg1/projects/WARP/personal/modelos/javascript/World/Car.js)
- [Objects.js](/C:/Users/ijpg1/projects/WARP/personal/modelos/javascript/World/Objects.js)
- [Tiles.js](/C:/Users/ijpg1/projects/WARP/personal/modelos/javascript/World/Tiles.js)
- [Area.js](/C:/Users/ijpg1/projects/WARP/personal/modelos/javascript/World/Area.js)
- [CrossroadsSection.js](/C:/Users/ijpg1/projects/WARP/personal/modelos/javascript/World/Sections/CrossroadsSection.js)
- [IntroSection.js](/C:/Users/ijpg1/projects/WARP/personal/modelos/javascript/World/Sections/IntroSection.js)

## Non-Obvious Constraints

### 1. `folio2019` assets are `z-up`

This is the most important gotcha.

The current fix is in [assets.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/world/assets.js):

- paths under `/gaming-assets/folio2019/` get `scene.userData.warpUpAxis = 'z'`
- `instantiateAsset()` wraps the cloned scene and rotates it when `upAxis === 'z'`

Do not remove that unless you replace the whole asset pipeline.

### 2. The `cybertruck` set is still not trustworthy

Even though the runtime no longer breaks on it, the good in-game result currently comes from preferring the `default` car set.

Vehicle selection logic lives in [vehicle.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/entities/vehicle.js):

- `measureRenderableAsset()`
- `isRenderableVehicleAsset()`
- `resolveVehicleAssetSet()`

If you want the cybertruck back, first inspect and re-author that asset set.

### 3. Optional scenery has two modes

In [assets.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/world/assets.js):

- compatibility mode can still lazy-load optional scenery
- full-quality mode uses `preloadOptional: !this.compatibility`

This is deliberate. Visual work should preserve that distinction.

### 4. Local-only runtime inspection exists

In [gaming.js](/C:/Users/ijpg1/projects/WARP/src/gaming.js), the app exposes:

- `window.__warpApp`

Only on:

- `localhost`
- `127.0.0.1`

Use it for Playwright-side inspection. Do not expand it to production.

## What Still Looks Weak

The runtime is no longer broken, but it is not yet at “Bruno-level craft”.

Main gaps:

1. Sector composition is still too radial and too open.
2. Corridors feel assembled, not authored.
3. Floor treatment is better, but still lacks the material richness and bespoke local detail of the original.
4. The car is now readable, but not hero-grade.
5. There is not enough vertical framing and boundary language around the player.
6. The scene still lacks enough medium-scale objects close to the camera.

## Highest-Impact Next Tasks

### A. Replace generic sector emptiness with authored boundaries

Target file:

- [GameWorld.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/world/GameWorld.js)

Do next:

- add fence/riser/border language around each sector, inspired by [Area.js](/C:/Users/ijpg1/projects/WARP/personal/modelos/javascript/World/Area.js)
- create repeated half-height edge pieces so the player is always near geometry
- treat sectors like contained spaces, not isolated discs in a giant plane

Acceptance:

- in the first 10 seconds of gameplay, the camera should always see nearby foreground geometry besides the car

### B. Author corridor tile trails instead of only luminous strips

Reference:

- [Tiles.js](/C:/Users/ijpg1/projects/WARP/personal/modelos/javascript/World/Tiles.js)

Do next:

- use `tileA` through `tileE` more aggressively in road paths and transitions
- create pseudo-random but controlled tiling along the main connections
- avoid perfectly clean lanes

Acceptance:

- every major route should read as a path made of pieces, not a flat abstract lane

### C. Turn Boot Relay into a showcase scene

Target:

- `if (sector.id === 'boot-relay')` block in [GameWorld.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/world/GameWorld.js)

Do next:

- add one or two memorable hero props close to the spawn
- improve framing so the player immediately sees hierarchy: landmark, route, objective
- if needed, place more original `intro` props from `personal/modelos`

Acceptance:

- a first screenshot should already feel like a crafted scene, not a debug arena

### D. Upgrade the vehicle from “working” to “hero object”

Target:

- [vehicle.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/entities/vehicle.js)

Do next:

- stronger paint/material separation
- dedicated emissive headlight/rear-light treatment
- better antenna integration or replace it entirely
- consider adding windshield tint, rim treatment, and bumper accents manually

Acceptance:

- the car should remain readable against the floor in dark theme
- wheel/body relationship should feel intentional in both side and 3/4 views

### E. Improve camera taste, not just math

Target:

- [camera.js](/C:/Users/ijpg1/projects/WARP/src/features/gaming/systems/camera.js)

Current camera is technically fine. The next pass should be artistic:

- slightly lower perspective in vehicle mode
- stronger parallax against nearby props
- better framing in spawn and during sector transitions

Acceptance:

- screenshots should show scale from nearby silhouettes, not only from HUD and signage

## Suggested Work Order For Another AI

1. Run local preview.
2. Run automated capture:
   - `npm run capture:gaming -- http://127.0.0.1:4173/gaming.html artifacts/gaming-captures`
3. Review:
   - `artifacts/gaming-captures/01-start.png`
   - `artifacts/gaming-captures/02-live.png`
   - `artifacts/gaming-captures/03-drive.png`
4. Improve only one visual area at a time:
   - spawn composition
   - corridors
   - vehicle
   - sector boundaries
5. Re-run captures after every pass.
6. Keep `npm test` and `npm run build` green after each pass.

## Practical Validation Commands

### Fast checks

```powershell
node --check src\features\gaming\world\GameWorld.js
node --check src\features\gaming\world\assets.js
node --check src\features\gaming\entities\vehicle.js
```

### Full checks

```powershell
npm test
npm run build
```

### Visual QA

Start preview:

```powershell
npm run preview -- --host 127.0.0.1 --port 4173
```

Then capture:

```powershell
npm run capture:gaming -- http://127.0.0.1:4173/gaming.html artifacts/gaming-captures
```

## Do Not Regress

- compatibility/runtime fixes for WebGL boot
- `three@0.162.0` compatibility choice
- asset fallback behavior
- local-only `window.__warpApp`
- current tests

## Definition Of “Good Enough To Integrate”

Before merging the final visual pass, all of these should be true:

1. The first live screenshot reads as a crafted scene.
2. The car looks intentional, not incidental.
3. The player is rarely surrounded by empty floor.
4. Each sector has a distinct silhouette at a glance.
5. Corridors and routes feel built from actual objects/materials.
6. `npm test` and `npm run build` remain green.

## Claude Code Prompt Starter

Use this as the handoff prompt:

```text
Continue the visual professionalization of WARP's gaming runtime.

Read:
- docs/gaming-visual-professionalization-handoff.md
- src/features/gaming/world/GameWorld.js
- src/features/gaming/world/assets.js
- src/features/gaming/entities/vehicle.js

Constraints:
- keep gameplay and compatibility fixes intact
- keep tests/build green
- preserve local-only debug exposure in src/gaming.js
- use automated captures after each visual pass

Primary target:
- make the world feel authored and dense like Bruno Simon's portfolio, especially in Boot Relay and the main corridors

Start by improving sector boundaries and corridor composition before changing UI.
```
