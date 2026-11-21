# Tideglass Observatory — Spot the Difference

[![Play the game](https://img.shields.io/badge/play-Tideglass%20Observatory-274b63)](https://github.com/Aldo1q/spot-the-difference-game)
[![make.fun bounty](https://img.shields.io/badge/make.fun-best%20spot%20the%20difference%20game-c9973f)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![Repository](https://img.shields.io/badge/GitHub-Aldo1q%2Fspot--the--difference--game-24292f)](https://github.com/Aldo1q/spot-the-difference-game)

A clockwork observatory above a flooded night city. Two near-identical
panels side by side — find what the tide, the gears and the stars changed.

Entered in the make.fun bounty
[best-spot-the-difference-game-20261121-0451](https://make.fun/c/best-spot-the-difference-game-20261121-0451).

## How to play

- Open the district map and pick an unlocked scene.
- Compare the ORIGINAL (left) and ALTERED (right) panels and click a
  difference in either panel. Found differences get a green marker on both.
- The counter in the top bar always shows how many remain.
- Each scene hides exactly 7 differences. There are 12 scenes and 84
  differences in all, across 3 districts: The Brass Dome, The Flooded
  Arcade and The Star Terrace. Clearing a scene unlocks the next.
- Beat the per-scene timer (150–210 seconds). A miss costs 5 seconds and
  25 points, resets your streak, and every third miss costs a life — you
  have 3 lives per scene.
- Finds score 100 points times a streak multiplier (up to x2). Clearing a
  scene adds a time bonus and a lives bonus and earns 1–3 stars.
- Stuck? A hint (3 per scene, −150 points) pulses a gold ring around one
  remaining difference.
- Zoom 1x–2.5x with the mouse wheel or the +/− buttons, drag to pan, pan
  with the arrow keys. Keyboard: H hint, P pause, M mute, R restart.
- Best scores and stars per scene are saved in your browser.

## Features

- 12 hand-authored scenes × 7 differences = 84 differences: objects
  removed or appearing, colour shifts, mirrored objects, and detail swaps —
  clock hands, gear teeth, bottle fill levels, candle heights, telescope
  tilts, compass needles, lit and unlit lanterns, steam, leaf and star
  counts.
- All art is procedural canvas drawn from scene data, so both panels and
  the difference map are exact by construction; no image files.
- WebAudio synth sound effects and ambience — no audio files either.
- District progress map with unlocks, win / lose / pause / campaign
  victory screens, and deterministic screenshot staging via `?shot=`.

## Run it

```sh
node serve.ts          # serves game/ at http://localhost:8080
```

Hand the entry in (Node 22, standard library only):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
