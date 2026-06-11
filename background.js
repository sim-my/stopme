// background.js — service worker. Detects tab changes, classifies against the
// user's site lists, tracks time spent, and tells the content script to show a cat.

importScripts(
  "src/config.js",
  "src/settings.js",
  "src/memory.js",
  "src/messages.js",
);

// ---- Helpers ----
function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// Pick a cat that matches the category's mood
function pickCatForCategory(category) {
  const mood = self.STOPME_CONFIG.CATEGORY_TO_MOOD[category];
  const matching = self.STOPME_CONFIG.CATS.filter((c) => c.mood === mood);
  const pool = matching.length > 0 ? matching : self.STOPME_CONFIG.CATS;
  return self.STOPME_CONFIG.randomPick(pool);
}

// ======================================================================
//  Time tracking
//  The "active" tracked tab is persisted to storage (not just memory) so
//  elapsed time survives the service worker being put to sleep.
// ======================================================================
const ACTIVE_KEY = "stopme_active";
const MAX_FLUSH_MS = 6 * 60 * 60 * 1000; // ignore implausibly long single sessions

async function getActive() {
  const r = await chrome.storage.local.get(ACTIVE_KEY);
  return r[ACTIVE_KEY] || null;
}

async function clearActive() {
  await chrome.storage.local.remove(ACTIVE_KEY);
}

// Add the elapsed time of the current active session to memory, then clear it.
async function flushActive() {
  const active = await getActive();
  if (!active) return;
  const elapsed = Date.now() - active.since;
  if (
    elapsed > 0 &&
    elapsed < MAX_FLUSH_MS &&
    (active.category === "distracting" || active.category === "productive")
  ) {
    await self.STOPME_MEMORY.addTime(active.domain, active.category, elapsed);
  }
  await clearActive();
}

// Begin a new tracking session if this URL is a tracked category.
async function startActive(tabId, url, settings) {
  const category = self.STOPME_SETTINGS.classify(url, settings);
  if (category === "distracting" || category === "productive") {
    await chrome.storage.local.set({
      [ACTIVE_KEY]: { tabId, domain: getDomain(url), category, since: Date.now() },
    });
  }
}

// ======================================================================
//  Showing the cat (with a per-tab cooldown to avoid SPA scroll spam)
// ======================================================================
const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
const lastTriggerByTab = {}; // tabId -> { domain, at }

async function showCat(tabId, url, settings) {
  const category = self.STOPME_SETTINGS.classify(url, settings);
  const domain = getDomain(url);
  if (!domain) return;

  // Only judge sites the user actually listed. Everything else ("unknown",
  // e.g. youtube.com, gmail.com) is left alone.
  if (category !== "distracting" && category !== "productive") return;

  // Per-tab cooldown: skip same-domain churn (Instagram rewriting the URL while
  // you scroll), but nag again if you come back after a couple of minutes.
  const last = lastTriggerByTab[tabId];
  if (last && last.domain === domain && Date.now() - last.at < COOLDOWN_MS) {
    return;
  }
  lastTriggerByTab[tabId] = { domain, at: Date.now() };

  // Record visit + build memory context
  const context = await self.STOPME_MEMORY.recordVisit(domain, category);
  const message = self.STOPME_MESSAGES.pick(context);
  const cat = pickCatForCategory(category);

  console.log("[bg] →", domain, "|", category, "|", message.replace(/\n/g, " "));

  try {
    await chrome.tabs.sendMessage(tabId, {
      type: "STOPME_SHOW",
      payload: { cat, message, meow: settings.meowEnabled },
    });
  } catch {
    // Content script not loaded (chrome:// page, error page, etc.) — ignore
  }
}

// ======================================================================
//  Central handler: account for time, then maybe show the cat.
// ======================================================================
async function handleTab(tabId, url) {
  if (!url || !url.startsWith("http")) return; // skip chrome://, file://, etc.

  const settings = await self.STOPME_SETTINGS.load();
  const paused = self.STOPME_SETTINGS.isPaused(settings);

  // Time accounting: close out the previous session, open a new one.
  await flushActive();
  if (!paused) await startActive(tabId, url, settings);

  if (paused) return;
  await showCat(tabId, url, settings);
}

// ---- Listeners ----
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only act on the active tab finishing a load (ignore background tabs).
  if (changeInfo.status === "complete" && tab.active && tab.url) {
    handleTab(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url) handleTab(tabId, tab.url);
  } catch {}
});

// Browser focus changes: pause/resume time tracking when you leave the browser.
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await flushActive(); // left the browser — stop the clock
    return;
  }
  try {
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab?.url) handleTab(tab.id, tab.url);
  } catch {}
});

// Tab closed: flush its time and forget cooldown state.
chrome.tabs.onRemoved.addListener(async (tabId) => {
  delete lastTriggerByTab[tabId];
  const active = await getActive();
  if (active && active.tabId === tabId) await flushActive();
});
