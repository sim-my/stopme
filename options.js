// options.js — drives the settings popup. Reads/writes settings + memory;
// everything saves automatically.

const SETTINGS = window.STOPME_SETTINGS;
const MEMORY = window.STOPME_MEMORY;

// ---- Format helpers ----
function fmtDuration(ms) {
  const mins = Math.round(ms / 60000);
  if (mins < 1) return ms > 0 ? "<1m" : "0m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// Live countdown: shows seconds under an hour so the timer visibly ticks.
function fmtCountdown(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ======================================================================
//  Pause
// ======================================================================
let pauseDeadline = 0; // cached so the 1s ticker doesn't hit storage each time

function paintPause() {
  const presets = document.getElementById("pause-presets");
  const banner = document.getElementById("pause-banner");
  const heroStatus = document.getElementById("hero-status");
  const heroText = document.getElementById("hero-status-text");
  const paused = pauseDeadline > Date.now();

  if (paused) {
    document.getElementById("pause-banner-text").textContent =
      `Paused · ${fmtCountdown(pauseDeadline - Date.now())} left`;
    presets.hidden = true;
    banner.hidden = false;
    heroStatus.classList.add("paused");
    heroText.textContent = "paused";
  } else {
    pauseDeadline = 0;
    presets.hidden = false;
    banner.hidden = true;
    heroStatus.classList.remove("paused");
    heroText.textContent = "active";
  }
}

async function renderPause() {
  const settings = await SETTINGS.load();
  pauseDeadline = SETTINGS.isPaused(settings) ? settings.pausedUntil : 0;
  paintPause();
}

async function onPauseClick(e) {
  const btn = e.target.closest("button[data-pause]");
  if (!btn) return;
  const val = btn.dataset.pause;
  if (val === "resume") {
    await SETTINGS.update({ pausedUntil: 0 });
    pauseDeadline = 0;
  } else {
    pauseDeadline = Date.now() + Number(val) * 60000;
    await SETTINGS.update({ pausedUntil: pauseDeadline });
  }
  paintPause();
}
document.getElementById("pause-presets").addEventListener("click", onPauseClick);
document.getElementById("pause-banner").addEventListener("click", onPauseClick);

// ======================================================================
//  Theme (light / dark)
// ======================================================================
function applyTheme(dark) {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  // Show the icon for the mode you'd switch TO.
  document.querySelector("#theme-btn .theme-icon").textContent = dark
    ? "☀️"
    : "🌙";
}

async function renderTheme() {
  const settings = await SETTINGS.load();
  applyTheme(settings.darkMode);
}

document.getElementById("theme-btn").addEventListener("click", async () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  applyTheme(dark);
  await SETTINGS.update({ darkMode: dark });
});

// ======================================================================
//  Meow toggle
// ======================================================================
async function renderMeow() {
  const settings = await SETTINGS.load();
  document.getElementById("meow-toggle").checked = settings.meowEnabled;
}

document.getElementById("meow-toggle").addEventListener("change", async (e) => {
  await SETTINGS.update({ meowEnabled: e.target.checked });
  if (e.target.checked) window.STOPME_SOUND.meow();
});

document.getElementById("meow-test").addEventListener("click", () => {
  window.STOPME_SOUND.meow();
});

// ======================================================================
//  Site lists
// ======================================================================
async function renderLists() {
  const settings = await SETTINGS.load();
  for (const category of ["distracting", "productive"]) {
    const ul = document.getElementById(`list-${category}`);
    const sites = settings.sites[category];
    ul.innerHTML = "";
    if (sites.length === 0) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "nothing yet";
      ul.appendChild(li);
      continue;
    }
    for (const domain of sites) {
      const li = document.createElement("li");
      li.className = "chip";
      const span = document.createElement("span");
      span.textContent = domain;
      const x = document.createElement("button");
      x.textContent = "×";
      x.title = `Remove ${domain}`;
      x.addEventListener("click", async () => {
        await SETTINGS.removeSite(category, domain);
        renderLists();
        renderStats();
      });
      li.append(span, x);
      ul.appendChild(li);
    }
  }
}

document.querySelectorAll("form.add").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    const category = form.dataset.category;
    if (!SETTINGS.normalizeDomain(input.value)) return;
    await SETTINGS.addSite(category, input.value);
    input.value = "";
    renderLists();
    renderStats();
  });
});

// ======================================================================
//  Stats
// ======================================================================
async function renderStats() {
  const settings = await SETTINGS.load();
  const stats = await MEMORY.getStats(settings);

  const block = (label, data, kind) => {
    const max = data.sites.reduce((m, s) => Math.max(m, s.timeMs), 0) || 1;
    const rows = data.sites
      .slice(0, 3)
      .map((s) => {
        const pct = Math.max(4, Math.round((s.timeMs / max) * 100));
        return `
          <div class="brow">
            <div class="blabel"><b>${s.domain}</b><span>${fmtDuration(s.timeMs)} · ${s.visits}×</span></div>
            <div class="bbar"><i style="width:${pct}%"></i></div>
          </div>`;
      })
      .join("");
    return `
      <div class="stat stat--${kind}">
        <h3>${label}</h3>
        <div class="big">${data.visits} <span>visits</span></div>
        <div class="meta">${fmtDuration(data.timeMs)} spent</div>
        ${rows ? `<div class="breakdown">${rows}</div>` : ""}
      </div>`;
  };

  document.getElementById("stats").innerHTML =
    block("Distracting", stats.distracting, "bad") +
    block("Productive", stats.productive, "good");
}

document.getElementById("reset-btn").addEventListener("click", async () => {
  if (!confirm("Reset all visit counts and time spent for today?")) return;
  await MEMORY.resetAll();
  renderStats();
});

// ======================================================================
//  Init
// ======================================================================
function init() {
  renderTheme();
  renderPause();
  renderMeow();
  renderLists();
  renderStats();
}
init();
// Tick the pause countdown every second (cheap — reads cached deadline only).
setInterval(paintPause, 1000);
