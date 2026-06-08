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

  attachDismiss(wrapper, catEl, catData) {
    const layoutConfig = window.STOPME_CONFIG.LAYOUT[catData.side];
    const bubbleEl = wrapper.querySelector("#stopme-bubble");

    const dismiss = () => {
      // 1. Bubble exit animation
      bubbleEl.style.animation = "stopme-bubble-out 0.35s ease-out forwards";

      // 2. After bubble fades, wrapper exit animation
      setTimeout(() => {
        wrapper.style.animation = `${layoutConfig.slideOutAnimation} 0.6s ease-in forwards`;
      }, 400);

      // 3. Remove from DOM after everything
      setTimeout(() => wrapper.remove(), 1100);
    };

    const autoTimer = setTimeout(dismiss, 5000);

    catEl.addEventListener("click", () => {
      clearTimeout(autoTimer);
      dismiss();
    });
  },
};
