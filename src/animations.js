// src/animations.js — injects CSS keyframes once per page

window.STOPME_ANIMATIONS = {
  injected: false,

  inject() {
    if (this.injected) return;
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      @keyframes stopme-slide-right { from { transform: translateX(110%); } to { transform: translateX(0); } }
      @keyframes stopme-slide-left  { from { transform: translateX(-110%); } to { transform: translateX(0); } }
      @keyframes stopme-slide-up    { from { transform: translateY(110%); } to { transform: translateY(0); } }
      @keyframes stopme-bubble-pop  { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
    `;
    document.head.appendChild(styleEl);
    this.injected = true;
  },
};
