window.STOPME_CONFIG = {
  // Cat-matched palette (warm cream tones)
  COLORS: {
    fill: "#FAF0E0", // cream — matches cat fur
    stroke: "#D4956A", // warm peach — cat's warmer tones
    text: "#6B4424", // deep warm brown — cat's accents
    decor: "#E8B79A", // soft peach — paw prints
  },

  // Cat assets — each PNG with its peek direction
  CATS: [
    { file: "cats/curious_right.png", side: "right" },
    { file: "cats/judgy_right.png", side: "right" },
    { file: "cats/smug_right.png", side: "right" },
    { file: "cats/curious_left.png", side: "left" },
    { file: "cats/judgy_left.png", side: "left" },
    { file: "cats/wtf_bottom.png", side: "bottom" },
  ],

  // Default sample messages (Phase 4 will pick per category)
  MESSAGES: [
    "HUH,\nALREADY?",
    "WEREN'T YOU\nWORKING?",
    "INTERESTING\nCHOICE.",
    "AGAIN?\nREALLY?",
    "I'M\nWATCHING.",
  ],

  // Layout values per peek direction
  LAYOUT: {
    right: {
      wrapperStyle: {
        right: "-30px",
        bottom: "40px",
        flexDirection: "row",
        alignItems: "flex-start",
      },
      bubbleStyle: { marginTop: "10px", marginRight: "-30px" },
      animationName: "stopme-slide-right",
      slideOut: "translateX(120%)",
      bubbleFirst: true,
    },
    left: {
      wrapperStyle: {
        left: "-30px",
        bottom: "40px",
        flexDirection: "row",
        alignItems: "flex-start",
      },
      bubbleStyle: { marginTop: "10px", marginLeft: "-30px" },
      animationName: "stopme-slide-left",
      slideOut: "translateX(-120%)",
      bubbleFirst: false,
    },
    bottom: {
      wrapperStyle: {
        bottom: "-30px",
        right: "20px",
        flexDirection: "column",
        alignItems: "center",
      },
      bubbleStyle: { marginBottom: "-200px" },
      animationName: "stopme-slide-up",
      slideOut: "translateY(120%)",
      bubbleFirst: true,
    },
  },
};

// Helper to pick a random element from an array
window.STOPME_CONFIG.randomPick = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];
