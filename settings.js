/**
 * JARVIS AI v2 - Settings & Voice Parameters Configuration Panel
 */

import { CONFIG } from "./config.js";
import { saveStorage, showToast, playAudioFx } from "./utils.js";

export class SettingsPanel {
  constructor(appController) {
    this.appController = appController;
  }

  init(containerEl) {
    if (!containerEl) return;

    containerEl.innerHTML = `
      <div class="glass-panel p-6 rounded-2xl border border-[#00D1FF]/30 space-y-6">
        <!-- Header -->
        <div class="border-b border-[#00D1FF]/20 pb-4 flex items-center justify-between">
          <div>
            <span class="text-xs font-mono uppercase tracking-widest text-[#00D1FF]">CORE SYSTEM PARAMETERS</span>
            <h2 class="text-2xl font-bold text-white tracking-wide">JARVIS v2 Voice & Audio Config</h2>
          </div>
          <div class="flex gap-2">
            <button id="test-voice-btn" class="px-3 py-1.5 rounded-lg border border-[#00D1FF]/40 bg-[#00D1FF]/10 text-xs font-semibold text-[#00D1FF] hover:bg-[#00D1FF]/20 transition-all flex items-center gap-1.5">
              <span>🔊 Test Voice</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Left Column: Holographic Theme & Display -->
          <div class="space-y-6">
            <h3 class="text-sm font-mono uppercase tracking-wider text-[#00D1FF] font-bold border-b border-[#00D1FF]/20 pb-2">
              🎨 Holographic Interface Aesthetics
            </h3>

            <!-- Theme Presets -->
            <div class="space-y-3">
              <label class="text-xs text-gray-300">HUD Visual Preset:</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                ${Object.entries(CONFIG.themes)
                  .map(
                    ([key, theme]) => `
                  <button class="theme-select-btn p-3 rounded-xl border text-xs font-semibold text-left transition-all flex flex-col gap-1 ${
                    this.appController.currentThemeKey === key
                      ? "border-[#00D1FF] bg-[#00D1FF]/20 shadow-[0_0_15px_rgba(0,209,255,0.4)] text-white"
                      : "border-[#00D1FF]/20 bg-slate-900/60 text-cyan-200 hover:border-[#00D1FF]/50"
                  }" data-theme="${key}">
                    <span class="truncate">${theme.name}</span>
                    <div class="flex gap-1 mt-1">
                      <span class="w-3 h-3 rounded-full" style="background:${theme.primary}"></span>
                      <span class="w-3 h-3 rounded-full" style="background:${theme.secondary}"></span>
                      <span class="w-3 h-3 rounded-full" style="background:${theme.accent}"></span>
                    </div>
                  </button>
                `
                  )
                  .join("")}
              </div>
            </div>

            <!-- Custom Color Accent -->
            <div class="space-y-2 pt-2">
              <label class="text-xs text-gray-300">Custom Primary Accent Override:</label>
              <div class="flex items-center gap-3">
                <input type="color" id="custom-color-picker" value="#00D1FF" class="w-10 h-10 rounded-lg border border-[#00D1FF] bg-transparent cursor-pointer" />
                <span id="custom-color-hex" class="text-xs font-mono text-[#00D1FF]">#00D1FF</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Speech Recognition & Synthesis Parameters -->
          <div class="space-y-5">
            <h3 class="text-sm font-mono uppercase tracking-wider text-[#00D1FF] font-bold border-b border-[#00D1FF]/20 pb-2">
              🎙 Voice Recognition & Response Engine
            </h3>

            <!-- Recognition Language Selector -->
            <div class="space-y-1.5">
              <label class="text-xs text-gray-300">Recognition Language:</label>
              <select id="setting-lang-select" class="w-full bg-slate-900/90 border border-[#00D1FF]/40 text-cyan-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#00D1FF]">
                ${CONFIG.languages
                  .map(
                    (l) => `<option value="${l.code}" ${l.code === CONFIG.speech.lang ? "selected" : ""}>${l.label} (${l.code})</option>`
                  )
                  .join("")}
              </select>
            </div>

            <!-- Synthesizer Voice Select -->
            <div class="space-y-1.5">
              <label class="text-xs text-gray-300">Synthesizer Voice Profile:</label>
              <select id="setting-voice-select" class="w-full bg-slate-900/90 border border-[#00D1FF]/40 text-cyan-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#00D1FF]">
                <option value="">Loading browser voices...</option>
              </select>
            </div>

            <!-- Speed (Rate) Slider -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs text-gray-300">
                <span>Speech Speed (Rate):</span>
                <span id="rate-val-display" class="font-mono text-[#00D1FF]">${CONFIG.speech.rate}x</span>
              </div>
              <input type="range" id="setting-rate" min="0.5" max="2.0" step="0.1" value="${CONFIG.speech.rate}" class="w-full accent-[#00D1FF]" />
            </div>

            <!-- Pitch Slider -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs text-gray-300">
                <span>Speech Pitch:</span>
                <span id="pitch-val-display" class="font-mono text-[#00D1FF]">${CONFIG.speech.pitch}</span>
              </div>
              <input type="range" id="setting-pitch" min="0.5" max="1.5" step="0.1" value="${CONFIG.speech.pitch}" class="w-full accent-[#00D1FF]" />
            </div>

            <!-- Volume Slider -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs text-gray-300">
                <span>Speech Volume:</span>
                <span id="volume-val-display" class="font-mono text-[#00D1FF]">${Math.round(CONFIG.speech.volume * 100)}%</span>
              </div>
              <input type="range" id="setting-volume" min="0.0" max="1.0" step="0.05" value="${CONFIG.speech.volume}" class="w-full accent-[#00D1FF]" />
            </div>

            <!-- Toggles Section -->
            <div class="space-y-2.5 pt-2">
              <!-- Wake Word Toggle -->
              <div class="flex items-center justify-between p-2.5 bg-slate-900/60 border border-[#00D1FF]/20 rounded-xl">
                <div>
                  <div class="text-xs font-bold text-white">Wake Word Detection ("Hey Jarvis")</div>
                  <div class="text-[11px] text-gray-400">Listens for trigger phrase and replies "Yes Sir?"</div>
                </div>
                <input type="checkbox" id="setting-wakeword" ${CONFIG.speech.wakeWordEnabled ? "checked" : ""} class="w-5 h-5 accent-[#00D1FF] rounded cursor-pointer" />
              </div>

              <!-- Continuous Listening Toggle -->
              <div class="flex items-center justify-between p-2.5 bg-slate-900/60 border border-[#00D1FF]/20 rounded-xl">
                <div>
                  <div class="text-xs font-bold text-white">Continuous Listening Mode</div>
                  <div class="text-[11px] text-gray-400">Auto restarts microphone after speech ends</div>
                </div>
                <input type="checkbox" id="setting-continuous" ${CONFIG.speech.continuousListening ? "checked" : ""} class="w-5 h-5 accent-[#00D1FF] rounded cursor-pointer" />
              </div>

              <!-- Auto Speak AI Responses Toggle -->
              <div class="flex items-center justify-between p-2.5 bg-slate-900/60 border border-[#00D1FF]/20 rounded-xl">
                <div>
                  <div class="text-xs font-bold text-white">Auto Speak AI Replies</div>
                  <div class="text-[11px] text-gray-400">Reads Gemini & System responses aloud</div>
                </div>
                <input type="checkbox" id="setting-autospeak" ${CONFIG.speech.autoSpeakResponses ? "checked" : ""} class="w-5 h-5 accent-[#00D1FF] rounded cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Controls -->
        <div class="border-t border-[#00D1FF]/20 pt-6 flex flex-wrap items-center justify-between gap-4">
          <div class="flex gap-2">
            <button id="pause-speech-btn" class="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs px-3 py-2 rounded-xl transition-all">
              ⏸ Pause Speech
            </button>
            <button id="resume-speech-btn" class="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 text-xs px-3 py-2 rounded-xl transition-all">
              ▶ Resume Speech
            </button>
            <button id="stop-speech-btn" class="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 text-xs px-3 py-2 rounded-xl transition-all">
              ⏹ Stop Speech
            </button>
          </div>

          <div class="flex items-center gap-3">
            <button id="reset-all-data-btn" class="bg-red-500/20 hover:bg-red-500/40 border border-red-500/60 text-red-200 text-xs font-semibold px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all">
              🗑 Purge Memory
            </button>
            <button id="save-settings-btn" class="bg-[#00D1FF] hover:bg-[#00D1FF]/80 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl uppercase tracking-wider shadow-[0_0_15px_rgba(0,209,255,0.4)] transition-all">
              Save Voice Parameters
            </button>
          </div>
        </div>
      </div>
    `;

