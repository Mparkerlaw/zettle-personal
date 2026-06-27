/* =============================================================
   Workout app logic: routine display, exercise detail, tracking,
   rest timer, progress charts, and theme switching.
   Stores logged workouts + theme in localStorage. No libraries.
   ============================================================= */

const STORAGE_KEY = "workoutLog";
const THEME_KEY = "workoutTheme";
const WEEK_KEY = "programWeek";
const BODY_KEY = "bodyLog";
const START_KEY = "programStart"; // ISO date the program began
const WEEKMODE_KEY = "weekMode"; // "auto" (by date) | "manual"
const EQUIP_KEY = "equipMode"; // "home" (kettlebell/band) | "gym"
const THEMES = ["aurora", "solar", "matrix", "vapor"];
const THEME_LABELS = { aurora: "Aurora", solar: "Solar", matrix: "Matrix", vapor: "Vapor" };

// Weekly schedule: JS getDay() (Sun=0..Sat=6) -> day index in ROUTINE.days
const SCHEDULE = { 1: 0, 2: 1, 4: 2, 5: 3 }; // Mon→Upper A, Tue→Lower A, Thu→Upper B, Fri→Lower B
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function todaysDayIndex() {
  const d = SCHEDULE[new Date().getDay()];
  return d == null ? null : d;
}

/* ---------- equipment mode (home kettlebell/band vs gym) ---------- */
function getMode() {
  return localStorage.getItem(EQUIP_KEY) === "gym" ? "gym" : "home";
}
function setMode(m) {
  localStorage.setItem(EQUIP_KEY, m === "gym" ? "gym" : "home");
  mirrorToIDB();
}
function syncEquipToggle() {
  const m = getMode();
  document.querySelectorAll("#equip-toggle .equip-opt").forEach((b) => b.classList.toggle("active", b.dataset.mode === m));
}
function activeViewName() {
  const t = document.querySelector(".tab.active");
  return t ? t.dataset.view : "routine";
}
function equipTag(m) {
  return m ? `<span class="equip-tag">${m === "gym" ? "🏋️ Gym" : "🏠 Home"}</span>` : "";
}
function refreshActiveView() {
  const n = activeViewName();
  if (n === "routine") renderRoutine();
  else if (n === "track") renderTrack();
  else if (n === "progress") renderProgress();
  else if (n === "body") renderBody();
}
// Resolve an exercise's display fields for the current mode.
// The home name stays the canonical key for storage/history; only the
// displayed name/muscles/cues/video change in gym mode.
function exView(ex) {
  const g = ex.gym;
  if (getMode() === "gym" && g) {
    return {
      name: g.name || ex.name,
      muscles: g.muscles || ex.muscles,
      cues: g.cues || ex.cues,
      videoId: g.videoId || ex.videoId,
      video: g.name || ex.video || ex.name,
      reps: ex.reps,
      sets: ex.sets,
      rest: ex.rest,
      rir: ex.rir,
      note: ex.note,
    };
  }
  return {
    name: ex.name,
    muscles: ex.muscles,
    cues: ex.cues,
    videoId: ex.videoId,
    video: ex.video || ex.name,
    reps: ex.reps,
    sets: ex.sets,
    rest: ex.rest,
    rir: ex.rir,
    note: ex.note,
  };
}

// ----- backup / durability -----
const SCHEMA_VERSION = 1;
const BACKUP_DATE_KEY = "lastBackupDate"; // YYYY-MM-DD, drives the Sunday nudge
const LAST_BACKUP_AT = "lastBackupAt"; // ISO, any backup -> footer "X ago"
const ICLOUD_KEY = "lastICloudBackup"; // ISO, iCloud specifically
const SNOOZE_KEY = "backupSnoozeUntil"; // epoch ms
const NUDGE_SHOWN_KEY = "backupNudgeShownDate"; // YYYY-MM-DD, once per day
let pendingRestoreToast = false;

/* ---------- program week / phase ---------- */
// Stored week: 1..8 for the program, or 0 for a deload week.
// Auto mode computes the week from the start date on a 9-week cycle
// (8 program weeks + 1 deload), so it loops cleanly. 0 = deload week.
function computeWeekFromStart(startISO) {
  const start = new Date(startISO + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const days = Math.floor((now - start) / 86400000);
  if (isNaN(days) || days < 0) return 1;
  const idx = Math.floor(days / 7) % 9;
  return idx < 8 ? idx + 1 : 0;
}
function getWeek() {
  if (localStorage.getItem(WEEKMODE_KEY) === "auto") {
    const start = localStorage.getItem(START_KEY);
    if (start) return computeWeekFromStart(start);
  }
  const w = parseInt(localStorage.getItem(WEEK_KEY), 10);
  return isNaN(w) ? 1 : w;
}
function setWeek(w) {
  localStorage.setItem(WEEK_KEY, w);
  localStorage.setItem(WEEKMODE_KEY, "manual"); // a manual pick turns off auto
  mirrorToIDB();
}
function setProgramStart(iso) {
  localStorage.setItem(START_KEY, iso);
  localStorage.setItem(WEEKMODE_KEY, "auto");
  mirrorToIDB();
}
function loadBody() {
  try {
    return JSON.parse(localStorage.getItem(BODY_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveBody(arr) {
  localStorage.setItem(BODY_KEY, JSON.stringify(arr));
  mirrorToIDB();
}
function phaseForWeek(w) {
  if (w === 0) return { name: "Deload", rir: "keep it easy (3–4)", idx: -1, deload: true };
  if (w <= 3) return { name: "Foundation", rir: "3–4", idx: 0 };
  if (w <= 6) return { name: "Volume", rir: "2–3", idx: 1 };
  return { name: "Intensity", rir: "1–2", idx: 2 };
}
// Sets scale by phase: Foundation caps at 3; Volume/Intensity use the routine's
// set count (4 for compounds, 3 for accessories); deload halves the volume.
function effectiveSets(ex, w) {
  const base = ex.sets;
  const ph = phaseForWeek(w);
  if (ph.deload) return Math.max(1, Math.round(Math.min(base, 3) / 2));
  if (ph.name === "Foundation") return Math.min(base, 3);
  return base;
}
function weekStartMonday(d) {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7; // Mon=0
  x.setDate(x.getDate() - dow);
  x.setHours(0, 0, 0, 0);
  return x;
}

/* ---------- storage ---------- */
function loadLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveLog(log) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  mirrorToIDB(); // layer 1: keep the IndexedDB backup in sync on every write
}

/* ---------- helpers ---------- */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function e1rm(weight, reps) {
  if (!weight || !reps) return 0;
  return weight * (1 + reps / 30);
}
function parseRest(str) {
  if (!str) return 60;
  const m = String(str).match(/\d+/);
  return m ? parseInt(m[0], 10) : 60;
}
function findExercise(name) {
  for (const day of ROUTINE.days) {
    const ex = day.exercises.find((e) => e.name === name);
    if (ex) return ex;
  }
  return null;
}
function ytSearchUrl(ex) {
  const q = "how to " + (ex.video || ex.name).replace(/\(.*?\)/g, "").trim();
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
}
function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 1800);
}
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function lastEntryFor(name) {
  const log = loadLog();
  for (let i = log.length - 1; i >= 0; i--) {
    const e = log[i].entries.find((x) => x.name === name);
    if (e && e.sets.some((s) => s.weight || s.reps)) return { date: log[i].date, entry: e };
  }
  return null;
}

/* ---------- theme ---------- */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const nameEl = document.getElementById("theme-name");
  if (nameEl) nameEl.textContent = THEME_LABELS[theme] || theme;
  localStorage.setItem(THEME_KEY, theme);
  mirrorToIDB();
  // repaint chart if visible so its colors match the theme
  if (document.getElementById("view-progress").classList.contains("active")) {
    const sel = document.querySelector(".exercise-select");
    if (sel) renderProgressBody(sel.value);
  }
}
function cycleTheme() {
  const cur = localStorage.getItem(THEME_KEY) || "aurora";
  const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
  applyTheme(next);
  toast(THEME_LABELS[next] + " theme");
}

/* ---------- routine view ---------- */
function exMeta(ex) {
  const bits = [];
  if (ex.rest) bits.push("rest " + ex.rest);
  if (ex.rir && ex.rir !== "—") bits.push("RIR " + ex.rir);
  if (ex.note) bits.push(ex.note);
  return bits.join(" · ");
}

function renderRoutine() {
  const el = document.getElementById("view-routine");
  const activeIdx = phaseForWeek(getWeek()).idx;
  const phases = ROUTINE.phases
    ? `<div class="card">
        <h2 style="font-size:1.05rem">Progression Phases</h2>
        ${ROUTINE.phases
          .map(
            (p, i) =>
              `<div class="exercise-row ${i === activeIdx ? "phase-active" : ""}">
                 <span class="left"><span><span class="name">${p.name}${i === activeIdx ? " ← you are here" : ""}</span><span class="note">Weeks ${p.weeks} · ${p.focus}</span></span></span>
                 <span class="scheme">${p.sets} · RIR ${p.rir}</span>
               </div>`
          )
          .join("")}
      </div>`
    : "";

  el.innerHTML =
    renderTodayCard() +
    renderRemindersCard() +
    (ROUTINE.subtitle ? `<p class="focus" style="margin-top:-4px">${ROUTINE.subtitle}</p>` : "") +
    ROUTINE.days
      .map(
        (day) => `
      <div class="card">
        <h2>${day.name}</h2>
        <p class="focus">${day.focus || ""}</p>
        ${day.exercises
          .map((ex) => {
            const v = exView(ex);
            const meta = exMeta(ex);
            const alt = altLabel(ex);
            return `
          <div class="exercise-row clickable" data-ex="${encodeURIComponent(ex.name)}">
            <span class="left">
              <span>
                <span class="name">${v.name}</span>
                ${alt ? `<span class="note equip-alt">${alt}</span>` : ""}
                ${meta ? `<span class="note">${meta}</span>` : ""}
              </span>
            </span>
            <span class="scheme">${v.sets} × ${v.reps}</span>
            <span class="chev">›</span>
          </div>`;
          })
          .join("")}
      </div>`
      )
      .join("") +
    phases;
}

function renderTodayCard() {
  const dow = new Date().getDay();
  const di = todaysDayIndex();
  const wk = getWeek();
  const ph = phaseForWeek(wk);
  const weekLabel = wk === 0 ? "Deload week" : "Week " + wk + " · " + ph.name;
  let body;
  if (di != null) {
    const day = ROUTINE.days[di];
    body = `<div class="today-day">${day.name}</div>
            <div class="focus">${day.focus || ""}</div>
            <button class="btn today-start" data-day="${di}">Start today's workout ▶</button>`;
  } else {
    const rest =
      dow === 3
        ? "Mobility flow — hips, shoulders, deep squat hold, foam rolling."
        : "Full recovery. Eat. Sleep. Stack your fuel windows.";
    body = `<div class="today-day">${dow === 3 ? "Mobility & Recovery" : "Rest Day"}</div>
            <div class="focus">${rest}</div>`;
  }
  const qh = quoteHTML();
  const quote = qh ? `<div class="today-quote workout-quote">${qh}</div>` : "";
  return `<div class="card today-card">
    <div class="today-top"><span class="today-label">Today · ${WEEKDAYS[dow]}</span><span class="today-week">${weekLabel}</span></div>
    ${body}
    ${quote}
  </div>`;
}

/* ---------- daily picks (one suggestion / quote per day, stable all day) ---------- */
function dayIndex() {
  const n = new Date();
  return Math.floor(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) / 86400000);
}
function dailyPick(arr, offset) {
  if (!arr || !arr.length) return null;
  return arr[(dayIndex() + (offset || 0)) % arr.length];
}
function fuelQuoteHTML() {
  const fq = typeof FUEL_QUOTES !== "undefined" ? dailyPick(FUEL_QUOTES) : null;
  return fq ? `<div class="fuel-quote">“${fq.q}” <span class="fq-a">— ${fq.a}</span></div>` : "";
}

/* ---------- fuel (pre/post workout nutrition) ---------- */
function fuelCard(kind) {
  const f = typeof FUEL !== "undefined" && FUEL[kind];
  if (!f) return "";
  // offset post by 1 so pre/post don't show the same line on the same day
  const idea = dailyPick(f.ideas, kind === "post" ? 1 : 0);
  return `<div class="card fuel-card">
    <div class="fuel-head">
      <span class="fuel-emoji">${kind === "pre" ? "🍳" : "🥩"}</span>
      <div><div class="fuel-title">${f.title}</div><div class="focus" style="margin:0">${f.timing}</div></div>
    </div>
    <div class="fuel-tip">${f.tip}</div>
    <div class="fuel-roll"><span class="fuel-roll-label">Today</span><span class="fuel-idea">${idea}</span></div>
    ${fuelQuoteHTML()}
  </div>`;
}
function openFuel(kind) {
  const f = typeof FUEL !== "undefined" && FUEL[kind];
  if (!f) return;
  const idea = dailyPick(f.ideas, kind === "post" ? 1 : 0);
  const root = document.getElementById("modal-root");
  const modal = root.querySelector(".modal");
  modal.innerHTML = `
    <div class="grip"></div>
    <button class="modal-close" aria-label="Close">✕</button>
    <h2>${kind === "pre" ? "🍳 " : "🥩 "}${f.title}</h2>
    <div class="muscle-chips"><span class="chip">${f.timing}</span></div>
    <p class="fuel-tip">${f.tip}</p>
    <div class="fuel-roll"><span class="fuel-roll-label">Today</span><span class="fuel-idea">${idea}</span></div>
    <div class="how-title">More ideas</div>
    <ol class="cue-list">${f.ideas.map((i) => `<li>${i}</li>`).join("")}</ol>
    <div class="fuel-quote" style="margin-bottom:18px">${typeof FUEL_QUOTES !== "undefined" && dailyPick(FUEL_QUOTES) ? `“${dailyPick(FUEL_QUOTES).q}” <span class="fq-a">— ${dailyPick(FUEL_QUOTES).a}</span>` : ""}</div>
    <button class="btn full modal-close">Got it 👍</button>`;
  root.hidden = false;
  document.body.style.overflow = "hidden";
}

// small label showing the *other* equipment variant for reference
function altLabel(ex) {
  if (!ex.gym) return "";
  return getMode() === "gym" ? "🏠 " + ex.name : "🏋️ " + ex.gym.name;
}

/* ---------- exercise detail modal ---------- */
function openExercise(name) {
  const ex = findExercise(name);
  if (!ex) return;
  const v = exView(ex);
  const alt = altLabel(ex);
  const root = document.getElementById("modal-root");
  const modal = root.querySelector(".modal");
  const cues = (v.cues || []).map((c) => `<li>${c}</li>`).join("");
  modal.innerHTML = `
    <div class="grip"></div>
    <button class="modal-close" aria-label="Close">✕</button>
    <h2>${v.name}</h2>
    ${alt ? `<div class="equip-alt-line">${getMode() === "gym" ? "Home version" : "Gym version"}: ${alt.replace(/^.. /, "")}</div>` : ""}
    ${v.muscles ? `<div class="muscle-chips">${v.muscles.split(",").map((m) => `<span class="chip">${m.trim()}</span>`).join("")}</div>` : ""}
    <div class="meta-grid">
      <div class="meta-box"><div class="v">${v.sets} × ${v.reps}</div><div class="l">Sets × Reps</div></div>
      <div class="meta-box"><div class="v">${v.rest || "—"}</div><div class="l">Rest</div></div>
      <div class="meta-box"><div class="v">${v.rir || "—"}</div><div class="l">RIR</div></div>
    </div>
    ${cues ? `<div class="how-title">How to do it</div><ol class="cue-list">${cues}</ol>` : ""}
    ${
      v.videoId
        ? `<div class="how-title">Video tutorial</div>
           <div class="video-wrap">
             <iframe src="https://www.youtube.com/embed/${v.videoId}" title="${v.name} tutorial"
                     loading="lazy" allowfullscreen
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
           </div>`
        : ""
    }
    <a class="yt-btn" href="${ytSearchUrl(v)}" target="_blank" rel="noopener">
      <span class="yt-play">▶</span> ${v.videoId ? "Find more tutorials" : "Watch how-to on YouTube"}
    </a>
  `;
  root.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeModal() {
  const root = document.getElementById("modal-root");
  root.hidden = true;
  document.body.style.overflow = "";
}

/* ---------- rest timer ---------- */
const RestTimer = {
  total: 0,
  left: 0,
  paused: false,
  interval: null,
  R: 28, // ring radius
  start(seconds, label) {
    this.stop(true);
    this.total = seconds;
    this.left = seconds;
    this.paused = false;
    this.render(label);
    this.interval = setInterval(() => this.tick(), 1000);
  },
  tick() {
    if (this.paused) return;
    this.left--;
    this.update();
    if (this.left <= 0) this.finish();
  },
  adjust(delta) {
    this.left = Math.max(1, this.left + delta);
    this.total = Math.max(this.total, this.left);
    this.update();
  },
  togglePause() {
    this.paused = !this.paused;
    const btn = document.querySelector("#rest-timer .pause");
    if (btn) btn.textContent = this.paused ? "▶" : "⏸";
  },
  finish() {
    clearInterval(this.interval);
    this.interval = null;
    const el = document.getElementById("rest-timer");
    el.classList.add("done");
    const num = el.querySelector(".ring-num");
    if (num) num.textContent = "GO";
    this.beep();
    setTimeout(() => this.stop(), 2200);
  },
  stop(silent) {
    clearInterval(this.interval);
    this.interval = null;
    const el = document.getElementById("rest-timer");
    el.hidden = true;
    el.classList.remove("done");
  },
  beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.18].forEach((t) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 880;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.15);
        o.start(ctx.currentTime + t);
        o.stop(ctx.currentTime + t + 0.16);
      });
    } catch (e) {}
  },
  render(label) {
    const el = document.getElementById("rest-timer");
    const C = 2 * Math.PI * this.R;
    el.classList.remove("done");
    el.innerHTML = `
      <div class="ring-wrap">
        <svg width="66" height="66" viewBox="0 0 66 66">
          <defs>
            <linearGradient id="ringgrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="rgb(${cssVar("--c1-rgb")})"/>
              <stop offset="100%" stop-color="rgb(${cssVar("--c2-rgb")})"/>
            </linearGradient>
          </defs>
          <circle class="ring-bg" cx="33" cy="33" r="${this.R}" fill="none" stroke-width="6"/>
          <circle class="ring-fg" cx="33" cy="33" r="${this.R}" fill="none" stroke-width="6"
                  stroke-dasharray="${C}" stroke-dashoffset="0"/>
        </svg>
        <div class="ring-num">${this.left}</div>
      </div>
      <div class="rest-mid">
        <div class="rest-label">Rest</div>
        <div class="rest-ex">${label || "Recover"}</div>
      </div>
      <div class="rest-controls">
        <button class="adj" data-d="-15">-15</button>
        <button class="pause">⏸</button>
        <button class="adj" data-d="15">+15</button>
        <button class="skip">Skip</button>
      </div>`;
    el.hidden = false;
    this.update();
  },
  update() {
    const el = document.getElementById("rest-timer");
    const fg = el.querySelector(".ring-fg");
    const num = el.querySelector(".ring-num");
    if (!fg) return;
    const C = 2 * Math.PI * this.R;
    const frac = Math.max(0, this.left) / this.total;
    fg.style.strokeDashoffset = C * (1 - frac);
    if (this.left > 0) num.textContent = this.left;
  },
};

/* ---------- track view ---------- */
const ENERGY_EMOJI = ["😫", "😐", "🙂", "💪", "🔥"];
const MEAS = [
  { k: "waist", label: "Waist" },
  { k: "arms", label: "Arms" },
  { k: "chest", label: "Chest" },
  { k: "thighs", label: "Thighs" },
];
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

let trackState = { dayIndex: 0, data: {}, note: "", energy: 0 };

/* one motivational quote per day */
function quoteHTML() {
  const q = typeof QUOTES !== "undefined" ? dailyPick(QUOTES) : null;
  return q ? `“${q.q}” <span class="wq-a">— ${q.a}</span>` : "";
}
function quoteCard() {
  const h = quoteHTML();
  return h ? `<div class="card quote-card"><div class="workout-quote">${h}</div></div>` : "";
}

function initTrackData(day) {
  const w = getWeek();
  const data = {};
  day.exercises.forEach((ex) => {
    const last = lastEntryFor(ex.name);
    const n = effectiveSets(ex, w);
    data[ex.name] = Array.from({ length: n }, (_, i) => {
      const ls = last && last.entry.sets[i];
      return {
        weight: ls && ls.weight ? String(ls.weight) : "", // pre-fill weight from last time
        reps: "",
        done: false,
        phReps: ls && ls.reps ? ls.reps : "", // last reps -> placeholder hint
      };
    });
  });
  return data;
}

function renderTrack() {
  const el = document.getElementById("view-track");
  const day = ROUTINE.days[trackState.dayIndex];
  if (Object.keys(trackState.data).length === 0) trackState.data = initTrackData(day);

  const wk = getWeek();
  const ph = phaseForWeek(wk);
  const auto = localStorage.getItem(WEEKMODE_KEY) === "auto";
  const startDate = localStorage.getItem(START_KEY) || "";
  const weekOpts =
    `<option value="0" ${wk === 0 ? "selected" : ""}>Deload week</option>` +
    [1, 2, 3, 4, 5, 6, 7, 8]
      .map((n) => `<option value="${n}" ${wk === n ? "selected" : ""}>Week ${n}</option>`)
      .join("");

  el.innerHTML = `
    ${quoteCard()}
    <div class="card phase-card">
      <div class="phase-top">
        <div>
          <div class="rest-label">Program ${wk === 0 ? "" : "· Week " + wk}</div>
          <div class="phase-name">${ph.name} phase</div>
        </div>
        <select id="week-select" class="week-select" ${auto ? "disabled" : ""}>${weekOpts}</select>
      </div>
      <div class="focus" style="margin:10px 0 0">Target RIR this phase: <b style="color:var(--cyan)">${ph.rir}</b>${
        ph.deload ? " · half the sets, same weight" : ""
      }</div>
      <label class="auto-week">
        <input type="checkbox" id="auto-week" ${auto ? "checked" : ""}/> <span>Auto-advance by date</span>
        <input type="date" id="start-date" value="${startDate}" ${auto ? "" : "disabled"} />
      </label>
    </div>
    ${fuelCard("pre")}
    <div class="day-picker">
      ${ROUTINE.days
        .map(
          (d, i) =>
            `<button class="day-chip ${i === trackState.dayIndex ? "active" : ""}" data-day="${i}">${d.name}</button>`
        )
        .join("")}
    </div>
    <button id="focus-start" class="btn full focus-cta">▶ Start Focus Mode</button>
    <div class="day-progress-wrap">
      <div class="day-progress-label"><span>Session progress</span><span id="dp-count">0 / 0</span></div>
      <div class="day-progress-track"><div class="day-progress-fill" id="dp-fill"></div></div>
    </div>
    ${day.exercises
      .map((ex) => {
        const last = lastEntryFor(ex.name);
        const lastTxt = last
          ? "Last (" +
            fmtDate(last.date) +
            "): " +
            last.entry.sets
              .filter((s) => s.weight || s.reps)
              .map((s) => `${s.weight || "–"}×${s.reps || "–"}`)
              .join(", ")
          : "No history yet";
        const sets = trackState.data[ex.name];
        const v = exView(ex);
        const alt = altLabel(ex);
        return `
        <div class="card">
          <div class="track-ex-head" data-ex="${encodeURIComponent(ex.name)}">
            <h2 style="font-size:1.05rem">${v.name}</h2>
            <span class="info-pill">How-to ›</span>
          </div>
          ${alt ? `<div class="note equip-alt">${alt}</div>` : ""}
          <div class="focus">Target: ${effectiveSets(ex, wk)} × ${v.reps}${v.rest ? " · rest " + v.rest : ""}</div>
          <div class="last-time">${lastTxt}</div>
          <div class="set-head"><span>Set</span><span>Weight</span><span>Reps</span><span></span></div>
          ${sets
            .map(
              (s, i) => `
            <div class="set-grid" data-ex="${encodeURIComponent(ex.name)}" data-set="${i}">
              <span class="set-num">${i + 1}</span>
              <input type="number" inputmode="decimal" class="w" placeholder="0" value="${s.weight}" />
              <input type="number" inputmode="numeric" class="r" placeholder="${s.phReps || "0"}" value="${s.reps}" />
              <button class="check ${s.done ? "done" : ""}">✓</button>
            </div>`
            )
            .join("")}
        </div>`;
      })
      .join("")}
    <div class="card journal-card">
      <h2 style="font-size:1.05rem">Session journal</h2>
      <div class="focus">How did it feel?</div>
      <div class="energy-row">
        ${[1, 2, 3, 4, 5]
          .map(
            (n) =>
              `<button class="energy-btn ${trackState.energy === n ? "sel" : ""}" data-energy="${n}">${ENERGY_EMOJI[n - 1]}</button>`
          )
          .join("")}
      </div>
      <textarea id="session-note" class="session-note" placeholder="Notes, PRs, tweaks, how the lifts moved...">${escapeHtml(trackState.note || "")}</textarea>
    </div>
    <button id="save-workout" class="btn full">Save workout</button>
  `;
  updateDayProgress();
}

function updateDayProgress() {
  let done = 0,
    total = 0;
  Object.values(trackState.data).forEach((sets) =>
    sets.forEach((s) => {
      total++;
      if (s.done) done++;
    })
  );
  const fill = document.getElementById("dp-fill");
  const count = document.getElementById("dp-count");
  if (fill) fill.style.width = (total ? (done / total) * 100 : 0) + "%";
  if (count) count.textContent = done + " / " + total;
}

function handleTrackInput(e) {
  if (e.target.id === "session-note") {
    trackState.note = e.target.value;
    return;
  }
  const grid = e.target.closest(".set-grid");
  if (!grid) return;
  const ex = decodeURIComponent(grid.dataset.ex);
  const i = +grid.dataset.set;
  if (e.target.classList.contains("w")) trackState.data[ex][i].weight = e.target.value;
  if (e.target.classList.contains("r")) trackState.data[ex][i].reps = e.target.value;
}

function handleTrackClick(e) {
  // energy rating
  if (e.target.classList.contains("energy-btn")) {
    trackState.energy = +e.target.dataset.energy;
    document.querySelectorAll(".energy-btn").forEach((b) => b.classList.toggle("sel", b === e.target));
    return;
  }
  // open exercise detail
  const head = e.target.closest(".track-ex-head");
  if (head) {
    openExercise(decodeURIComponent(head.dataset.ex));
    return;
  }
  // day switch
  const chip = e.target.closest(".day-chip");
  if (chip) {
    trackState.dayIndex = +chip.dataset.day;
    trackState.data = initTrackData(ROUTINE.days[trackState.dayIndex]);
    renderTrack();
    return;
  }
  // check off a set -> start rest timer
  if (e.target.classList.contains("check")) {
    const grid = e.target.closest(".set-grid");
    const exName = decodeURIComponent(grid.dataset.ex);
    const i = +grid.dataset.set;
    const nowDone = !trackState.data[exName][i].done;
    trackState.data[exName][i].done = nowDone;
    e.target.classList.toggle("done");
    updateDayProgress();
    if (nowDone) {
      const ex = findExercise(exName);
      RestTimer.start(parseRest(ex && ex.rest), exName);
    }
    return;
  }
  if (e.target.id === "focus-start") {
    FocusMode.open();
    return;
  }
  if (e.target.id === "save-workout") saveWorkout();
}

function saveWorkout() {
  const day = ROUTINE.days[trackState.dayIndex];
  const entries = day.exercises.map((ex) => ({
    name: ex.name,
    // a set counts as performed once you enter reps for it (weight is pre-filled,
    // so we key on reps to avoid logging untouched sets)
    sets: trackState.data[ex.name]
      .filter((s) => s.reps !== "")
      .map((s) => ({ weight: parseFloat(s.weight) || 0, reps: parseInt(s.reps) || 0 })),
  }));
  const hasData = entries.some((e) => e.sets.length > 0);
  if (!hasData) {
    toast("Log at least one set first");
    return;
  }
  // detect PRs against history BEFORE this session is added
  const prior = loadLog();
  const prs = [];
  entries.forEach((en) => {
    if (!en.sets.length) return;
    const pb = bestFromLog(en.name, prior);
    const sb = sessionBest(en);
    if (pb.e > 0 && sb.e > pb.e) prs.push({ name: en.name, kind: "est. 1RM", value: sb.e, prev: pb.e });
    else if (pb.top > 0 && sb.top > pb.top) prs.push({ name: en.name, kind: "top weight", value: sb.top, prev: pb.top });
  });

  const log = prior;
  log.push({
    id: Date.now(),
    date: todayISO(),
    day: day.name,
    entries,
    note: trackState.note || "",
    energy: trackState.energy || 0,
    equip: getMode(), // record whether this session was Home or Gym
  });
  saveLog(log);
  trackState.data = initTrackData(day);
  trackState.note = "";
  trackState.energy = 0;
  RestTimer.stop();
  renderTrack();
  if (prs.length) celebrate(prs);
  else toast("Workout saved 💪");
  openFuel("post"); // in-app post-workout refuel reminder (under any celebration)
  schedulePostWorkout(); // timed notification, if enabled
  cancelTodaysTrainingReminder(); // no need to nag once you've trained
}

/* ---------- personal records ---------- */
function bestFromLog(name, log) {
  let e = 0,
    top = 0;
  log.forEach((w) => {
    const en = w.entries.find((x) => x.name === name);
    if (!en) return;
    en.sets.forEach((s) => {
      e = Math.max(e, e1rm(s.weight, s.reps));
      top = Math.max(top, s.weight);
    });
  });
  return { e: Math.round(e), top };
}
function sessionBest(entry) {
  let e = 0,
    top = 0;
  entry.sets.forEach((s) => {
    e = Math.max(e, e1rm(s.weight, s.reps));
    top = Math.max(top, s.weight);
  });
  return { e: Math.round(e), top };
}

function celebrate(prs) {
  const root = document.getElementById("celebrate-root");
  root.innerHTML = `
    <div class="celebrate-card">
      <div class="trophy">🏆</div>
      <h2>New Personal Record${prs.length > 1 ? "s" : ""}!</h2>
      <div class="pr-list">
        ${prs
          .map(
            (p) =>
              `<div class="pr-item"><span class="pr-name">${p.name}</span><span class="pr-val">${p.value} <small>${p.kind}</small><br><span class="pr-prev">prev ${p.prev}</span></span></div>`
          )
          .join("")}
      </div>
      <button class="btn celebrate-close">Let's go 🔥</button>
    </div>`;
  root.hidden = false;
  fireConfetti();
}

/* lightweight canvas confetti — no libraries */
function fireConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  canvas.hidden = false;
  const colors = ["--c1-rgb", "--c2-rgb", "--c3-rgb", "--ok-rgb"].map((v) => `rgb(${cssVar(v) || "255,255,255"})`);
  const N = 140;
  const parts = Array.from({ length: N }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 120,
    y: innerHeight / 2,
    vx: (Math.random() - 0.5) * 14,
    vy: Math.random() * -16 - 4,
    s: 4 + Math.random() * 6,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    c: colors[(Math.random() * colors.length) | 0],
    life: 1,
  }));
  const start = performance.now();
  function frame(t) {
    const dt = Math.min(32, t - (frame._last || t));
    frame._last = t;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach((p) => {
      p.vy += 0.4; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.5);
      ctx.restore();
    });
    if (t - start < 2600) requestAnimationFrame(frame);
    else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.hidden = true;
    }
  }
  requestAnimationFrame(frame);
}

/* ---------- Focus Mode (guided full-screen workout) ---------- */
const FocusMode = {
  steps: [],
  i: 0,
  open() {
    const day = ROUTINE.days[trackState.dayIndex];
    if (Object.keys(trackState.data).length === 0) trackState.data = initTrackData(day);
    this.steps = [];
    day.exercises.forEach((ex, ei) => {
      const sets = trackState.data[ex.name];
      sets.forEach((_, si) => this.steps.push({ ei, name: ex.name, si, total: sets.length }));
    });
    if (!this.steps.length) return;
    this.i = 0;
    document.body.style.overflow = "hidden";
    document.getElementById("focus-root").hidden = false;
    this.render();
  },
  close() {
    document.getElementById("focus-root").hidden = true;
    document.body.style.overflow = "";
    renderTrack();
  },
  go(delta) {
    this.i = Math.max(0, Math.min(this.steps.length - 1, this.i + delta));
    this.render();
  },
  current() {
    return this.steps[this.i];
  },
  saveInputs() {
    const root = document.getElementById("focus-root");
    const w = root.querySelector(".f-weight");
    const r = root.querySelector(".f-reps");
    const st = this.current();
    if (!st) return;
    const set = trackState.data[st.name][st.si];
    if (w) set.weight = w.value;
    if (r) set.reps = r.value;
  },
  logAndNext() {
    this.saveInputs();
    const st = this.current();
    const set = trackState.data[st.name][st.si];
    if (set.reps !== "") set.done = true;
    const ex = findExercise(st.name);
    RestTimer.start(parseRest(ex && ex.rest), st.name);
    if (this.i >= this.steps.length - 1) this.finish();
    else this.go(1);
  },
  finish() {
    this.close();
    saveWorkout();
  },
  render() {
    const st = this.current();
    const ex = findExercise(st.name);
    const set = trackState.data[st.name][st.si];
    const last = lastEntryFor(st.name);
    const ls = last && last.entry.sets[st.si];
    const done = this.steps.filter((s) => trackState.data[s.name][s.si].done).length;
    const exNo = st.ei + 1;
    const isLast = this.i === this.steps.length - 1;
    const v = exView(ex);
    const cues = (v.cues || []).map((c) => `<li>${c}</li>`).join("");
    const root = document.getElementById("focus-root");
    root.innerHTML = `
      <div class="focus-bar">
        <button class="focus-close" aria-label="Close">✕</button>
        <div class="focus-counter">Exercise ${exNo}/${ROUTINE.days[trackState.dayIndex].exercises.length} · Set ${st.si + 1}/${st.total}</div>
        <div class="focus-counter">${done}/${this.steps.length} ✓</div>
      </div>
      <div class="focus-track"><div class="focus-fill" style="width:${(this.i / this.steps.length) * 100}%"></div></div>
      <div class="focus-body">
        ${this.i === 0 && quoteHTML() ? `<div class="focus-quote">${quoteHTML()}</div>` : ""}
        ${isLast && typeof FINAL_HYPE !== "undefined" && FINAL_HYPE.length ? `<div class="focus-hype">${FINAL_HYPE[Math.floor(Math.random() * FINAL_HYPE.length)]}</div>` : ""}
        <h2 class="focus-name">${v.name}</h2>
        <div class="focus-meta">${set.done ? "✓ logged · " : ""}Target ${v.reps} · rest ${v.rest || "—"} · RIR ${v.rir || "—"}</div>
        ${cues ? `<ol class="cue-list focus-cues">${cues}</ol>` : ""}
        ${v.videoId ? `<button class="link-btn focus-video-toggle">▶ Watch tutorial</button><div class="focus-video" hidden></div>` : ""}
        <div class="focus-inputs">
          <label>Weight<input type="number" inputmode="decimal" class="f-weight" placeholder="${ls && ls.weight ? ls.weight : "0"}" value="${set.weight}" /></label>
          <label>Reps<input type="number" inputmode="numeric" class="f-reps" placeholder="${ls && ls.reps ? ls.reps : "0"}" value="${set.reps}" /></label>
        </div>
      </div>
      <div class="focus-controls">
        <button class="btn secondary focus-prev" ${this.i === 0 ? "disabled" : ""}>‹ Prev</button>
        <button class="btn focus-next">${isLast ? "Finish & Save 🏁" : "Log set ›"}</button>
      </div>`;
  },
};

/* ---------- progress view ---------- */
function allExerciseNames() {
  const names = new Set();
  ROUTINE.days.forEach((d) => d.exercises.forEach((e) => names.add(e.name)));
  return [...names];
}

function seriesFor(name) {
  const log = loadLog();
  const points = [];
  log.forEach((w) => {
    const e = w.entries.find((x) => x.name === name);
    if (!e) return;
    let best = 0,
      topWeight = 0,
      volume = 0;
    e.sets.forEach((s) => {
      best = Math.max(best, e1rm(s.weight, s.reps));
      topWeight = Math.max(topWeight, s.weight);
      volume += s.weight * s.reps;
    });
    if (best > 0) points.push({ date: w.date, e1rm: Math.round(best), topWeight, volume, equip: w.equip });
  });
  return points.sort((a, b) => a.date.localeCompare(b.date));
}

function renderOverview() {
  const log = loadLog();
  const dates = new Set(log.map((w) => w.date));
  const total = log.length;

  const hasWeek = (ws) => {
    const we = new Date(ws);
    we.setDate(we.getDate() + 7);
    return [...dates].some((ds) => {
      const d = new Date(ds + "T00:00:00");
      return d >= ws && d < we;
    });
  };

  const monday = weekStartMonday(new Date());
  let thisWeek = 0;
  log.forEach((w) => {
    if (new Date(w.date + "T00:00:00") >= monday) thisWeek++;
  });

  // consecutive-week streak (current week counts as in-progress, not a breaker)
  let cursor = new Date(monday);
  if (!hasWeek(cursor)) cursor.setDate(cursor.getDate() - 7);
  let streak = 0;
  while (hasWeek(cursor) && streak < 520) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }

  // calendar: last 9 weeks
  const WEEKS = 9;
  const start = weekStartMonday(new Date());
  start.setDate(start.getDate() - 7 * (WEEKS - 1));
  const now = new Date();
  let cells = "";
  for (let wi = 0; wi < WEEKS; wi++) {
    for (let di = 0; di < 7; di++) {
      const d = new Date(start);
      d.setDate(start.getDate() + wi * 7 + di);
      const iso = d.toISOString().slice(0, 10);
      const future = d > now;
      cells += `<div class="cal-cell ${dates.has(iso) ? "on" : ""} ${future ? "fut" : ""}" title="${iso}"></div>`;
    }
  }
  const dayHeads = ["M", "T", "W", "T", "F", "S", "S"].map((h) => `<div class="cal-head">${h}</div>`).join("");

  // personal records wall (best estimated 1RM per exercise)
  const recs = allExerciseNames()
    .map((n) => ({ n, ...bestFromLog(n, log) }))
    .filter((r) => r.e > 0)
    .sort((a, b) => b.e - a.e);
  const recsCard = recs.length
    ? `<div class="card">
        <div class="focus">🏆 Personal records · best est. 1RM</div>
        ${recs
          .map(
            (r) =>
              `<div class="history-item"><span>${r.n}</span><span><b style="color:var(--cyan)">${r.e}</b> · top ${r.top}</span></div>`
          )
          .join("")}
      </div>`
    : "";

  // session journal (notes + how it felt)
  const journal = log
    .slice()
    .reverse()
    .filter((w) => w.note || w.energy)
    .slice(0, 12);
  const journalCard = journal.length
    ? `<div class="card">
        <div class="focus">📓 Recent sessions</div>
        ${journal
          .map(
            (w) =>
              `<div class="journal-item">
                 <div class="j-head"><span>${fmtDate(w.date)} · ${w.day} ${equipTag(w.equip)}</span><span class="j-energy">${w.energy ? ENERGY_EMOJI[w.energy - 1] : ""}</span></div>
                 ${w.note ? `<div class="j-note">${escapeHtml(w.note)}</div>` : ""}
               </div>`
          )
          .join("")}
      </div>`
    : "";

  return `
    <div class="stat-row">
      <div class="stat"><div class="value">${streak}</div><div class="label">Week streak</div></div>
      <div class="stat"><div class="value">${thisWeek}</div><div class="label">This week</div></div>
      <div class="stat"><div class="value">${total}</div><div class="label">Total sessions</div></div>
    </div>
    <div class="card">
      <div class="focus">Training calendar · last ${WEEKS} weeks</div>
      <div class="cal-grid">${dayHeads}${cells}</div>
    </div>
    ${recsCard}
    ${journalCard}`;
}

function renderProgress() {
  const el = document.getElementById("view-progress");
  const log = loadLog();
  if (log.length === 0) {
    el.innerHTML = `<div class="empty">No workouts logged yet.<br>Head to the <b>Track</b> tab to log your first session.</div>`;
    return;
  }
  const names = allExerciseNames();
  const saved = el.querySelector(".exercise-select")?.value;
  const selected = saved || names[0];
  el.innerHTML = `
    ${renderOverview()}
    <div class="focus" style="margin-bottom:8px">Per-exercise progress</div>
    <select class="exercise-select">
      ${names.map((n) => `<option ${n === selected ? "selected" : ""}>${n}</option>`).join("")}
    </select>
    <div id="progress-body"></div>`;
  renderProgressBody(selected);
  el.querySelector(".exercise-select").addEventListener("change", (e) => renderProgressBody(e.target.value));
}

function renderProgressBody(name) {
  const body = document.getElementById("progress-body");
  if (!body) return;
  const pts = seriesFor(name);
  if (pts.length === 0) {
    body.innerHTML = `<div class="empty">No logged sets for ${name} yet.</div>`;
    return;
  }
  const best = Math.max(...pts.map((p) => p.e1rm));
  const latest = pts[pts.length - 1];
  const change = latest.e1rm - pts[0].e1rm;
  body.innerHTML = `
    <div class="stat-row">
      <div class="stat"><div class="value">${latest.e1rm}</div><div class="label">Est. 1RM</div></div>
      <div class="stat"><div class="value">${best}</div><div class="label">Best ever</div></div>
      <div class="stat"><div class="value">${change >= 0 ? "+" : ""}${change}</div><div class="label">Since start</div></div>
    </div>
    <div class="card">
      <div class="focus">Estimated 1-rep max over time</div>
      <div class="chart-wrap"><canvas id="chart" width="700" height="280"></canvas></div>
    </div>
    <div class="card">
      <h2 style="font-size:1.05rem">History</h2>
      ${pts
        .slice()
        .reverse()
        .map(
          (p) =>
            `<div class="history-item"><span class="date">${p.equip ? (p.equip === "gym" ? "🏋️ " : "🏠 ") : ""}${fmtDate(p.date)}</span><span>top ${p.topWeight} · e1RM ${p.e1rm} · vol ${Math.round(p.volume)}</span></div>`
        )
        .join("")}
    </div>`;
  drawChart(pts.map((p) => ({ date: p.date, value: p.e1rm })));
}

/* ---------- theme-aware canvas chart ---------- */
function drawChart(points, canvasId) {
  const canvas = document.getElementById(canvasId || "chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width,
    H = canvas.height;
  const pad = { l: 44, r: 16, t: 16, b: 28 };
  const c1 = cssVar("--c1-rgb") || "34,224,255";
  const c2 = cssVar("--c2-rgb") || "157,107,255";
  ctx.clearRect(0, 0, W, H);

  const ys = points.map((p) => p.value);
  let minY = Math.min(...ys),
    maxY = Math.max(...ys);
  if (minY === maxY) {
    minY -= 5;
    maxY += 5;
  }
  const range = maxY - minY;
  minY = Math.floor((minY - range * 0.1) / 5) * 5;
  maxY = Math.ceil((maxY + range * 0.1) / 5) * 5;

  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const xAt = (i) => pad.l + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const yAt = (v) => pad.t + plotH - ((v - minY) / (maxY - minY)) * plotH;

  // grid + y labels
  ctx.strokeStyle = "rgba(120,170,255,0.12)";
  ctx.fillStyle = "#8094b8";
  ctx.font = "11px ui-monospace, monospace";
  ctx.lineWidth = 1;
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const v = minY + ((maxY - minY) * i) / ticks;
    const y = yAt(v);
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(W - pad.r, y);
    ctx.stroke();
    ctx.fillText(Math.round(v), 6, y + 4);
  }

  // x labels
  ctx.textAlign = "center";
  const labelIdx = points.length <= 1 ? [0] : [0, Math.floor((points.length - 1) / 2), points.length - 1];
  [...new Set(labelIdx)].forEach((i) => {
    const d = new Date(points[i].date + "T00:00:00");
    ctx.fillText(d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), xAt(i), H - 8);
  });
  ctx.textAlign = "left";

  // gradient line with glow
  const grad = ctx.createLinearGradient(pad.l, 0, W - pad.r, 0);
  grad.addColorStop(0, `rgb(${c1})`);
  grad.addColorStop(1, `rgb(${c2})`);
  ctx.save();
  ctx.shadowColor = `rgba(${c1},0.7)`;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = xAt(i),
      y = yAt(p.value);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();

  // area fill
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = xAt(i),
      y = yAt(p.value);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(xAt(points.length - 1), pad.t + plotH);
  ctx.lineTo(xAt(0), pad.t + plotH);
  ctx.closePath();
  const fill = ctx.createLinearGradient(0, pad.t, 0, pad.t + plotH);
  fill.addColorStop(0, `rgba(${c1},0.28)`);
  fill.addColorStop(1, `rgba(${c2},0.02)`);
  ctx.fillStyle = fill;
  ctx.fill();

  // glowing dots
  points.forEach((p, i) => {
    const x = xAt(i),
      y = yAt(p.value);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#04070f";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgb(${c1})`;
    ctx.shadowColor = `rgba(${c1},0.9)`;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
}

/* =============================================================
   BACKUP & DURABILITY  (3 layers + schema versioning)
   ============================================================= */

/* ----- IndexedDB key/value helpers (layer 1) ----- */
let _dbPromise = null;
function idb() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("no idb"));
    const req = indexedDB.open("zettleFitness", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("kv");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}
async function idbSet(key, val) {
  const db = await idb();
  return new Promise((res, rej) => {
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").put(val, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function idbGet(key) {
  const db = await idb();
  return new Promise((res, rej) => {
    const tx = db.transaction("kv", "readonly");
    const r = tx.objectStore("kv").get(key);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

/* ----- the versioned export envelope (single source of truth) ----- */
function buildExport() {
  return {
    schema_version: SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    log: loadLog(),
    body: loadBody(),
    settings: {
      theme: localStorage.getItem(THEME_KEY) || "aurora",
      programWeek: parseInt(localStorage.getItem(WEEK_KEY), 10) || 1,
      programStart: localStorage.getItem(START_KEY) || null,
      weekMode: localStorage.getItem(WEEKMODE_KEY) || "manual",
      equipMode: getMode(),
      lastBackupDate: localStorage.getItem(BACKUP_DATE_KEY) || null,
      lastBackupAt: localStorage.getItem(LAST_BACKUP_AT) || null,
      lastICloudBackup: localStorage.getItem(ICLOUD_KEY) || null,
    },
  };
}
function mirrorToIDB() {
  try {
    idbSet("state", buildExport()).catch(() => {});
  } catch (e) {}
}

/* restore silently if localStorage was cleared but IndexedDB survived */
async function maybeRestoreFromIDB() {
  try {
    if (loadLog().length > 0) return; // localStorage intact, nothing to do
    const snap = await idbGet("state");
    if (snap && Array.isArray(snap.log) && (snap.log.length || (snap.body && snap.body.length))) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snap.log));
      if (Array.isArray(snap.body)) localStorage.setItem(BODY_KEY, JSON.stringify(snap.body));
      const s = snap.settings || {};
      if (s.theme) localStorage.setItem(THEME_KEY, s.theme);
      if (s.programWeek != null) localStorage.setItem(WEEK_KEY, String(s.programWeek));
      if (s.programStart) localStorage.setItem(START_KEY, s.programStart);
      if (s.weekMode) localStorage.setItem(WEEKMODE_KEY, s.weekMode);
      if (s.equipMode) localStorage.setItem(EQUIP_KEY, s.equipMode);
      if (s.lastBackupDate) localStorage.setItem(BACKUP_DATE_KEY, s.lastBackupDate);
      if (s.lastBackupAt) localStorage.setItem(LAST_BACKUP_AT, s.lastBackupAt);
      if (s.lastICloudBackup) localStorage.setItem(ICLOUD_KEY, s.lastICloudBackup);
      pendingRestoreToast = true;
    }
  } catch (e) {}
}

/* ----- filenames + helpers ----- */
function buildFilename() {
  const wk = getWeek();
  const tag = wk === 0 ? "deload" : "week" + wk;
  return `zettle-fitness-${todayISO()}-${tag}.json`;
}
function downloadJSON(text, filename) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function relativeAgo(iso) {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "just now";
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return min + (min === 1 ? " minute ago" : " minutes ago");
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + (hr === 1 ? " hour ago" : " hours ago");
  const d = Math.floor(hr / 24);
  return d + (d === 1 ? " day ago" : " days ago");
}
function markBackup() {
  localStorage.setItem(BACKUP_DATE_KEY, todayISO());
  localStorage.setItem(LAST_BACKUP_AT, new Date().toISOString());
  mirrorToIDB();
  renderLastBackup();
}
function markICloudBackup() {
  localStorage.setItem(ICLOUD_KEY, new Date().toISOString());
  markBackup();
}
function renderLastBackup() {
  const el = document.getElementById("last-backup");
  if (!el) return;
  const rel = relativeAgo(localStorage.getItem(LAST_BACKUP_AT));
  el.textContent = rel ? "Last backup: " + rel : "No backup yet — try Save to iCloud";
}

/* ----- layer 2: weekly Sunday nudge ----- */
function maybeShowBackupNudge() {
  const now = new Date();
  if (now.getDay() !== 0) return; // Sundays only
  if (localStorage.getItem(BACKUP_DATE_KEY) === todayISO()) return; // already backed up today
  if (Date.now() < parseInt(localStorage.getItem(SNOOZE_KEY) || "0", 10)) return; // snoozed
  if (localStorage.getItem(NUDGE_SHOWN_KEY) === todayISO()) return; // only first open of the day
  localStorage.setItem(NUDGE_SHOWN_KEY, todayISO());
  const el = document.getElementById("nudge-banner");
  el.innerHTML = `
    <span class="nudge-text">📦 Back up this week's data?</span>
    <div class="nudge-actions">
      <button class="btn nudge-backup">Back up now</button>
      <button class="link-btn nudge-snooze">Snooze 24h</button>
    </div>`;
  el.hidden = false;
}

/* ----- layer 3 + manual: export / iCloud / import ----- */
function exportData() {
  downloadJSON(JSON.stringify(buildExport(), null, 2), buildFilename());
  markBackup();
  toast("Backup downloaded");
}

async function saveToICloud() {
  const text = JSON.stringify(buildExport(), null, 2);
  const filename = buildFilename();

  // Desktop / Android Chromium: File System Access API -> durable handle
  if (window.showSaveFilePicker) {
    try {
      let handle = await idbGet("icloudHandle").catch(() => null);
      if (handle && !(await verifyPermission(handle))) handle = null;
      if (!handle) {
        handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: "JSON backup", accept: { "application/json": [".json"] } }],
        });
        await idbSet("icloudHandle", handle).catch(() => {});
      }
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
      markICloudBackup();
      toast("Saved to iCloud ☁️");
    } catch (e) {
      if (e && e.name === "AbortError") return; // user cancelled the picker
      toast("iCloud save failed");
    }
    return;
  }

  // iOS Safari etc: no FSA API -> share sheet (Save to Files -> iCloud Drive)
  try {
    const file = new File([text], filename, { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "Zettle Fitness backup" });
      markICloudBackup();
      return;
    }
  } catch (e) {
    if (e && e.name === "AbortError") return;
  }
  // last resort: plain download (iOS lets you "Save to Files" -> iCloud Drive)
  downloadJSON(text, filename);
  markICloudBackup();
  toast("Use Share → Save to Files → iCloud Drive");
}

async function verifyPermission(handle, mode) {
  try {
    const opts = { mode: mode || "readwrite" };
    if (handle.queryPermission && (await handle.queryPermission(opts)) === "granted") return true;
    if (handle.requestPermission && (await handle.requestPermission(opts)) === "granted") return true;
    return !handle.queryPermission; // API missing -> optimistically allow the attempt
  } catch (e) {
    return false;
  }
}

// shared parse + apply for both file import and iCloud restore.
// accepts the new versioned envelope and the legacy bare-array format.
function applyImport(text) {
  const data = JSON.parse(text);
  let log, settings;
  if (Array.isArray(data)) {
    log = data;
  } else if (data && Array.isArray(data.log)) {
    log = data.log;
    settings = data.settings;
  } else {
    throw new Error("bad format");
  }
  saveLog(log);
  if (data && Array.isArray(data.body)) saveBody(data.body);
  if (settings) {
    if (settings.theme) applyTheme(settings.theme);
    if (settings.programStart) {
      localStorage.setItem(START_KEY, settings.programStart);
      localStorage.setItem(WEEKMODE_KEY, settings.weekMode || "manual");
    } else if (settings.programWeek != null) {
      setWeek(settings.programWeek);
    }
    if (settings.equipMode) {
      localStorage.setItem(EQUIP_KEY, settings.equipMode);
      syncEquipToggle();
    }
  }
  return log.length;
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const n = applyImport(reader.result);
      toast("Imported " + n + " sessions");
      switchView("progress");
    } catch (e) {
      toast("Could not import file");
    }
  };
  reader.readAsText(file);
}

