/* =============================================================
   Workout app logic: routine display, tracking, progress charts.
   Stores all logged workouts in localStorage (key: "workoutLog").
   No external libraries — runs by just opening index.html.
   ============================================================= */

const STORAGE_KEY = "workoutLog";

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

/* A logged workout:
   { id, date, day, entries: [ { name, sets: [ {weight, reps} ] } ] } */

/* ---------- helpers ---------- */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
// Estimated 1-rep max (Epley formula)
function e1rm(weight, reps) {
  if (!weight || !reps) return 0;
  return weight * (1 + reps / 30);
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

// Most recent logged sets for a given exercise (for "last time" hints)
function lastEntryFor(name) {
  const log = loadLog();
  for (let i = log.length - 1; i >= 0; i--) {
    const e = log[i].entries.find((x) => x.name === name);
    if (e && e.sets.some((s) => s.weight || s.reps)) return { date: log[i].date, entry: e };
  }
  return null;
}

/* ---------- routine view ---------- */
function exMeta(ex) {
  const bits = [];
  if (ex.rest) bits.push(`rest ${ex.rest}`);
  if (ex.rir && ex.rir !== "—") bits.push(`RIR ${ex.rir}`);
  if (ex.note) bits.push(ex.note);
  return bits.join(" · ");
}

function renderRoutine() {
  const el = document.getElementById("view-routine");
  const phases = ROUTINE.phases
    ? `<div class="card">
        <h2 style="font-size:1.05rem">Progression Phases</h2>
        ${ROUTINE.phases
          .map(
            (p) =>
              `<div class="exercise-row">
                 <span><span class="name">${p.name}</span><span class="note">Weeks ${p.weeks} · ${p.focus}</span></span>
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
          <div class="exercise-row">
            <span>
              <span class="name">${ex.name}</span>
              ${meta ? `<span class="note">${meta}</span>` : ""}
            </span>
            <span class="scheme">${ex.sets} × ${ex.reps}</span>
          </div>`;
          })
          .join("")}
      </div>`
      )
      .join("") +
    phases;
}

/* ---------- track view ---------- */
let trackState = { dayIndex: 0, data: {} };

function initTrackData(day) {
  const data = {};
  day.exercises.forEach((ex) => {
    data[ex.name] = Array.from({ length: ex.sets }, () => ({ weight: "", reps: "", done: false }));
  });
  return data;
}

function renderTrack() {
  const el = document.getElementById("view-track");
  const day = ROUTINE.days[trackState.dayIndex];
  if (Object.keys(trackState.data).length === 0) trackState.data = initTrackData(day);

  el.innerHTML = `
    <div class="day-picker">
      ${ROUTINE.days
        .map(
          (d, i) =>
            `<button class="day-chip ${i === trackState.dayIndex ? "active" : ""}" data-day="${i}">${d.name}</button>`
        )
        .join("")}
    </div>
    ${day.exercises
      .map((ex) => {
        const last = lastEntryFor(ex.name);
        const lastTxt = last
          ? `Last (${fmtDate(last.date)}): ` +
            last.entry.sets
              .filter((s) => s.weight || s.reps)
              .map((s) => `${s.weight || "–"}×${s.reps || "–"}`)
              .join(", ")
          : "No history yet";
        const sets = trackState.data[ex.name];
        return `
        <div class="card">
          <h2 style="font-size:1.05rem">${ex.name}</h2>
          <div class="focus">Target: ${ex.sets} × ${ex.reps}</div>
          <div class="last-time">${lastTxt}</div>
          <div class="set-head">
            <span>Set</span><span>Weight</span><span>Reps</span><span></span>
          </div>
          ${sets
            .map(
              (s, i) => `
            <div class="set-grid" data-ex="${encodeURIComponent(ex.name)}" data-set="${i}">
              <span class="set-num">${i + 1}</span>
              <input type="number" inputmode="decimal" class="w" placeholder="0" value="${s.weight}" />
              <input type="number" inputmode="numeric" class="r" placeholder="0" value="${s.reps}" />
              <button class="check ${s.done ? "done" : ""}">✓</button>
            </div>`
            )
            .join("")}
        </div>`;
      })
      .join("")}
    <button id="save-workout" class="btn full">Save workout</button>
  `;
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
  // day switch
  const chip = e.target.closest(".day-chip");
  if (chip) {
    trackState.dayIndex = +chip.dataset.day;
    trackState.data = initTrackData(ROUTINE.days[trackState.dayIndex]);
    renderTrack();
    return;
  }
  // check off a set
  if (e.target.classList.contains("check")) {
    const grid = e.target.closest(".set-grid");
    const ex = decodeURIComponent(grid.dataset.ex);
    const i = +grid.dataset.set;
    trackState.data[ex][i].done = !trackState.data[ex][i].done;
    e.target.classList.toggle("done");
    return;
  }
  // save
  if (e.target.id === "save-workout") saveWorkout();
}

