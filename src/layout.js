// src/layout.js — positions cat + bubble per side, handles dismiss

window.STOPME_LAYOUT = {
  // Build wrapper element, position based on cat side, append bubble + cat
  assemble(catData, bubbleEl, catEl) {
    const config = window.STOPME_CONFIG.LAYOUT[catData.side];

    const wrapper = document.createElement("div");
    wrapper.id = "stopme-widget";
    Object.assign(wrapper.style, {
      position: "fixed",
      zIndex: "999999",
      pointerEvents: "none",
      display: "flex",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      animation: `${config.animationName} 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
      ...config.wrapperStyle,
    });

    // Apply per-side bubble styles
    Object.assign(bubbleEl.style, config.bubbleStyle);

    // Order: bubble first OR cat first depending on side
    if (config.bubbleFirst) {
      wrapper.appendChild(bubbleEl);
      wrapper.appendChild(catEl);
    } else {
      wrapper.appendChild(catEl);
      wrapper.appendChild(bubbleEl);
    }

    return wrapper;
  },

  // Click cat to slide out + remove
  attachDismiss(wrapper, catEl, catData) {
    const slideOut = window.STOPME_CONFIG.LAYOUT[catData.side].slideOut;
    catEl.addEventListener("click", () => {
      wrapper.style.transition = "transform 0.5s ease, opacity 0.3s ease";
      wrapper.style.transform = slideOut;
      setTimeout(() => wrapper.remove(), 600);
    });
  },
};
