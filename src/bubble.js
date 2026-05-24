// src/bubble.js — builds the cloud speech bubble with text + paw decorations

window.STOPME_BUBBLE = {
  create(message) {
    const { COLORS } = window.STOPME_CONFIG;

    const bubble = document.createElement("div");
    bubble.id = "stopme-bubble";
    Object.assign(bubble.style, {
      position: "relative",
      width: "300px",
      height: "180px",
      pointerEvents: "auto",
      opacity: "0",
      animation: "stopme-bubble-pop 0.4s ease 0.7s forwards",
      flexShrink: "0",
    });

    bubble.innerHTML = this._svgMarkup(message, COLORS);
    return bubble;
  },

  // SVG markup for cloud + paw decorations + text overlay
  _svgMarkup(message, COLORS) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180"
           style="position:absolute; top:0; left:0; width:100%; height:100%;">
        ${this._cloudPath(COLORS)}
        ${this._pawDecorations(COLORS)}
      </svg>
      ${this._textOverlay(message, COLORS)}
    `;
  },

  _cloudPath(COLORS) {
    return `
      <path d="M 45 95
               C 10 90 10 50 50 45
               C 50 20 95 15 110 35
               C 115 10 165 10 175 35
               C 185 10 235 15 240 45
               C 285 40 290 90 250 100
               C 275 125 230 145 215 120
               C 215 145 165 145 160 125
               C 150 145 105 145 100 125
               C 90 145 55 140 55 115
               C 20 115 15 100 45 95 Z"
            fill="${COLORS.fill}"
            stroke="${COLORS.stroke}"
            stroke-width="2.5"
            stroke-dasharray="7 5"
            stroke-linejoin="round"
            stroke-linecap="round"/>
    `;
  },

  _pawDecorations(COLORS) {
    return `
      <g fill="${COLORS.decor}">
        <g transform="translate(20, 30)">
          <ellipse cx="0" cy="0" rx="4" ry="5"/>
          <ellipse cx="-7" cy="-4" rx="2.2" ry="2.8"/>
          <ellipse cx="7" cy="-4" rx="2.2" ry="2.8"/>
          <ellipse cx="-3" cy="-10" rx="1.8" ry="2.3"/>
          <ellipse cx="3" cy="-10" rx="1.8" ry="2.3"/>
        </g>
        <g transform="translate(275, 150) rotate(20)">
          <ellipse cx="0" cy="0" rx="3.5" ry="4.5"/>
          <ellipse cx="-6" cy="-4" rx="2" ry="2.5"/>
          <ellipse cx="6" cy="-4" rx="2" ry="2.5"/>
          <ellipse cx="-2.5" cy="-9" rx="1.6" ry="2"/>
          <ellipse cx="2.5" cy="-9" rx="1.6" ry="2"/>
        </g>
        <circle cx="280" cy="35"  r="3"/>
        <circle cx="15"  cy="155" r="2.5"/>
        <circle cx="270" cy="75"  r="1.8"/>
        <circle cx="25"  cy="135" r="1.8"/>
      </g>
    `;
  },

  _textOverlay(message, COLORS) {
    return `
      <div style="
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        display: flex; align-items: center; justify-content: center;
        padding: 30px 50px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: ${COLORS.text};
        font-size: 13px;
        text-align: center;
        line-height: 1.7;
        white-space: pre-line;
        pointer-events: none;
      ">${message}</div>
    `;
  },
};
