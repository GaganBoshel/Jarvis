/**
 * JARVIS AI v2 - News Intelligence Feed
 */

import { playAudioFx, showToast } from "./utils.js";
import { marked } from "marked";

export class NewsController {
  constructor(aiCore) {
    this.aiCore = aiCore;
    this.currentCategory = "Tech & AI";
  }

  async loadNews(category, containerEl) {
    if (!containerEl) return;
    this.currentCategory = category || "Tech & AI";

    containerEl.innerHTML = `
      <div class="flex flex-col items-center justify-center p-12 text-cyan-400">
        <div class="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div class="text-sm tracking-widest uppercase">Connecting to Global Satellite News Feeds (${this.currentCategory})...</div>
      </div>
    `;

    try {
      const markdownNews = await this.aiCore.fetchNews(this.currentCategory);
      playAudioFx("beep");
      this.renderNews(markdownNews, containerEl);
    } catch (err) {
      containerEl.innerHTML = `
        <div class="glass-panel p-6 border border-red-500/50 rounded-xl text-red-300 text-center">
          <div class="text-lg font-bold mb-2">Satellite Stream Transmission Error</div>
          <div class="text-sm opacity-80">${err.message}</div>
          <button id="news-retry-btn" class="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500 text-red-200 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all">Reconnect Satellite</button>
        </div>
      `;
      document.getElementById("news-retry-btn")?.addEventListener("click", () => this.loadNews(this.currentCategory, containerEl));
    }
  }

  renderNews(markdownText, containerEl) {
    const htmlContent = marked.parse(markdownText || "");

    containerEl.innerHTML = `
      <div class="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-6">
        <!-- Top Category Selector -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
          <div>
            <span class="text-xs font-mono uppercase tracking-widest text-cyan-400">GLOBAL INTELLIGENCE DIGEST</span>
            <h2 class="text-2xl font-bold text-white tracking-wide">JARVIS News Feed</h2>
          </div>
          <div class="flex flex-wrap gap-2">
            ${["Tech & AI", "Space Exploration", "Quantum & Hardware", "Global Markets", "Cybersecurity"]
              .map(
                (cat) => `
              <button class="news-cat-btn px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                this.currentCategory === cat
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,243,255,0.5)]"
                  : "bg-slate-900/80 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/20"
              }" data-category="${cat}">${cat}</button>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- News Body Output -->
        <div class="prose prose-invert max-w-none text-cyan-100 leading-relaxed text-sm space-y-4">
          ${htmlContent}
        </div>
      </div>
    `;

    containerEl.querySelectorAll(".news-cat-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cat = e.currentTarget.getAttribute("data-category");
        if (cat) this.loadNews(cat, containerEl);
      });
    });
  }
}
