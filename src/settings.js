// src/settings.js — user settings (editable site lists, meow toggle, pause).
// Stored in chrome.storage.local. Works in both the service worker (self) and
// the options page (window).

(self || window).STOPME_SETTINGS = {
  KEY: "stopme_settings",

  // Defaults used the first time, before the user customizes anything.
  DEFAULTS: {
    sites: {
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
        "overleaf.com",
      ],
    },
    meowEnabled: true,
    pausedUntil: 0, // epoch ms; 0 = not paused
    darkMode: false,
  },

  // ---- Read settings, merged over defaults ----
  async load() {
    const result = await chrome.storage.local.get(this.KEY);
    const s = result[this.KEY] || {};
    return {
      sites: {
        distracting:
          s.sites?.distracting ?? [...this.DEFAULTS.sites.distracting],
        productive: s.sites?.productive ?? [...this.DEFAULTS.sites.productive],
      },
      meowEnabled: s.meowEnabled ?? this.DEFAULTS.meowEnabled,
      pausedUntil: s.pausedUntil ?? this.DEFAULTS.pausedUntil,
      darkMode: s.darkMode ?? this.DEFAULTS.darkMode,
    };
  },

  async save(settings) {
    await chrome.storage.local.set({ [this.KEY]: settings });
  },

  // Shallow-merge a patch into current settings, persist, return the result.
  async update(patch) {
    const next = { ...(await this.load()), ...patch };
    await this.save(next);
    return next;
  },

  // ---- Normalize user input into a bare domain ("https://www.x.com/feed" → "x.com") ----
  normalizeDomain(input) {
    return String(input)
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .split("?")[0];
  },

  // ---- Classify a URL against the user's lists ----
  // Matches the exact domain or any subdomain of it.
  classify(url, settings) {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, "");
      const inList = (list) =>
        list.some((d) => domain === d || domain.endsWith("." + d));
      if (inList(settings.sites.distracting)) return "distracting";
      if (inList(settings.sites.productive)) return "productive";
      return "unknown";
    } catch {
      return "unknown";
    }
  },

  isPaused(settings) {
    return Date.now() < (settings.pausedUntil || 0);
  },

  // ---- Add/remove a site to/from a category list ----
  async addSite(category, rawDomain) {
    const domain = this.normalizeDomain(rawDomain);
    if (!domain) return this.load();
    const settings = await this.load();
    // Remove from both lists first so a site lives in exactly one category.
    for (const cat of ["distracting", "productive"]) {
      settings.sites[cat] = settings.sites[cat].filter((d) => d !== domain);
    }
    settings.sites[category] = [...settings.sites[category], domain];
    await this.save(settings);
    return settings;
  },

  async removeSite(category, domain) {
    const settings = await this.load();
    settings.sites[category] = settings.sites[category].filter(
      (d) => d !== domain,
    );
    await this.save(settings);
    return settings;
  },
};
