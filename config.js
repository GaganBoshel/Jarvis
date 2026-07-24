/**
 * JARVIS AI v2 - Configuration Module
 */

export const CONFIG = {
  appName: "J.A.R.V.I.S.",
  version: "2.0.4",
  creator: "Stark Industries / AI Studio",
  wakeWord: "hey jarvis",
  modelName: "gemini-3.6-flash",
  
  // Audio Synthesizer Settings
  soundEnabled: true,
  audioVolume: 0.8,
  ambientMusicPlaying: false,
  
  // Theme Defaults
  themes: {
    neonCyan: {
      name: "Sleek Cyan HUD (Default)",
      primary: "#00D1FF",
      secondary: "#0077ff",
      accent: "#7000ff",
      bgDark: "#020617",
      cardBg: "rgba(2, 6, 23, 0.75)",
      borderGlow: "rgba(0, 209, 255, 0.35)",
      textPrimary: "#e0f7fc"
    },
    cyberpunk: {
      name: "Cyberpunk Gold/Yellow",
      primary: "#ffe600",
      secondary: "#ff0055",
      accent: "#00ffcc",
      bgDark: "#0a0710",
      cardBg: "rgba(24, 12, 32, 0.7)",
      borderGlow: "rgba(255, 230, 0, 0.5)",
      textPrimary: "#fffde6"
    },
    emerald: {
      name: "Emerald Matrix",
      primary: "#00ff88",
      secondary: "#00b359",
      accent: "#00f3ff",
      bgDark: "#020f0a",
      cardBg: "rgba(4, 28, 18, 0.7)",
      borderGlow: "rgba(0, 255, 136, 0.4)",
      textPrimary: "#e6fff2"
    },
    purple: {
      name: "Amethyst Void",
      primary: "#b537f2",
      secondary: "#6813d4",
      accent: "#00f3ff",
      bgDark: "#0c0517",
      cardBg: "rgba(22, 10, 40, 0.7)",
      borderGlow: "rgba(181, 55, 242, 0.4)",
      textPrimary: "#f5e6ff"
    },
    crimson: {
      name: "Mark L Crimson",
      primary: "#ff2a4b",
      secondary: "#b3001e",
      accent: "#ffcc00",
      bgDark: "#120305",
      cardBg: "rgba(35, 8, 12, 0.7)",
      borderGlow: "rgba(255, 42, 75, 0.5)",
      textPrimary: "#ffe6ea"
    },
    lightMode: {
      name: "Stark Light HUD",
      primary: "#0066cc",
      secondary: "#0099ff",
      accent: "#6600cc",
      bgDark: "#f0f4f8",
      cardBg: "rgba(255, 255, 255, 0.85)",
      borderGlow: "rgba(0, 102, 204, 0.3)",
      textPrimary: "#0f172a"
    }
  },

  // Default Voice Configuration
  speech: {
    lang: "en-US",
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    autoSpeakResponses: true,
    continuousListening: true,
    wakeWordEnabled: true
  },

  // Supported Recognition Languages
  languages: [
    { code: "en-US", label: "English (US)" },
    { code: "en-GB", label: "English (UK)" },
    { code: "es-ES", label: "Spanish (España)" },
    { code: "fr-FR", label: "French (Français)" },
    { code: "de-DE", label: "German (Deutsch)" },
    { code: "hi-IN", label: "Hindi (हिन्दी)" },
    { code: "ja-JP", label: "Japanese (日本語)" },
    { code: "zh-CN", label: "Chinese (Mandarin)" }
  ]
};

