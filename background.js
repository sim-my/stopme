const DISTRACTING_SITES = [
  "www.instagram.com",
  "www.facebook.com",
  "www.twitter.com",
  "www.x.com",
  "www.reddit.com",
  "www.tiktok.com",
];

const PRODUCTIVE_SITES = [
  "www.github.com",
  "www.stackoverflow.com",
  "www.developer.mozilla.org",
  "www.dev.to",
  "www.freecodecamp.org",
  "www.leetcode.com",
];
const YOUTUBE = ["www.youtube.com"];
const URL_TYPE = {
  distracting: "distracting",
  productive: "productive",
  youtube: "youtube",
  unknown: "unknown",
};

const classifyURL = (url) => {
  const domain = new URL(url).hostname;
  if (DISTRACTING_SITES.includes(domain)) return URL_TYPE.distracting;
  if (PRODUCTIVE_SITES.includes(domain)) return URL_TYPE.productive;
  if (YOUTUBE.includes(domain)) return URL_TYPE.youtube;

  return URL_TYPE.unknown;
};

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