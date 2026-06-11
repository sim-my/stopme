// src/memory.js — tracks browsing memory in chrome.storage.local
// Resets at midnight. Used by background.js to build context for the message picker.

(self || window).STOPME_MEMORY = {
  // Storage key for today's memory blob
  STORAGE_KEY: "stopme_memory",

  // ---- Read today's memory from storage ----
  async load() {
    const result = await chrome.storage.local.get(this.STORAGE_KEY);
    const data = result[this.STORAGE_KEY];

    // If no data yet OR it's from a previous day → fresh slate
    if (!data || data.date !== this._today()) {
      return this._fresh();
    }
    return data;
  },

  // ---- Save memory back to storage ----
  async save(memory) {
    await chrome.storage.local.set({ [this.STORAGE_KEY]: memory });
  },

  // ---- Record a visit to a site ----
  // Call this every time a category-able site loads.
  // Returns the context object the message picker uses.
  async recordVisit(domain, category) {
    const memory = await this.load();
    const now = Date.now();

    // Compute minutesSinceLast FIRST (before we overwrite lastVisit)
    const isFirstVisit = !memory.sites[domain];
    const minutesSinceLast = isFirstVisit
      ? 999 // never visited before — sentinel value
      : Math.floor((now - memory.sites[domain].lastVisit) / 60000);

    // Then update the record
    if (isFirstVisit) {
      memory.sites[domain] = { visits: 0, lastVisit: now, timeSpent: 0 };
    }
    memory.sites[domain].visits += 1;
    memory.sites[domain].lastVisit = now;
    memory.sites[domain].category = category;

    // Save the "previous category/domain" before overwriting
    const lastCategory = memory.lastCategory || null;
    const lastDomain = memory.lastDomain || null;
    memory.lastCategory = category;
    memory.lastDomain = domain;

    await this.save(memory);

    // Build the context object the message picker will use
    return {
      domain,
      category,
      visits: memory.sites[domain].visits,
      minutesSinceLast,
      lastCategory,
      lastDomain,
      hour: new Date().getHours(),
    };
  },

  // ---- Add active time spent on a site (ms) ----
  // Called by the background time tracker when you leave/switch a tracked tab.
  async addTime(domain, category, ms) {
    if (!ms || ms <= 0) return;
    const memory = await this.load();
    if (!memory.sites[domain]) {
      memory.sites[domain] = { visits: 0, lastVisit: Date.now(), timeSpent: 0 };
    }
    memory.sites[domain].timeSpent = (memory.sites[domain].timeSpent || 0) + ms;
    memory.sites[domain].category = category;
    await this.save(memory);
  },

  // ---- Aggregate stats for the options page ----
  // Groups every recorded site under its CURRENT category from settings.
  async getStats(settings) {
    const memory = await this.load();
    const out = {
      date: memory.date,
      distracting: { visits: 0, timeMs: 0, sites: [] },
      productive: { visits: 0, timeMs: 0, sites: [] },
    };
    for (const [domain, rec] of Object.entries(memory.sites)) {
      const category = self.STOPME_SETTINGS.classify(
        "https://" + domain,
        settings,
      );
      if (category !== "distracting" && category !== "productive") continue;
      const visits = rec.visits || 0;
      const timeMs = rec.timeSpent || 0;
      out[category].visits += visits;
      out[category].timeMs += timeMs;
      out[category].sites.push({ domain, visits, timeMs });
    }
    out.distracting.sites.sort((a, b) => b.timeMs - a.timeMs);
    out.productive.sites.sort((a, b) => b.timeMs - a.timeMs);
    return out;
  },

  // ---- Wipe all recorded visits + time ----
  async resetAll() {
    await this.save(this._fresh());
  },

  // ---- Helpers ----
  _today() {
    // YYYY-MM-DD string for the "did we reset yet" check
    return new Date().toISOString().split("T")[0];
  },

  _fresh() {
    // Empty memory for a new day
    return {
      date: this._today(),
      sites: {}, // { "instagram.com": { visits: 3, lastVisit: timestamp } }
      lastCategory: null,
      lastDomain: null,
    };
  },

  // ---- Debug helper (call from console to inspect memory) ----
  async _debug() {
    const memory = await this.load();
    console.log("[stopme memory]", memory);
    return memory;
  },

  // ---- Manual reset (call from console if needed) ----
  async _reset() {
    await chrome.storage.local.remove(this.STORAGE_KEY);
    console.log("[stopme memory] reset");
  },
};
