// background.js — service worker. Detects tab changes, picks message + cat, sends to content script.

importScripts("src/config.js", "src/memory.js", "src/messages.js");

// ---- URL category lists ----
const SITES = {
  distracting: [
    "instagram.com",
    "facebook.com",
    "twitter.com",
    "x.com",
    "reddit.com",
    "tiktok.com",
  ],
  productive: [
    "github.com",
    "stackoverflow.com",
    "developer.mozilla.org",
    "dev.to",
    "freecodecamp.org",
    "leetcode.com",
  ],
  youtube: ["youtube.com"],
};

const URL_TYPE = {
  distracting: "distracting",
  productive: "productive",
  youtube: "youtube",
  unknown: "unknown",
};

// ---- Helpers ----
function classifyURL(url) {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, "");
    if (SITES.distracting.includes(domain)) return URL_TYPE.distracting;
    if (SITES.productive.includes(domain)) return URL_TYPE.productive;
    if (SITES.youtube.includes(domain)) return URL_TYPE.youtube;
    return URL_TYPE.unknown;
  } catch {
    return URL_TYPE.unknown;
  }
}

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
  // Fallback to any cat if no mood match
  const pool = matching.length > 0 ? matching : self.STOPME_CONFIG.CATS;
  return self.STOPME_CONFIG.randomPick(pool);
}

// ---- Main trigger: called on tab change ----
async function triggerOnTab(tabId, url) {
  if (!url || !url.startsWith("http")) return; // skip chrome://, file://, etc.

  const category = classifyURL(url);
  const domain = getDomain(url);
  if (!domain) return;

  // Record visit + build memory context
  const context = await self.STOPME_MEMORY.recordVisit(domain, category);

  // Pick message + cat based on context
  const message = self.STOPME_MESSAGES.pick(context);
  const cat = pickCatForCategory(category);

  console.log(
    "[bg] →",
    domain,
    "|",
    category,
    "|",
    message.replace(/\n/g, " "),
  );

  // Send to content script in that tab
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: "STOPME_SHOW",
      payload: { cat, message },
    });
  } catch (err) {
    // Content script not loaded (chrome:// page, error page, etc.) — ignore
  }
}

// ---- Listeners ----
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Fires when page finishes loading
  if (changeInfo.status === "complete" && tab.url) {
    triggerOnTab(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  // Fires when user switches tabs
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url) triggerOnTab(tabId, tab.url);
  } catch {}
});
