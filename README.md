# Tideglass Observatory — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Aldo1q/spot-the-difference-game/rank.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Aldo1q/spot-the-difference-game/reward.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)

An original spot-the-difference game for the make.fun bounty
[best-spot-the-difference-game-20261121-0451](https://make.fun/c/best-spot-the-difference-game-20261121-0451):
**12 hand-crafted scenes, 84 differences, 3 districts** — a clockwork
observatory above a flooded night city. All artwork is drawn procedurally on
canvas from scene data, so the two panels are exact apart from the planted
differences. No libraries, no assets, no network — plain ES modules.

## The game

The Tideglass Observatory watches a city that sank politely: the streets are
canals now, and the keepers tend brass gears, orrery globes and harbour
lanterns from the rooftops. Every scene shows two near-identical pictures
side by side with **7 differences** of five kinds — an object removed, an
object added, a colour shifted, a detail swapped (a clock's hands, a bottle's
fill, a telescope's tilt, a gear's teeth) or a creature flipped around.

**Districts:** The Brass Dome (4 scenes) · The Flooded Arcade (4) · The Star
Terrace (4). Later districts raise the clock pressure and hide subtler swaps.

**Systems**

- **Timer** per scene (150–210 s) with a draining bar that turns red under 20 s
- **Lives** — three wrong guesses douse the lanterns; a miss also costs 5 s and 25 points
- **Hints** — 3 per scene, 150 points each, pulse the next difference for two seconds
- **Scoring with streaks** — 100 per find + streak bonus (up to +100) + time bonus; stars (1–3) per scene
- **Zoom & pan** — mouse wheel or ± buttons up to 2.5×, drag to pan, arrow keys nudge
- **Progress map** — 12 scenes across 3 districts, unlocks, per-scene stars and best scores, saved locally
- **Win / lose / pause screens**, restart, and a campaign victory screen with final score and star total
- **Sound** — WebAudio-synthesised find chimes that rise with your streak, mistake thuds, hint glissando, fanfares and a water-and-wind ambience; M mutes

## How to play

Click a difference in either picture. **H** hint · **P** / **Esc** pause ·
**M** mute · **R** restart scene · scroll to zoom, drag to pan.

## Run it

```sh
node serve.ts          # serves game/ at http://localhost:8080
```

Serve the `game/` folder with any static server and open `index.html`
(the game makes no network requests). Deterministic frames for screenshots:
`?shot=cover|map|zoom|win&seed=1` — see `shots.json`.

## Build the entry

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` + `screenshots/` to the output directory and writes
`dossier.json` via `vendor/makefun-game.ts`.

## Layout

- `game/index.html` + `game/style.css` — page, HUD and overlays
- `game/src/painter.js` — procedural art: 23 object painters, backdrops, found markers, hint pulses
- `game/src/scenes.js` — the 12 scenes and all 84 difference definitions
- `game/src/game.js` — engine: timer, lives, hints, streaks, scoring, zoom/pan, map progress
- `game/src/audio.js` — WebAudio synth sounds and ambience
- `game/src/main.js` — DOM wiring, input, render loop · `game/src/shots.js` — screenshot staging
- `screenshots/` — four real renders of the game in a browser (cover first)

---

Entered on [make.fun](https://make.fun/c/best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards
