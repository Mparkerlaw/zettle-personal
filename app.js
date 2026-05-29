/* =============================================================
   Workout app logic: routine display, exercise detail, tracking,
   rest timer, progress charts, and theme switching.
   Stores logged workouts + theme in localStorage. No libraries.
   ============================================================= */

const STORAGE_KEY = "workoutLog";
const THEME_KEY = "workoutTheme";
const WEEK_KEY = "programWeek";
const THEMES = ["aurora", "solar", "matrix", "vapor"];
const THEME_LABELS = { aurora: "Aurora", solar: "Solar", matrix: "Matrix", vapor: "Vapor" };

/* ---------- program week / phase ---------- */
// Stored week: 1..8 for the program, or 0 for a deload week.
function getWeek() {
  const w = parseInt(localStorage.getItem(WEEK_KEY), 10);
  return isNaN(w) ? 1 : w;
}
function setWeek(w) {
  localStorage.setItem(WEEK_KEY, w);
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
    (ROUTINE.subtitle ? `<p class="focus" style="margin-top:-4px">${ROUTINE.subtitle}</p>` : "") +
    ROUTINE.days
      .map(
        (day) => `
      <div class="card">
        <h2>${day.name}</h2>
        <p class="focus">${day.focus || ""}</p>
        ${day.exercises
          .map((ex) => {
            const meta = exMeta(ex);
            return `
          <div class="exercise-row clickable" data-ex="${encodeURIComponent(ex.name)}">
            <span class="left">
              <span>
                <span class="name">${ex.name}</span>
                ${meta ? `<span class="note">${meta}</span>` : ""}
              </span>
            </span>
            <span class="scheme">${ex.sets} × ${ex.reps}</span>
            <span class="chev">›</span>
          </div>`;
          })
          .join("")}
      </div>`
      )
      .join("") +
    phases;
}

/* ---------- exercise detail modal ---------- */
function openExercise(name) {
  const ex = findExercise(name);
  if (!ex) return;
  const root = document.getElementById("modal-root");
  const modal = root.querySelector(".modal");
  const cues = (ex.cues || []).map((c) => `<li>${c}</li>`).join("");
  modal.innerHTML = `
    <div class="grip"></div>
    <button class="modal-close" aria-label="Close">✕</button>
    <h2>${ex.name}</h2>
    ${ex.muscles ? `<div class="muscle-chips">${ex.muscles.split(",").map((m) => `<span class="chip">${m.trim()}</span>`).join("")}</div>` : ""}
    <div class="meta-grid">
      <div class="meta-box"><div class="v">${ex.sets} × ${ex.reps}</div><div class="l">Sets × Reps</div></div>
      <div class="meta-box"><div class="v">${ex.rest || "—"}</div><div class="l">Rest</div></div>
      <div class="meta-box"><div class="v">${ex.rir || "—"}</div><div class="l">RIR</div></div>
    </div>
    ${cues ? `<div class="how-title">How to do it</div><ol class="cue-list">${cues}</ol>` : ""}
    ${
      ex.videoId
        ? `<div class="how-title">Video tutorial</div>
           <div class="video-wrap">
             <iframe src="https://www.youtube.com/embed/${ex.videoId}" title="${ex.name} tutorial"
                     loading="lazy" allowfullscreen
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
           </div>`
        : ""
    }
    <a class="yt-btn" href="${ytSearchUrl(ex)}" target="_blank" rel="noopener">
      <span class="yt-play">▶</span> ${ex.videoId ? "Find more tutorials" : "Watch how-to on YouTube"}
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
let trackState = { dayIndex: 0, data: {} };

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
  const weekOpts =
    `<option value="0" ${wk === 0 ? "selected" : ""}>Deload week</option>` +
    [1, 2, 3, 4, 5, 6, 7, 8]
      .map((n) => `<option value="${n}" ${wk === n ? "selected" : ""}>Week ${n}</option>`)
      .join("");

  el.innerHTML = `
    <div class="card phase-card">
      <div class="phase-top">
        <div>
          <div class="rest-label">Program ${wk === 0 ? "" : "· Week " + wk}</div>
          <div class="phase-name">${ph.name} phase</div>
        </div>
        <select id="week-select" class="week-select">${weekOpts}</select>
      </div>
      <div class="focus" style="margin:10px 0 0">Target RIR this phase: <b style="color:var(--cyan)">${ph.rir}</b>${
        ph.deload ? " · half the sets, same weight" : ""
      } · sets adjust automatically below</div>
    </div>
    <div class="day-picker">
      ${ROUTINE.days
        .map(
          (d, i) =>
            `<button class="day-chip ${i === trackState.dayIndex ? "active" : ""}" data-day="${i}">${d.name}</button>`
        )
        .join("")}
    </div>
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
        return `
        <div class="card">
          <div class="track-ex-head" data-ex="${encodeURIComponent(ex.name)}">
            <h2 style="font-size:1.05rem">${ex.name}</h2>
            <span class="info-pill">How-to ›</span>
          </div>
          <div class="focus">Target: ${effectiveSets(ex, wk)} × ${ex.reps}${ex.rest ? " · rest " + ex.rest : ""}</div>
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
  const grid = e.target.closest(".set-grid");
  if (!grid) return;
  const ex = decodeURIComponent(grid.dataset.ex);
  const i = +grid.dataset.set;
  if (e.target.classList.contains("w")) trackState.data[ex][i].weight = e.target.value;
  if (e.target.classList.contains("r")) trackState.data[ex][i].reps = e.target.value;
}

function handleTrackClick(e) {
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
  const log = loadLog();
  log.push({ id: Date.now(), date: todayISO(), day: day.name, entries });
  saveLog(log);
  trackState.data = initTrackData(day);
  RestTimer.stop();
  renderTrack();
  toast("Workout saved 💪");
}

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
    if (best > 0) points.push({ date: w.date, e1rm: Math.round(best), topWeight, volume });
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

  return `
    <div class="stat-row">
      <div class="stat"><div class="value">${streak}</div><div class="label">Week streak</div></div>
      <div class="stat"><div class="value">${thisWeek}</div><div class="label">This week</div></div>
      <div class="stat"><div class="value">${total}</div><div class="label">Total sessions</div></div>
    </div>
    <div class="card">
      <div class="focus">Training calendar · last ${WEEKS} weeks</div>
      <div class="cal-grid">${dayHeads}${cells}</div>
    </div>`;
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
            `<div class="history-item"><span class="date">${fmtDate(p.date)}</span><span>top ${p.topWeight} · e1RM ${p.e1rm} · vol ${Math.round(p.volume)}</span></div>`
        )
        .join("")}
    </div>`;
  drawChart(pts.map((p) => ({ date: p.date, value: p.e1rm })));
}

