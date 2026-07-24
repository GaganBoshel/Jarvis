/**
 * JARVIS AI v2 - Document & PDF Intelligence Subsystem
 */

import { playAudioFx, showToast } from "./utils.js";
import { marked } from "marked";

export class PDFController {
  constructor(aiCore) {
    this.aiCore = aiCore;
  }

  init(containerEl) {
    if (!containerEl) return;

    containerEl.innerHTML = `
      <div class="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-6">
        <!-- Header -->
        <div class="border-b border-cyan-500/20 pb-4">
          <span class="text-xs font-mono uppercase tracking-widest text-cyan-400">NEURAL DOCUMENT PARSER</span>
          <h2 class="text-2xl font-bold text-white tracking-wide">PDF & Document Intelligence</h2>
        </div>

        <!-- Upload Dropzone -->
        <div id="pdf-dropzone" class="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-8 text-center transition-all cursor-pointer bg-slate-900/40 hover:bg-cyan-950/20 flex flex-col items-center justify-center gap-3">
          <div class="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-400 text-2xl">
            📄
          </div>
          <div>
            <div class="text-sm font-semibold text-white">Click or drag PDF / Text file to analyze</div>
            <div class="text-xs text-cyan-400/70 mt-1">Supports PDF, TXT, MD, JSON files (Up to 25MB)</div>
          </div>
          <input type="file" id="pdf-file-input" accept=".pdf,.txt,.md,.json,.csv" class="hidden" />
        </div>

        <!-- Or Text Area -->
        <div class="space-y-2">
          <label class="text-xs font-mono uppercase tracking-wider text-cyan-300">Or Paste Document Content Directly:</label>
          <textarea id="pdf-text-input" rows="5" placeholder="Paste report, paper, or contract text here..." class="w-full bg-slate-900/80 border border-cyan-500/40 rounded-xl p-4 text-sm text-cyan-100 placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"></textarea>
        </div>

        <div class="flex justify-end">
          <button id="pdf-analyze-btn" class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all transform hover:scale-[1.02]">
            Execute Document Intelligence
          </button>
        </div>

        <!-- Output Summary Card -->
        <div id="pdf-output-container" class="hidden space-y-4 pt-4 border-t border-cyan-500/20">
          <div class="text-xs font-mono uppercase tracking-widest text-cyan-400">JARVIS EXECUTIVE SUMMARY REPORT</div>
          <div id="pdf-output-content" class="prose prose-invert max-w-none text-cyan-100 text-sm p-5 bg-slate-950/80 border border-cyan-500/30 rounded-xl"></div>
        </div>
      </div>
    `;

    const dropzone = document.getElementById("pdf-dropzone");
    const fileInput = document.getElementById("pdf-file-input");
    const textInput = document.getElementById("pdf-text-input");
    const analyzeBtn = document.getElementById("pdf-analyze-btn");
    const outputContainer = document.getElementById("pdf-output-container");
    const outputContent = document.getElementById("pdf-output-content");

    let loadedFileText = "";
    let loadedFileName = "Document";

    dropzone?.addEventListener("click", () => fileInput?.click());

    fileInput?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      loadedFileName = file.name;

      const reader = new FileReader();
      reader.onload = (evt) => {
        loadedFileText = evt.target?.result || "";
        if (textInput) textInput.value = `[Loaded File: ${loadedFileName}]\n\n` + loadedFileText.substring(0, 2000) + "...";
        showToast(`Loaded ${loadedFileName} successfully`, "success");
      };
      reader.readAsText(file);
    });

    analyzeBtn?.addEventListener("click", async () => {
      const textToAnalyze = loadedFileText || textInput?.value.trim();
      if (!textToAnalyze) {
        showToast("Please select a file or paste text content first.", "error");
        return;
      }

      if (outputContainer) outputContainer.classList.remove("hidden");
      if (outputContent) outputContent.innerHTML = `<div class="text-cyan-400 animate-pulse">JARVIS Neural Core is reading and distilling document data...</div>`;
      analyzeBtn.disabled = true;

      try {
        const summaryMarkdown = await this.aiCore.summarizePDF(textToAnalyze, loadedFileName);
        if (outputContent) outputContent.innerHTML = marked.parse(summaryMarkdown || "");
        playAudioFx("success");
      } catch (err) {
        if (outputContent) outputContent.textContent = "PDF Analysis Error: " + err.message;
        showToast(err.message, "error");
      } finally {
        analyzeBtn.disabled = false;
      }
    });
  }
}
