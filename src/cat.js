// src/cat.js — builds the cat image element

window.STOPME_CAT = {
  create(catData) {
    const catEl = document.createElement("img");
    catEl.src = chrome.runtime.getURL(catData.file);
    Object.assign(catEl.style, {
      width: "200px",
      height: "auto",
      pointerEvents: "auto",
      cursor: "pointer",
      filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))",
      flexShrink: "0",
    });
    return catEl;
  },
};
