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

## Focus Mode

On the **Track** tab, tap **▶ Start Focus Mode** for a distraction-free,
one-set-at-a-time guided flow: it shows the current exercise, its cues and an
optional tutorial video, takes your weight/reps, fires the rest timer, and
advances to the next set. Finish the last set and it saves the session for you.

## Install it as an app (PWA)

The app is a installable PWA: on your phone use **Share → Add to Home Screen**
(or your browser's Install prompt on desktop) to get a real icon and a
full-screen, **offline-capable** app — a service worker caches the whole app,
your routine, and your data, so it loads with no connection. (Embedded YouTube
videos still need internet.)

## Personal records

Beat a previous best estimated-1RM or top weight on any lift and you get a
confetti celebration on save. The **Progress** tab also shows a 🏆 records wall
of your best est. 1RM per exercise.

## Today + auto week

The **Routine** tab opens with a "Today" card that knows the schedule
(Mon Upper A · Tue Lower A · Wed mobility · Thu Upper B · Fri Lower B · weekend
rest) and offers a one-tap **Start today's workout**. On the **Track** tab you
can flip on **Auto-advance by date**: set your program start and the week +
phase compute themselves on a 9-week cycle (8 weeks + a deload), so you never
set the week manually again.

## Body tab

Log your **bodyweight** (plus optional waist/arms/chest/thighs) with a trend
chart, latest/change stats, and history — so you're tracking the actual goal,
not just the lifts.

## Session journal

When you save a workout you can tag **how it felt** (😫→🔥) and jot a note.
Recent sessions show up as a journal on the **Progress** tab.

## Workout quote

A famous quote + author shows on the **Today** card, the top of the **Track**
tab, and the first screen of **Focus Mode**. It's one quote per day (changes
daily, stable through the day). Edit or add your own in the `QUOTES` block at
the bottom of `routine.js`.

## Timed notifications

On the **Routine** tab, a 🔔 **Reminders** card lets you turn on:
- a **daily training reminder** at a time you pick (only on training days), and
- a **post-workout refuel alert** N minutes after you finish.

Where the browser supports the **Notification Triggers API** (Chromium /
installed PWA), these fire even when the app is closed. Elsewhere (incl. iOS),
they fire while the app is open or recently active, and the daily one nudges
you on open if it's past time and you haven't trained — so add the app to your
Home Screen for the most reliable alerts.

## Fuel reminders

The **Track** tab shows a **pre-workout fuel card** before you lift, and after
you save a session a **post-workout refuel reminder** pops up (Window 3, within
60 min, protein first). Each day shows **one** food suggestion and one
nutrition quote (they change daily, stable through the day). Edit the
suggestions in `FUEL` and the quotes in `FUEL_QUOTES` at the bottom of
`routine.js`.

## Themes

Tap the pill in the top-right to cycle color schemes — **Aurora**, **Solar**,
**Matrix**, and **Vapor**. Your choice is remembered. The whole UI (including
the progress chart) retints to match. Animations respect
`prefers-reduced-motion`.

## Your data & backups

Your log lives in the browser (localStorage), with three layers of defense so a
cleared cache never loses your history:

1. **Auto-backup to IndexedDB** — every save is mirrored into IndexedDB (which
   browsers clear far less aggressively than localStorage). If localStorage is
   ever wiped, the app restores silently on next load and shows a
   "Restored from backup" toast.
2. **Weekly Sunday nudge** — the first time you open the app on a Sunday, a
   banner offers a one-tap export (or snooze 24h). It won't pester once you've
   backed up that day.
3. **Save to iCloud / Restore from iCloud** — the footer buttons write and read
   a backup file you choose (point it at
   `iCloud Drive/ZETTLE A- PERSONAL/Fitness Backups/` once and both reuse that
   same file). **Restore from iCloud** reads it back in one tap (asking before
   it overwrites existing data). On iOS Safari, save falls back to the share
   sheet (Save to Files → iCloud Drive) and restore opens the file picker.

Exports are versioned (`"schema_version": 1`) and named with the date and
program week, e.g. `zettle-fitness-2026-05-29-week3.json`. The footer shows
**"Last backup: N days ago"** so the system is visible, not invisible-until-it-
fails. **Import data** accepts both the new versioned files and older plain
exports. Nothing is uploaded to any server.

## Editing your routine

Open `routine.js` — it's the only file you need to touch. Each day is a list
of exercises with `name`, `sets`, `reps`, and optional `rest`, `rir`, `note`.
Change the numbers, add/remove exercises, or add a whole new day, and the app
updates automatically.