    // Populate Voices
    const voiceSelect = document.getElementById("setting-voice-select");
    const voices = this.appController.speechEngine.getVoices();
    if (voiceSelect && voices.length > 0) {
      voiceSelect.innerHTML = voices
        .map(
          (v) => `<option value="${v.name}" ${v.name === this.appController.speechEngine.selectedVoice?.name ? "selected" : ""}>${v.name} (${v.lang})</option>`
        )
        .join("");
    }

    // Theme select listeners
    containerEl.querySelectorAll(".theme-select-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const key = e.currentTarget.getAttribute("data-theme");
        if (key) {
          this.appController.setTheme(key);
          this.init(containerEl);
        }
      });
    });

    // Custom color picker
    const picker = document.getElementById("custom-color-picker");
    const hexSpan = document.getElementById("custom-color-hex");
    picker?.addEventListener("input", (e) => {
      const hex = e.target.value;
      if (hexSpan) hexSpan.textContent = hex;
      document.documentElement.style.setProperty("--color-primary", hex);
    });

    // Language dropdown listener
    document.getElementById("setting-lang-select")?.addEventListener("change", (e) => {
      this.appController.speechEngine.setLanguage(e.target.value);
    });

    // Sliders listeners
    document.getElementById("setting-rate")?.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      document.getElementById("rate-val-display").textContent = val + "x";
      CONFIG.speech.rate = val;
    });

    document.getElementById("setting-pitch")?.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      document.getElementById("pitch-val-display").textContent = val;
      CONFIG.speech.pitch = val;
    });

    document.getElementById("setting-volume")?.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      document.getElementById("volume-val-display").textContent = Math.round(val * 100) + "%";
      CONFIG.speech.volume = val;
    });

    // Voice test button
    document.getElementById("test-voice-btn")?.addEventListener("click", () => {
      this.appController.speechEngine.speak("JARVIS voice synthesizer online. All audio channels operating within optimal thresholds, sir.");
    });

    // Speech quick action buttons
    document.getElementById("pause-speech-btn")?.addEventListener("click", () => {
      this.appController.speechEngine.pauseSpeaking();
    });
    document.getElementById("resume-speech-btn")?.addEventListener("click", () => {
      this.appController.speechEngine.resumeSpeaking();
    });
    document.getElementById("stop-speech-btn")?.addEventListener("click", () => {
      this.appController.speechEngine.stopSpeaking();
    });

    // Save Settings
    document.getElementById("save-settings-btn")?.addEventListener("click", () => {
      const voiceName = voiceSelect?.value;
      if (voiceName) this.appController.speechEngine.setVoice(voiceName);

      const langVal = document.getElementById("setting-lang-select")?.value;
      if (langVal) CONFIG.speech.lang = langVal;

      CONFIG.speech.wakeWordEnabled = !!document.getElementById("setting-wakeword")?.checked;
      CONFIG.speech.continuousListening = !!document.getElementById("setting-continuous")?.checked;
      CONFIG.speech.autoSpeakResponses = !!document.getElementById("setting-autospeak")?.checked;

      if (this.appController.speechEngine.recognition) {
        this.appController.speechEngine.recognition.continuous = CONFIG.speech.continuousListening;
      }

      saveStorage("config", CONFIG);
      playAudioFx("success");
      showToast("Voice parameters successfully saved.", "success");
    });

    // Purge Memory
    document.getElementById("reset-all-data-btn")?.addEventListener("click", () => {
      if (confirm("Are you sure you want to purge all JARVIS local memory and settings?")) {
        localStorage.clear();
        this.appController.aiCore.clearHistory();
        playAudioFx("error");
        showToast("JARVIS memory buffer purged.", "info");
        setTimeout(() => location.reload(), 1000);
      }
    });
  }
}