function saveWorkout() {
  const day = ROUTINE.days[trackState.dayIndex];
  const entries = day.exercises.map((ex) => ({
    name: ex.name,
    sets: trackState.data[ex.name]
      .filter((s) => s.weight !== "" || s.reps !== "")
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
  // one point per workout date: best estimated 1RM that day
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
    <select class="exercise-select">
      ${names.map((n) => `<option ${n === selected ? "selected" : ""}>${n}</option>`).join("")}
    </select>
    <div id="progress-body"></div>
  `;
  renderProgressBody(selected);
  el.querySelector(".exercise-select").addEventListener("change", (e) =>
    renderProgressBody(e.target.value)
  );
}

function renderProgressBody(name) {
  const body = document.getElementById("progress-body");
  const pts = seriesFor(name);
  if (pts.length === 0) {
    body.innerHTML = `<div class="empty">No logged sets for ${name} yet.</div>`;
    return;
  }
  const best = Math.max(...pts.map((p) => p.e1rm));
  const latest = pts[pts.length - 1];
  const first = pts[0];
  const change = latest.e1rm - first.e1rm;

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
    </div>
  `;
  drawChart(pts.map((p) => ({ date: p.date, value: p.e1rm })));
}

/* ---------- simple canvas line chart (no libraries) ---------- */
function drawChart(points) {
  const canvas = document.getElementById("chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width,
    H = canvas.height;
  const pad = { l: 44, r: 16, t: 16, b: 28 };
  ctx.clearRect(0, 0, W, H);

  const xs = points.map((_, i) => i);
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

  // x labels (first, mid, last)
  ctx.textAlign = "center";
  const labelIdx = points.length <= 1 ? [0] : [0, Math.floor((points.length - 1) / 2), points.length - 1];
  [...new Set(labelIdx)].forEach((i) => {
    const d = new Date(points[i].date + "T00:00:00");
    ctx.fillText(
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      xAt(i),
      H - 8
    );
  });
  ctx.textAlign = "left";

  // neon gradient line for the stroke
  const grad = ctx.createLinearGradient(pad.l, 0, W - pad.r, 0);
  grad.addColorStop(0, "#22e0ff");
  grad.addColorStop(1, "#9d6bff");

  // line (with glow)
  ctx.save();
  ctx.shadowColor = "rgba(34,224,255,0.7)";
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
  fill.addColorStop(0, "rgba(34,224,255,0.28)");
  fill.addColorStop(1, "rgba(157,107,255,0.02)");
  ctx.fillStyle = fill;
  ctx.fill();

  // dots (glowing)
  points.forEach((p, i) => {
    const x = xAt(i),
      y = yAt(p.value);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#04070f";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#22e0ff";
    ctx.shadowColor = "rgba(34,224,255,0.9)";
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
  document.getElementById("app-title").textContent = ROUTINE.title || "My Workout Routine";
  document.title = ROUTINE.title || "Workout";

  document.querySelectorAll(".tab").forEach((t) =>
    t.addEventListener("click", () => switchView(t.dataset.view))
  );

  const track = document.getElementById("view-track");
  track.addEventListener("input", handleTrackInput);
  track.addEventListener("click", handleTrackClick);

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
