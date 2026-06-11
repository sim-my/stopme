// src/sound.js — a short synthesized "meow" via Web Audio (no asset file needed).
//
// Browser autoplay policy blocks audio until the page has had a user gesture.
// The cat appears automatically, so on a freshly-loaded page there's been no
// gesture yet — we skip silently in that case (trying anyway just logs an
// "AudioContext was not allowed to start" warning). Once the user has
// interacted with the page (scrolled, clicked), the meow plays.

window.STOPME_SOUND = {
  _ctx: null,

  _audioContext() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    // Reuse one context for the page instead of creating a new one each meow.
    if (!this._ctx || this._ctx.state === "closed") {
      this._ctx = new Ctx();
    }
    return this._ctx;
  },

  meow() {
    // Respect the autoplay policy: bail unless the page has had a user gesture.
    const ua = navigator.userActivation;
    if (ua && !ua.hasBeenActive) return;

    try {
      const ctx = this._audioContext();
      if (!ctx) return;
      ctx.resume?.();

      const now = ctx.currentTime;
      const dur = 0.5;

      // Carrier with a meow-shaped pitch sweep (rise then fall: "me-ow").
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(720, now + 0.12);
      osc.frequency.linearRampToValueAtTime(540, now + dur);

      // Vibrato for a more catlike, wavering tone.
      const vib = ctx.createOscillator();
      vib.frequency.value = 18;
      const vibGain = ctx.createGain();
      vibGain.gain.value = 24;
      vib.connect(vibGain).connect(osc.frequency);

      // Bandpass to fake a vocal formant.
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 900;
      bp.Q.value = 5;

      // Amplitude envelope.
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
      gain.gain.setValueAtTime(0.22, now + 0.32);
      gain.gain.linearRampToValueAtTime(0, now + dur);

      osc.connect(bp).connect(gain).connect(ctx.destination);
      osc.start(now);
      vib.start(now);
      osc.stop(now + dur);
      vib.stop(now + dur);
      // Keep the context alive for reuse — don't close it after each meow.
    } catch {
      // Audio unavailable / blocked — fail silently.
    }
  },
};
