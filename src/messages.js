// src/messages.js — picks a context-aware message from the templates
// Prefers site-specific messages over generic category fallbacks.

self.STOPME_MESSAGES = {
  pick(memoryContext) {
    const { MESSAGE_TEMPLATES, randomPick } = self.STOPME_CONFIG;
    const { domain, category } = memoryContext;

    // 1. Try site-specific templates FIRST (most relevant)
    const siteTemplates = MESSAGE_TEMPLATES.bySite[domain] || [];
    const siteApplicable = siteTemplates
      .map((fn) => fn(memoryContext))
      .filter((result) => typeof result === "string" && result.length > 0);

    if (siteApplicable.length > 0) {
      return randomPick(siteApplicable);
    }

    // 2. Fall back to category-level templates
    const categoryTemplates = MESSAGE_TEMPLATES.byCategory[category] || [];
    const categoryApplicable = categoryTemplates
      .map((fn) => fn(memoryContext))
      .filter((result) => typeof result === "string" && result.length > 0);

    if (categoryApplicable.length > 0) {
      return randomPick(categoryApplicable);
    }

    // 3. Ultimate fallback if nothing matches at all
    return "HMM.";
  },

  // ---- Debug: show ALL applicable messages for a given context ----
  _showAll(memoryContext) {
    const { MESSAGE_TEMPLATES } = self.STOPME_CONFIG;
    const { domain, category } = memoryContext;

    const siteTemplates = MESSAGE_TEMPLATES.bySite[domain] || [];
    const siteApplicable = siteTemplates
      .map((fn) => fn(memoryContext))
      .filter((r) => typeof r === "string");

    const categoryTemplates = MESSAGE_TEMPLATES.byCategory[category] || [];
    const categoryApplicable = categoryTemplates
      .map((fn) => fn(memoryContext))
      .filter((r) => typeof r === "string");

    console.log(`[applicable for ${domain} / ${category}]`);
    console.log("  Site-specific:", siteApplicable);
    console.log("  Category fallback:", categoryApplicable);
  },

  _test(domain, category) {
    const fakeContext = {
      domain,
      category,
      visits: 1,
      minutesSinceLast: 999,
      lastCategory: null,
      lastDomain: null,
      hour: new Date().getHours(),
    };
    const msg = this.pick(fakeContext);
    console.log(`[msg test] ${domain} (${category}):`, msg);
    return msg;
  },
};
