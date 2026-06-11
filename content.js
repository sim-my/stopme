// content.js — listens for show messages from background and renders the widget

(function () {
  // Inject animation keyframes once per page
  self.STOPME_ANIMATIONS.inject();

  // ---- Render the widget given cat + message data ----
  function showWidget({ cat: catData, message, meow }) {
    // Remove existing widget if any (in case of fast navigation)
    const existing = document.getElementById("stopme-widget");
    if (existing) existing.remove();

    if (meow) self.STOPME_SOUND.meow();

    const bubble = self.STOPME_BUBBLE.create(message);
    const catEl = self.STOPME_CAT.create(catData);
    const wrapper = self.STOPME_LAYOUT.assemble(catData, bubble, catEl);
    self.STOPME_LAYOUT.attachDismiss(wrapper, catEl, catData);
    document.body.appendChild(wrapper);
  }

  // ---- Listen for show messages from background ----
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "STOPME_SHOW") {
      showWidget(msg.payload);
    }
  });
})();
