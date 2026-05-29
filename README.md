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
- **Track** — pick a day, log weight + reps for each set, check sets off, and
  save the session. A live progress bar fills as you complete sets, and a
  **glowing rest timer** auto-starts (with the right rest length) every time
  you check off a set — with skip / pause / ±15s controls and a finish beep.
  Tap an exercise title to open its how-to detail.
- **Progress** — pick any exercise to see your estimated 1-rep-max trend
  (Epley formula), best ever, change since you started, and full history.

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
