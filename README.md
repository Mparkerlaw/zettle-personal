# The Foundation — Workout App

A simple, offline web app for the "Foundation" 8-week hypertrophy program
(kettlebells + bands, 4 days/week). Built with plain HTML/CSS/JS — no build
step, no install, no internet required.

## Run it

Just open `index.html` in any browser (double-click it, or drag it into a
browser tab). Works on phone and desktop.

To run a tiny local server instead (optional):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## What it does

- **Routine** — your full program: every day, exercise, sets × reps, rest,
  RIR target, and cues, plus the 3-phase progression table. **Tap any
  exercise** for a detail card: target muscles, sets/reps/rest/RIR,
  step-by-step form cues, and a one-tap link to how-to videos on YouTube.
  exercise, and a one-tap link to how-to videos on YouTube. Most exercises
  also **embed a video tutorial** right in the card.
- **Track** — pick your **program week** (1–8 or Deload) and the set counts +
  target RIR adjust automatically to the right phase. Pick a day, log weight +
  reps for each set, check sets off, and save. Weights are **pre-filled from
  your last session** (last reps show as a hint). A live progress bar fills as
  you complete sets, and a **glowing rest timer** auto-starts every time you
  check off a set — with skip / pause / ±15s controls and a finish beep.
- **Progress** — a **week-streak / this-week / total** summary and a
  **training calendar** of the last 9 weeks, plus per-exercise estimated
  1-rep-max trend (Epley), best ever, change since you started, and history.

### A note on the embedded videos

The tutorial videos were auto-sourced. If any one is the wrong exercise or
unavailable, just open `routine.js` and change that exercise's `videoId` to a
different YouTube ID (the part after `watch?v=`), or remove the field to fall
back to the "search YouTube" button. There's a "Find more tutorials" link in
every exercise card too.

## Themes

Tap the pill in the top-right to cycle color schemes — **Aurora**, **Solar**,
**Matrix**, and **Vapor**. Your choice is remembered. The whole UI (including
the progress chart) retints to match. Animations respect
`prefers-reduced-motion`.

## Your data

Everything you log is stored **only in your browser** (localStorage) — nothing
is uploaded anywhere. Use **Export data** in the footer to download a backup
JSON file, and **Import data** to restore it (e.g. on another device/browser).

## Editing your routine

Open `routine.js` — it's the only file you need to touch. Each day is a list
of exercises with `name`, `sets`, `reps`, and optional `rest`, `rir`, `note`.
Change the numbers, add/remove exercises, or add a whole new day, and the app
updates automatically.