async function restoreFromICloud() {
  // guard against clobbering local data with a possibly-older backup
  if (loadLog().length && !confirm("Replace your current workout log with the iCloud backup?")) return;

  if (window.showOpenFilePicker || window.showSaveFilePicker) {
    try {
      let handle = await idbGet("icloudHandle").catch(() => null);
      if (handle && !(await verifyPermission(handle, "read"))) handle = null;
      if (!handle) {
        if (!window.showOpenFilePicker) throw new Error("no open picker");
        [handle] = await window.showOpenFilePicker({
          types: [{ description: "JSON backup", accept: { "application/json": [".json"] } }],
        });
        await idbSet("icloudHandle", handle).catch(() => {});
      }
      const file = await handle.getFile();
      const n = applyImport(await file.text());
      toast("Restored " + n + " sessions ☁️");
      switchView("progress");
      return;
    } catch (e) {
      if (e && e.name === "AbortError") return; // user cancelled
      // otherwise fall through to the plain file picker
    }
  }
  // iOS Safari / unsupported: open the file picker (lets you reach iCloud Drive Files)
  document.getElementById("import-file").click();
}

/* ---------- body / measurements ---------- */
function measSummary(b) {
  const parts = MEAS.filter((m) => b[m.k]).map((m) => `${m.label.toLowerCase()} ${b[m.k]}`);
  return parts.length ? " · " + parts.join(", ") : "";
}
function renderBody() {
  const el = document.getElementById("view-body");
  const body = loadBody().slice().sort((a, b) => a.date.localeCompare(b.date));
  const latest = body[body.length - 1];
  const first = body[0];
  const change = latest && first ? Math.round((latest.weight - first.weight) * 10) / 10 : 0;
  el.innerHTML = `
    <div class="card">
      <h2 style="font-size:1.05rem">Log today's bodyweight</h2>
      <div class="body-input-row">
        <input type="number" inputmode="decimal" id="bw-input" placeholder="${latest ? latest.weight : "lbs"}" />
        <button id="bw-save" class="btn">Log</button>
      </div>
      <div class="focus" style="margin-top:12px">Optional measurements (in)</div>
      <div class="meas-row">
        ${MEAS.map(
          (m) =>
            `<label>${m.label}<input type="number" inputmode="decimal" class="meas" data-k="${m.k}" placeholder="${latest && latest[m.k] ? latest[m.k] : "—"}"/></label>`
        ).join("")}
      </div>
    </div>
    ${
      body.length
        ? `<div class="stat-row">
            <div class="stat"><div class="value">${latest.weight}</div><div class="label">Latest · lbs</div></div>
            <div class="stat"><div class="value">${change >= 0 ? "+" : ""}${change}</div><div class="label">Since start</div></div>
            <div class="stat"><div class="value">${body.length}</div><div class="label">Entries</div></div>
          </div>
          <div class="card"><div class="focus">Bodyweight over time</div><div class="chart-wrap"><canvas id="body-chart" width="700" height="280"></canvas></div></div>
          <div class="card"><h2 style="font-size:1.05rem">History</h2>
            ${body
              .slice()
              .reverse()
              .map((b) => `<div class="history-item"><span class="date">${fmtDate(b.date)}</span><span>${b.weight} lbs${measSummary(b)}</span></div>`)
              .join("")}
          </div>`
        : `<div class="empty">No bodyweight logged yet.<br>You're training to grow — track the goal here.</div>`
    }`;
  if (body.length) drawChart(body.map((b) => ({ date: b.date, value: b.weight })), "body-chart");
}
function logBodyweight() {
  const w = parseFloat(document.getElementById("bw-input").value);
  if (!w) {
    toast("Enter a weight first");
    return;
  }
  const entry = { date: todayISO(), weight: w };
  document.querySelectorAll("#view-body .meas").forEach((inp) => {
    const v = parseFloat(inp.value);
    if (v) entry[inp.dataset.k] = v;
  });
  const arr = loadBody().filter((b) => b.date !== entry.date); // one entry per day
  arr.push(entry);
  saveBody(arr);
  renderBody();
  toast("Bodyweight logged");
}

/* =============================================================
   REMINDERS / timed notifications
   Uses the Notification Triggers API (TimestampTrigger) for alerts
   that fire even when the app is closed (Chromium / installed PWA).
   Falls back to in-app timers + catch-up nudges elsewhere.
   ============================================================= */
const RM = {
  daily: "remindDaily",
  dailyTime: "remindDailyTime",
  post: "remindPost",
  postMin: "remindPostMin",
  lastDaily: "remindLastDaily",
};
function notifPerm() {
  return typeof Notification !== "undefined" ? Notification.permission : "unsupported";
}
function triggersSupported() {
  return typeof Notification !== "undefined" && "showTrigger" in Notification.prototype && typeof TimestampTrigger !== "undefined";
}
async function swReg() {
  return "serviceWorker" in navigator ? navigator.serviceWorker.ready : null;
}
async function notify(title, body, tag, at) {
  const opts = { body, tag, icon: "icon-192.png", badge: "icon-192.png", renotify: true };
  const reg = await swReg();
  if (at && triggersSupported() && reg) {
    try {
      await reg.showNotification(title, { ...opts, showTrigger: new TimestampTrigger(at) });
      return "scheduled";
    } catch (e) {}
  }
  if (at) {
    // fallback: only fires while the page/SW is still alive
    const delay = at - Date.now();
    if (delay > 0 && delay < 6 * 3600 * 1000)
      setTimeout(() => (reg ? reg.showNotification(title, opts) : new Notification(title, opts)), delay);
    return "timer";
  }
  if (reg) reg.showNotification(title, opts);
  else if (notifPerm() === "granted") new Notification(title, opts);
  return "now";
}

async function scheduleDailyReminders() {
  if (localStorage.getItem(RM.daily) !== "1" || notifPerm() !== "granted" || !triggersSupported()) return;
  const reg = await swReg();
  if (!reg) return;
  const [h, m] = (localStorage.getItem(RM.dailyTime) || "17:00").split(":").map(Number);
  const now = Date.now();
  // top up the next two weeks of training-day reminders (tags make this idempotent)
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(h, m, 0, 0);
    if (SCHEDULE[d.getDay()] == null || d.getTime() <= now) continue;
    const di = SCHEDULE[d.getDay()];
    const iso = d.toISOString().slice(0, 10);
    try {
      await reg.showNotification("🏋️ Time to train", {
        body: `Today is ${ROUTINE.days[di].name}. Let's build.`,
        tag: "train-" + iso,
        icon: "icon-192.png",
        badge: "icon-192.png",
        showTrigger: new TimestampTrigger(d.getTime()),
      });
    } catch (e) {}
  }
}

// fallback for browsers without Triggers: nudge on app open / via a timer
function dailyCatchUp() {
  if (localStorage.getItem(RM.daily) !== "1" || notifPerm() !== "granted" || triggersSupported()) return;
  const di = todaysDayIndex();
  if (di == null) return;
  if (loadLog().some((w) => w.date === todayISO())) return; // already trained today
  const [h, m] = (localStorage.getItem(RM.dailyTime) || "17:00").split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (now >= target) {
    if (localStorage.getItem(RM.lastDaily) !== todayISO()) {
      localStorage.setItem(RM.lastDaily, todayISO());
      notify("🏋️ Time to train", `Today is ${ROUTINE.days[di].name}. Let's build.`, "train-" + todayISO());
    }
  } else {
    const delay = target - now;
    if (delay < 12 * 3600 * 1000)
      setTimeout(() => {
        if (!loadLog().some((w) => w.date === todayISO()))
          notify("🏋️ Time to train", `Today is ${ROUTINE.days[di].name}.`, "train-" + todayISO());
      }, delay);
  }
}

async function cancelTodaysTrainingReminder() {
  const reg = await swReg();
  if (!reg || !reg.getNotifications) return;
  try {
    const ns = await reg.getNotifications({ tag: "train-" + todayISO(), includeTriggered: true });
    ns.forEach((n) => n.close());
  } catch (e) {}
}

function schedulePostWorkout() {
  if (localStorage.getItem(RM.post) !== "1" || notifPerm() !== "granted") return;
  const min = parseInt(localStorage.getItem(RM.postMin) || "45", 10);
  notify("🥩 Refuel window", "Eat within the hour — protein first, then carbs.", "refuel", Date.now() + min * 60000);
}

async function enableNotifications() {
  if (typeof Notification === "undefined") {
    toast("Notifications not supported here");
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === "granted") {
    // sensible defaults on first enable
    if (localStorage.getItem(RM.daily) === null) localStorage.setItem(RM.daily, "1");
    if (localStorage.getItem(RM.dailyTime) === null) localStorage.setItem(RM.dailyTime, "17:00");
    if (localStorage.getItem(RM.post) === null) localStorage.setItem(RM.post, "1");
    if (localStorage.getItem(RM.postMin) === null) localStorage.setItem(RM.postMin, "45");
    await scheduleDailyReminders();
    dailyCatchUp();
    toast("Reminders on 🔔");
  } else {
    toast("Notifications blocked");
  }
  renderRoutine();
}