/* ---------- theme-aware canvas chart ---------- */
function drawChart(points) {
  const canvas = document.getElementById("chart");
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

/* ---------- export / import ---------- */
function exportData() {
  const blob = new Blob([JSON.stringify(loadLog(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `workout-log-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error("bad format");
      saveLog(data);
      toast("Data imported");
      switchView("progress");
    } catch (e) {
      toast("Could not import file");
    }
  };
  reader.readAsText(file);
}

/* ---------- view switching + init ---------- */
function switchView(name) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === name));
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
  if (name === "routine") renderRoutine();
  if (name === "track") renderTrack();
  if (name === "progress") renderProgress();
}

function init() {
  applyTheme(localStorage.getItem(THEME_KEY) || "aurora");

  document.getElementById("app-title").textContent = ROUTINE.title || "My Workout Routine";
  document.title = ROUTINE.title || "Workout";

  document.querySelectorAll(".tab").forEach((t) =>
    t.addEventListener("click", () => switchView(t.dataset.view))
  );
  document.getElementById("theme-btn").addEventListener("click", cycleTheme);

  // routine: open exercise detail
  document.getElementById("view-routine").addEventListener("click", (e) => {
    const row = e.target.closest(".exercise-row.clickable");
    if (row && row.dataset.ex) openExercise(decodeURIComponent(row.dataset.ex));
  });

  const track = document.getElementById("view-track");
  track.addEventListener("input", handleTrackInput);
  track.addEventListener("click", handleTrackClick);
  track.addEventListener("change", (e) => {
    if (e.target.id === "week-select") {
      setWeek(parseInt(e.target.value, 10));
      trackState.data = initTrackData(ROUTINE.days[trackState.dayIndex]);
      renderTrack();
    }
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

  document.getElementById("export-btn").addEventListener("click", exportData);
  document.getElementById("import-btn").addEventListener("click", () =>
    document.getElementById("import-file").click()
  );
  document.getElementById("import-file").addEventListener("change", (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
  });

  renderRoutine();
}

document.addEventListener("DOMContentLoaded", init);
