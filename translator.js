/**
 * JARVIS AI v2 - Multi-Language Translator Module
 */

import { playAudioFx, showToast } from "./utils.js";

export class TranslatorController {
  constructor(aiCore, speechEngine) {
    this.aiCore = aiCore;
    this.speechEngine = speechEngine;
  }

  init(containerEl) {
    if (!containerEl) return;

    containerEl.innerHTML = `
      <div class="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-6">
        <!-- Header -->
        <div class="border-b border-cyan-500/20 pb-4">
          <span class="text-xs font-mono uppercase tracking-widest text-cyan-400">POLYGLOT INTELLIGENCE PROTOCOL</span>
          <h2 class="text-2xl font-bold text-white tracking-wide">Universal Neural Translator</h2>
        </div>

        <!-- Language Controls -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Input Box -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-mono uppercase tracking-wider text-cyan-300">Source Text (Auto-Detect)</label>
              <button id="trans-clear-btn" class="text-xs text-gray-400 hover:text-cyan-300 transition-colors">Clear</button>
            </div>
            <textarea id="trans-input" rows="6" placeholder="Enter text to translate or paste document passage..." class="w-full bg-slate-900/80 border border-cyan-500/40 rounded-xl p-4 text-sm text-cyan-100 placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 resize-none"></textarea>
          </div>

          <!-- Output Box -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <label class="text-xs font-mono uppercase tracking-wider text-cyan-300">Target Language:</label>
                <select id="trans-lang-select" class="bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-400">
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Mandarin Chinese">Mandarin Chinese</option>
                  <option value="Russian">Russian</option>
                  <option value="Italian">Italian</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Korean">Korean</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Dutch">Dutch</option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <button id="trans-copy-btn" class="text-xs text-cyan-400 hover:text-white transition-colors" title="Copy Translation">📋 Copy</button>
                <button id="trans-speak-btn" class="text-xs text-cyan-400 hover:text-white transition-colors" title="Audio Synthesis">🔊 Speak</button>
              </div>
            </div>
            <div id="trans-output" class="w-full h-36 bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 text-sm text-cyan-100 overflow-y-auto whitespace-pre-wrap select-text italic">
              Translation telemetry output will appear here...
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex justify-end">
          <button id="trans-exec-btn" class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all transform hover:scale-[1.02]">
            Execute Translation
          </button>
        </div>
      </div>
    `;

    const inputEl = document.getElementById("trans-input");
    const outputEl = document.getElementById("trans-output");
    const selectEl = document.getElementById("trans-lang-select");
    const execBtn = document.getElementById("trans-exec-btn");
    const clearBtn = document.getElementById("trans-clear-btn");
    const copyBtn = document.getElementById("trans-copy-btn");
    const speakBtn = document.getElementById("trans-speak-btn");

    clearBtn?.addEventListener("click", () => {
      if (inputEl) inputEl.value = "";
      if (outputEl) outputEl.textContent = "Translation telemetry output will appear here...";
    });

    execBtn?.addEventListener("click", async () => {
      const text = inputEl?.value.trim();
      const targetLang = selectEl?.value;
      if (!text) {
        showToast("Please enter text to translate.", "error");
        return;
      }

      outputEl.innerHTML = `<div class="text-cyan-400 animate-pulse">Translating data stream into ${targetLang}...</div>`;
      execBtn.disabled = true;

      try {
        const result = await this.aiCore.translateText(text, targetLang);
        outputEl.textContent = result;
        playAudioFx("success");
      } catch (err) {
        outputEl.textContent = "Translation Error: " + err.message;
        showToast(err.message, "error");
      } finally {
        execBtn.disabled = false;
      }
    });

    copyBtn?.addEventListener("click", () => {
      const text = outputEl?.textContent;
      if (text && !text.includes("Translation telemetry")) {
        navigator.clipboard.writeText(text);
        showToast("Translation copied to clipboard!", "success");
      }
    });

    speakBtn?.addEventListener("click", () => {
      const text = outputEl?.textContent;
      if (text && !text.includes("Translation telemetry")) {
        this.speechEngine.speak(text);
      }
    });
  }
}
