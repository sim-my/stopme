// background.js — service worker. Watches tab changes and classifies URLs.

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

// ---- Classification ----
const URL_TYPE = {
  distracting: "distracting",
  productive: "productive",
  youtube: "youtube",
  unknown: "unknown",
};

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

// ---- Tab event listeners ----
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const urlType = classifyURL(changeInfo.url);
    console.log("[bg] stopme on", changeInfo.url, urlType);
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab.url) {
      const urlType = classifyURL(tab.url);
      console.log("[bg] stopme on", tab.url, urlType);
    }
  });
});
