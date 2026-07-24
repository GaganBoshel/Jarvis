/**
 * JARVIS AI v2 - Utilities & Sound Synthesizer
 */

import { CONFIG } from "./config.js";

// Audio Context Singleton for Futuristic Fx
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Web Audio API Sci-Fi Sound Synthesizer
 * Generates Iron Man HUD sound effects without external audio files.
 */
export function playAudioFx(type = "beep") {
  if (!CONFIG.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.value = CONFIG.audioVolume * 0.25;
    masterGain.connect(ctx.destination);

    switch (type) {
      case "activate": {
        // Futuristic two-tone rising chime (JARVIS Startup)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine";
        osc2.type = "triangle";

        osc1.frequency.setValueAtTime(440, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.35);

        osc2.frequency.setValueAtTime(880, now + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.4);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.45);
        osc2.stop(now + 0.45);
        break;
      }

      case "beep": {
        // Quick high-tech HUD blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(987.77, now); // B5 note
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case "click": {
        // Soft metallic tap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      case "scan": {
        // Radar chirp scan wave
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      case "error": {
        // Low sci-fi rejection buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(120, now + 0.1);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      case "success": {
        // Tri-tone confirmation chord
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.2, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.15);
        });
        break;
      }
    }
  } catch (e) {
    console.warn("Audio Fx synthesis failed:", e);
  }
}

/**
 * Ambient Sci-Fi Soundtrack Generator using Web Audio API
 */
let ambientGainNode = null;
let ambientOscillators = [];
let isAmbientPlaying = false;

export function toggleAmbientMusic() {
  if (isAmbientPlaying) {
    stopAmbientMusic();
    return false;
  } else {
    startAmbientMusic();
    return true;
  }
}

export function startAmbientMusic() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (isAmbientPlaying) return;
    isAmbientPlaying = true;

    const now = ctx.currentTime;
    ambientGainNode = ctx.createGain();
    ambientGainNode.gain.setValueAtTime(0.01, now);
    ambientGainNode.gain.exponentialRampToValueAtTime(0.08, now + 2);
    ambientGainNode.connect(ctx.destination);

    // Warm Sci-Fi Pad chord (C minor 9: C3, Eb3, G3, Bb3, D4)
    const freqs = [130.81, 155.56, 196.00, 233.08, 293.66];
    ambientOscillators = freqs.map((freq) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      // Subtle frequency detune modulation
      osc.detune.setValueAtTime((Math.random() - 0.5) * 10, now);

      oscGain.gain.setValueAtTime(0.2, now);
      osc.connect(oscGain);
      oscGain.connect(ambientGainNode);
      osc.start(now);
      return osc;
    });

    showToast("Ambient HUD Soundtrack Activated.", "info");
  } catch (e) {
    console.warn("Ambient music start failed:", e);
  }
}

export function stopAmbientMusic() {
  if (!isAmbientPlaying) return;
  try {
    const ctx = getAudioContext();
    const now = ctx ? ctx.currentTime : 0;
    if (ambientGainNode && ctx) {
      ambientGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    }
    setTimeout(() => {
      ambientOscillators.forEach((osc) => {
        try { osc.stop(); } catch (e) {}
      });
      ambientOscillators = [];
      isAmbientPlaying = false;
    }, 1500);

    showToast("Ambient HUD Soundtrack Deactivated.", "info");
  } catch (e) {
    isAmbientPlaying = false;
  }
}

export function showToast(message, type = "info", duration = 3500) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm pointer-events-auto";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  const borderColor =
    type === "error"
      ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
      : type === "success"
      ? "border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
      : "border-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.4)]";

  toast.className = `glass-panel border-l-4 ${borderColor} p-4 rounded-r-lg text-sm text-cyan-100 backdrop-blur-md flex items-center justify-between gap-3 animate-slide-in transition-all duration-300`;

  const iconMarkup =
    type === "error"
      ? `<svg class="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
      : type === "success"
      ? `<svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
      : `<svg class="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

  toast.innerHTML = `
    <div class="flex items-center gap-3">
      ${iconMarkup}
      <div>
        <div class="text-xs uppercase tracking-widest text-cyan-400 font-bold">JARVIS TELEMETRY</div>
        <div class="mt-0.5">${escapeHtml(message)}</div>
      </div>
    </div>
    <button class="text-gray-400 hover:text-white transition-colors" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  playAudioFx(type === "error" ? "error" : "beep");

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-x-full");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Storage Helpers
 */
export function saveStorage(key, value) {
  try {
    localStorage.setItem(`JARVIS_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error("Storage save failed", e);
  }
}

export function loadStorage(key, fallback = null) {
  try {
    const item = localStorage.getItem(`JARVIS_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

/**
 * Escapes HTML characters for safety
 */
export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Detect Device & System Info for HUD Display
 */
export async function getSystemDiagnostics() {
  const info = {
    browser: getBrowserName(),
    os: getOSName(),
    screenRes: `${window.screen.width} x ${window.screen.height}`,
    cpuCores: navigator.hardwareConcurrency || "N/A",
    memoryGB: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "N/A",
    online: navigator.onLine,
    battery: { level: "N/A", charging: false },
    connectionType: navigator.connection ? navigator.connection.effectiveType : "4G (Estimated)"
  };

  try {
    if ("getBattery" in navigator) {
      const b = await navigator.getBattery();
      info.battery = {
        level: Math.round(b.level * 100) + "%",
        charging: b.charging
      };
    }
  } catch (e) {
    // Battery API restricted or unavailable
  }

  return info;
}

function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Mozilla Firefox";
  if (ua.includes("SamsungBrowser")) return "Samsung Internet";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Trident")) return "Internet Explorer";
  if (ua.includes("Edge") || ua.includes("Edg")) return "Microsoft Edge";
  if (ua.includes("Chrome")) return "Google Chrome";
  if (ua.includes("Safari")) return "Apple Safari";
  return "Quantum Browser";
}

function getOSName() {
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows OS";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux OS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("like Mac")) return "iOS";
  return "Stark OS";
}
