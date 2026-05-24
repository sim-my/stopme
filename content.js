// content.js — the orchestrator. Pulls from all modules and assembles the widget.

(function () {
  if (document.getElementById("stopme-widget")) return;

  const { CATS, MESSAGES, randomPick } = window.STOPME_CONFIG;

  // Inject keyframes once
  window.STOPME_ANIMATIONS.inject();

  // Pick a random cat + message
  const catData = randomPick(CATS);
  const message = randomPick(MESSAGES);

  // Build pieces
  const bubble = window.STOPME_BUBBLE.create(message);
  const cat = window.STOPME_CAT.create(catData);

  // Assemble + position + add dismiss handler
  const wrapper = window.STOPME_LAYOUT.assemble(catData, bubble, cat);
  window.STOPME_LAYOUT.attachDismiss(wrapper, cat, catData);

  // Mount
  document.body.appendChild(wrapper);
})();