function renderRemindersCard() {
  const perm = notifPerm();
  const support = triggersSupported()
    ? "Scheduled alerts fire even when the app is closed."
    : "Alerts fire while the app is open or recently active. Add to your Home Screen for the best results.";
  if (perm === "unsupported")
    return `<div class="card reminders-card"><h2 style="font-size:1.05rem">🔔 Reminders</h2><div class="focus">This browser doesn't support notifications.</div></div>`;
  if (perm !== "granted")
    return `<div class="card reminders-card">
      <h2 style="font-size:1.05rem">🔔 Reminders</h2>
      <div class="focus" style="margin-bottom:12px">Get a nudge to train and to refuel after lifting.</div>
      <button id="notif-enable" class="btn full">Enable notifications</button>
      <div class="focus" style="margin-top:10px">${support}</div>
    </div>`;
  const dailyOn = localStorage.getItem(RM.daily) === "1";
  const dailyTime = localStorage.getItem(RM.dailyTime) || "17:00";
  const postOn = localStorage.getItem(RM.post) === "1";
  const postMin = localStorage.getItem(RM.postMin) || "45";
  return `<div class="card reminders-card">
    <h2 style="font-size:1.05rem">🔔 Reminders</h2>
    <label class="rem-row">
      <input type="checkbox" id="rem-daily" ${dailyOn ? "checked" : ""}/>
      <span class="rem-label">Daily training reminder</span>
      <input type="time" id="rem-daily-time" value="${dailyTime}" />
    </label>
    <label class="rem-row">
      <input type="checkbox" id="rem-post" ${postOn ? "checked" : ""}/>
      <span class="rem-label">Post-workout refuel alert</span>
      <span class="rem-min"><input type="number" id="rem-post-min" value="${postMin}" min="5" max="120"/> min</span>
    </label>
    <div class="focus" style="margin-top:10px">${support}</div>
  </div>`;
}

function handleReminderChange(e) {
  const id = e.target.id;
  if (id === "rem-daily") {
    localStorage.setItem(RM.daily, e.target.checked ? "1" : "0");
    scheduleDailyReminders();
    dailyCatchUp();
  } else if (id === "rem-daily-time") {
    localStorage.setItem(RM.dailyTime, e.target.value || "17:00");
    scheduleDailyReminders();
  } else if (id === "rem-post") {
    localStorage.setItem(RM.post, e.target.checked ? "1" : "0");
  } else if (id === "rem-post-min") {
    localStorage.setItem(RM.postMin, String(Math.min(120, Math.max(5, parseInt(e.target.value, 10) || 45))));
  }
}

/* ---------- view switching + init ---------- */
function switchView(name) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === name));
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
  if (name === "routine") renderRoutine();
  if (name === "track") renderTrack();
  if (name === "progress") renderProgress();
  if (name === "body") renderBody();
}

async function init() {
  await maybeRestoreFromIDB(); // layer 1: recover if localStorage was wiped
  applyTheme(localStorage.getItem(THEME_KEY) || "aurora");
  const todayDi = todaysDayIndex();
  if (todayDi != null) trackState.dayIndex = todayDi; // default Track to today's workout

  document.getElementById("app-title").textContent = ROUTINE.title || "My Workout Routine";
  document.title = ROUTINE.title || "Workout";

  document.querySelectorAll(".tab").forEach((t) =>
    t.addEventListener("click", () => switchView(t.dataset.view))
  );
  document.getElementById("theme-btn").addEventListener("click", cycleTheme);

  // equipment mode toggle (home kettlebell/band vs gym)
  syncEquipToggle();
  document.getElementById("equip-toggle").addEventListener("click", (e) => {
    const b = e.target.closest(".equip-opt");
    if (!b) return;
    setMode(b.dataset.mode);
    syncEquipToggle();
    refreshActiveView();
  });

  // routine: today CTA + reminders + open exercise detail
  document.getElementById("view-routine").addEventListener("click", (e) => {
    if (e.target.id === "notif-enable") {
      enableNotifications();
      return;
    }
    const start = e.target.closest(".today-start");
    if (start) {
      trackState.dayIndex = +start.dataset.day;
      trackState.data = initTrackData(ROUTINE.days[trackState.dayIndex]);
      switchView("track");
      return;
    }
    const row = e.target.closest(".exercise-row.clickable");
    if (row && row.dataset.ex) openExercise(decodeURIComponent(row.dataset.ex));
  });
  document.getElementById("view-routine").addEventListener("change", handleReminderChange);

  const track = document.getElementById("view-track");
  track.addEventListener("input", handleTrackInput);
  track.addEventListener("click", handleTrackClick);
  track.addEventListener("change", (e) => {
    if (e.target.id === "week-select") {
      setWeek(parseInt(e.target.value, 10));
    } else if (e.target.id === "auto-week") {
      if (e.target.checked) setProgramStart(localStorage.getItem(START_KEY) || todayISO());
      else {
        localStorage.setItem(WEEKMODE_KEY, "manual");
        mirrorToIDB();
      }
    } else if (e.target.id === "start-date") {
      if (e.target.value) setProgramStart(e.target.value);
    } else {
      return;
    }
    trackState.data = initTrackData(ROUTINE.days[trackState.dayIndex]);
    renderTrack();
  });

  // modal close interactions
  const modalRoot = document.getElementById("modal-root");
  modalRoot.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-backdrop") || e.target.closest(".modal-close")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // rest timer controls (delegated)
  document.getElementById("rest-timer").addEventListener("click", (e) => {
    if (e.target.classList.contains("skip")) RestTimer.stop();
    else if (e.target.classList.contains("pause")) RestTimer.togglePause();
    else if (e.target.classList.contains("adj")) RestTimer.adjust(+e.target.dataset.d);
  });

  // Focus Mode controls (delegated)
  const focusRoot = document.getElementById("focus-root");
  focusRoot.addEventListener("input", () => FocusMode.saveInputs());
  focusRoot.addEventListener("click", (e) => {
    if (e.target.closest(".focus-close")) FocusMode.close();
    else if (e.target.closest(".focus-prev")) {
      FocusMode.saveInputs();
      FocusMode.go(-1);
    } else if (e.target.closest(".focus-next")) FocusMode.logAndNext();
    else if (e.target.closest(".focus-video-toggle")) {
      const v = exView(findExercise(FocusMode.current().name));
      const box = focusRoot.querySelector(".focus-video");
      if (!box) return;
      if (box.hidden) {
        box.innerHTML = `<div class="video-wrap"><iframe src="https://www.youtube.com/embed/${v.videoId}" title="${v.name} tutorial" loading="lazy" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`;
        box.hidden = false;
      } else {
        box.hidden = true;
        box.innerHTML = "";
      }
    }
  });

  // body tab: log bodyweight
  document.getElementById("view-body").addEventListener("click", (e) => {
    if (e.target.id === "bw-save") logBodyweight();
  });

  // celebration dismiss
  document.getElementById("celebrate-root").addEventListener("click", (e) => {
    if (e.target.classList.contains("celebrate-close") || e.target.id === "celebrate-root")
      document.getElementById("celebrate-root").hidden = true;
  });

  // PWA service worker (needs https; GitHub Pages qualifies)
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  // refresh scheduled reminders for this device
  if (notifPerm() === "granted") {
    scheduleDailyReminders();
    dailyCatchUp();
  }

  document.getElementById("export-btn").addEventListener("click", exportData);
  document.getElementById("more-toggle").addEventListener("click", (e) => {
    const actions = document.getElementById("footer-actions");
    const open = actions.hidden;
    actions.hidden = !open;
    e.currentTarget.setAttribute("aria-expanded", String(open));
    e.currentTarget.textContent = open ? "Backup & data ✕" : "Backup & data ⋯";
  });
  document.getElementById("icloud-btn").addEventListener("click", saveToICloud);
  document.getElementById("icloud-restore-btn").addEventListener("click", restoreFromICloud);
  document.getElementById("import-btn").addEventListener("click", () =>
    document.getElementById("import-file").click()
  );
  document.getElementById("import-file").addEventListener("change", (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
  });

  // Sunday backup nudge (layer 2)
  document.getElementById("nudge-banner").addEventListener("click", (e) => {
    if (e.target.classList.contains("nudge-backup")) {
      exportData();
      document.getElementById("nudge-banner").hidden = true;
    } else if (e.target.classList.contains("nudge-snooze")) {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
      document.getElementById("nudge-banner").hidden = true;
    }
  });

  renderLastBackup();
  maybeShowBackupNudge();
  if (pendingRestoreToast) toast("Restored from backup");

  renderRoutine();
}

document.addEventListener("DOMContentLoaded", init);
