// src/config.js — all the tweakable data lives here

self.STOPME_CONFIG = {
  // ---- Cat-matched palette ----
  COLORS: {
    fill: "#FAF0E0",
    stroke: "#D4956A",
    text: "#6B4424",
    decor: "#E8B79A",
  },

  // ---- All cats with their peek direction + mood ----
  CATS: [
    { file: "cats/curious_right.png", side: "right", mood: "curious" },
    { file: "cats/judgy_right.png", side: "right", mood: "judgy" },
    { file: "cats/smug_right.png", side: "right", mood: "smug" },
    { file: "cats/curious_left.png", side: "left", mood: "curious" },
    { file: "cats/judgy_left.png", side: "left", mood: "judgy" },
    { file: "cats/wtf_bottom.png", side: "bottom", mood: "wtf" },
  ],

  // ---- Category → cat mood mapping ----
  CATEGORY_TO_MOOD: {
    distracting: "judgy",
    productive: "smug",
    unknown: "curious",
  },

  // ---- Message templates ----
  // Each message is a function: takes memory context (m), returns a string OR false.
  // The picker filters out false and picks from what's left.
  //
  // m contains: { domain, category, visits, minutesSinceLast, lastCategory, lastDomain, hour }
  MESSAGE_TEMPLATES: {
    // ===== SITE-SPECIFIC (keyed by domain) =====
    bySite: {
      "instagram.com": [
        (m) => m.visits === 1 && "INSTAGRAM,\nALREADY?",
        (m) => m.visits === 2 && "BACK ON\nINSTAGRAM.",
        (m) => m.visits >= 3 && `${m.visits} INSTA VISITS.\nWILD.`,
        (m) => m.minutesSinceLast < 5 && "WE LITERALLY\nJUST LEFT.",
        (m) => m.lastCategory === "productive" && "GITHUB TO INSTA.\nCLASSIC.",
        (m) => m.hour >= 23 && "11PM INSTAGRAM.\nOK NIGHT OWL.",
      ],

      "twitter.com": [
        (m) => m.visits === 1 && "TWITTER.\nTHE DISCOURSE AWAITS.",
        (m) => m.visits >= 2 && "MORE TWITTER.\nOK.",
        (m) => m.hour >= 1 && m.hour < 5 && "TWITTER AT 2AM.\nDON'T.",
      ],
      "x.com": [
        (m) => m.visits === 1 && "X. STILL\nCALLING IT TWITTER.",
        (m) => m.visits >= 2 && "MORE X.\nGOT IT.",
      ],

      "reddit.com": [
        (m) => m.visits === 1 && "REDDIT.\nFOR HOW LONG.",
        (m) => m.visits >= 2 && "REDDIT HOLE\nROUND TWO.",
        (m) =>
          m.hour >= 23 || m.hour < 5 ? "REDDIT AT 1AM.\nDOWN BAD." : false,
      ],

      "tiktok.com": [
        (m) => m.visits === 1 && "TIKTOK?\nFOR RESEARCH?",
        (m) => m.visits >= 2 && "TIKTOK SCROLL\nROUND TWO.",
      ],

      "facebook.com": [
        (m) => m.visits === 1 && "FACEBOOK?\nIN 2026?",
        (m) => m.visits >= 2 && "MORE FACEBOOK?\nWHO ARE YOU.",
      ],

      "linkedin.com": [
        (m) => m.visits === 1 && "LINKEDIN.\nJOB HUNT MODE.",
        (m) => m.visits >= 3 && "LINKEDIN AGAIN.\nNETWORKING I GUESS.",
        (m) =>
          m.lastCategory === "distracting" && "INSTA TO LINKEDIN.\nMOOD SHIFT.",
      ],

      "github.com": [
        (m) => m.visits === 1 && "GITHUB.\nLET'S COOK.",
        (m) => m.visits >= 3 && `${m.visits} GITHUB VISITS.\nLOCKED IN.`,
        (m) => m.lastCategory === "distracting" && "OH NOW\nWE'RE PRODUCTIVE?",
        (m) => m.hour >= 22 && "LATE NIGHT\nGRIND. RESPECT.",
      ],

      "stackoverflow.com": [
        (m) => m.visits === 1 && "STACK OVERFLOW.\nWE'RE STUCK.",
        (m) => m.visits >= 5 && `${m.visits} SO VISITS.\nGOOGLE HARDER.`,
      ],

      "leetcode.com": [
        (m) => m.visits === 1 && "LEETCODE.\nJOB SEARCH ARC.",
        (m) => m.visits >= 3 && "LEETCODE GRIND.\nACTIVATED.",
      ],

      "developer.mozilla.org": [
        (m) => m.visits === 1 && "MDN.\nDOING IT RIGHT.",
        () => "MDN AGAIN.\nNICE.",
      ],

      "chatgpt.com": [
        (m) => m.visits === 1 && "CHATGPT?\nAGAIN.",
        (m) =>
          m.visits >= 5 && `${m.visits} CHATGPT VISITS.\nWE BUILT WITH IT.`,
      ],
      "claude.ai": [
        (m) => m.visits === 1 && "CLAUDE.\nGOOD CHOICE.",
        () => "MORE CLAUDE.\nWORKING IT OUT.",
      ],

      "youtube.com": [
        (m) => m.visits === 1 && "TUTORIAL\nOR BRAIN ROT?",
        (m) => m.visits >= 3 && "A LOT OF\nYOUTUBE TODAY.",
        (m) => m.minutesSinceLast < 5 && "ALREADY?\nWE JUST LEFT.",
      ],

      "netflix.com": [
        (m) => m.hour < 22 && "NETFLIX\nBEFORE 10PM?",
        () => "NETFLIX.\nFOR HOW LONG.",
      ],
    },

    // ===== CATEGORY-LEVEL FALLBACK =====
    // Used when no site-specific template matches, or as additional variety
    byCategory: {
      distracting: [
        (m) => m.visits >= 4 && `${m.visits}TH SCROLL\nOF THE DAY.`,
        (m) => m.minutesSinceLast < 2 && "TWO MINUTES.\nIMPRESSIVE.",
        (m) => m.lastCategory === "productive" && "FROM PRODUCTIVE\nTO THIS.",
        (m) => m.hour >= 1 && m.hour < 5 && "IT IS 2AM.\nGO TO BED.",
        () => "AGAIN?\nREALLY?",
        () => "INTERESTING\nCHOICE.",
        () => "I'M\nWATCHING.",
      ],

      productive: [
        (m) => m.visits === 1 && "OK,\nWE'RE COOKING.",
        (m) => m.lastCategory === "distracting" && "REDEMPTION\nARC. NICE.",
        (m) => m.hour >= 22 && "LATE NIGHT\nLOCK-IN.",
        (m) => m.hour < 8 && "EARLY START.\nRESPECT.",
        () => "PROUD.\nKIND OF.",
        () => "YES, OK.\nKEEP GOING.",
        () => "FINE,\nYOU'VE GOT THIS.",
      ],

      unknown: [
        () => "INTERESTING\nCHOICE.",
        () => "HMM.",
        () => "OK.",
        () => "I'M\nHERE.",
      ],
    },
  },

  // ---- Layout config per peek direction ----
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
      slideOutAnimation: "stopme-slide-out-right",
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
      slideOutAnimation: "stopme-slide-out-left",
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
      slideOutAnimation: "stopme-slide-out-down",
      bubbleFirst: true,
    },
  },
  MESSAGES: ["LOADING...", "ONE SEC.", "WIRING UP..."],
};

// Helper
self.STOPME_CONFIG.randomPick = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];
