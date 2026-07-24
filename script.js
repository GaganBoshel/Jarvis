/**
 * JARVIS AI v2 - Central Application Coordinator
 */

import { CONFIG } from "./config.js";
import { playAudioFx, showToast, escapeHtml, getSystemDiagnostics, saveStorage, loadStorage, toggleAmbientMusic } from "./utils.js";
import { ParticleSystem } from "./particles.js";
import { AICore } from "./ai.js";
import { SpeechEngine } from "./speech.js";
import { parseAndExecuteCommand } from "./commands.js";
import { ToolsManager } from "./tools.js";
import { WebcamEngine } from "./webcam.js";
import { WeatherController } from "./weather.js";
import { NewsController } from "./news.js";
import { TranslatorController } from "./translator.js";
import { PDFController } from "./pdf.js";
import { SettingsPanel } from "./settings.js";
import { marked } from "marked";

class JarvisApp {
  constructor() {
    this.currentThemeKey = "neonCyan";
    this.activeTab = "dashboard";

    // Modules
    this.particles = new ParticleSystem("particle-canvas");
    this.aiCore = new AICore();
    this.speechEngine = new SpeechEngine();
    this.toolsManager = new ToolsManager();
    this.webcamEngine = null;
    this.weatherCtrl = new WeatherController(this.aiCore);
    this.newsCtrl = new NewsController(this.aiCore);
    this.translatorCtrl = new TranslatorController(this.aiCore, this.speechEngine);
    this.pdfCtrl = new PDFController(this.aiCore);
    this.settingsPanel = new SettingsPanel(this);

    this.init();
  }

  async init() {
    const savedConfig = loadStorage("config", null);
    if (savedConfig && savedConfig.speech) {
      Object.assign(CONFIG.speech, savedConfig.speech);
    }

    this.setupUIEvents();
    this.setupMobileDrawerEvents();
    this.setupKeyboardShortcuts();
    this.setupSpeechEvents();
    this.setupAICoreEvents();

    // Render Chat History
    this.renderChatHistory();

    // Start FPS counter, live clock & system diagnostics loop
    this.startDiagnosticsLoop();
    this.startClockLoop();

    // Hide startup loading overlay after 1.5s
    setTimeout(() => {
      const loader = document.getElementById("startup-loader");
      if (loader) {
        loader.classList.add("opacity-0", "pointer-events-none");
        setTimeout(() => loader.remove(), 500);
      }
      playAudioFx("activate");
      showToast("JARVIS v2 Systems Online. At your service, sir.", "success");
    }, 1500);
  }

  setTheme(themeKey) {
    const theme = CONFIG.themes[themeKey] || CONFIG.themes.neonCyan;
    this.currentThemeKey = themeKey;

    document.documentElement.style.setProperty("--color-primary", theme.primary);
    document.documentElement.style.setProperty("--color-secondary", theme.secondary);
    document.documentElement.style.setProperty("--color-accent", theme.accent);
    document.documentElement.style.setProperty("--bg-dark", theme.bgDark);
    document.documentElement.style.setProperty("--card-bg", theme.cardBg);
    document.documentElement.style.setProperty("--border-glow", theme.borderGlow);
    document.documentElement.style.setProperty("--text-primary", theme.textPrimary);

    this.particles.setThemeColors(theme.primary, theme.secondary);
    showToast(`Theme updated: ${theme.name}`, "info");
  }

  setupUIEvents() {
    // Navigation Tab Switches
    document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tab = e.currentTarget.getAttribute("data-tab");
        if (tab) this.switchTab(tab);
      });
    });

    // Chat Send Form
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");

    chatForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = chatInput?.value.trim();
      if (message) {
        chatInput.value = "";
        this.handleUserMessage(message);
      }
    });

    // Mic Toggle Buttons (Header + Floating Mobile)
    const toggleMic = () => this.speechEngine.toggleListening();
    document.getElementById("mic-toggle-btn")?.addEventListener("click", toggleMic);
    document.getElementById("floating-mic-btn")?.addEventListener("click", toggleMic);

    // Auto-scroll chat container when virtual keyboard opens on mobile
    chatInput?.addEventListener("focus", () => {
      setTimeout(() => {
        const container = document.getElementById("chat-messages-container");
        if (container) container.scrollTop = container.scrollHeight;
      }, 300);
    });

    // Ambient Soundtrack Button
    document.getElementById("ambient-music-btn")?.addEventListener("click", (e) => {
      const active = toggleAmbientMusic();
      const btn = e.currentTarget;
      if (active) {
        btn.classList.add("bg-[#00D1FF]/30", "border-[#00D1FF]");
      } else {
        btn.classList.remove("bg-[#00D1FF]/30", "border-[#00D1FF]");
      }
    });

    // Clear Chat Button
    document.getElementById("clear-chat-btn")?.addEventListener("click", () => {
      if (confirm("Clear current conversation memory?")) {
        this.clearChat();
      }
    });

    // Export Chat Button
    document.getElementById("export-chat-btn")?.addEventListener("click", () => {
      const history = this.aiCore.getHistory();
      if (history.length === 0) {
        showToast("No chat history to export.", "error");
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `JARVIS_Chat_Export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Chat history exported as JSON file.", "success");
    });
  }

  setupMobileDrawerEvents() {
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const closeDrawerBtn = document.getElementById("close-drawer-btn");
    const drawer = document.getElementById("sidebar-drawer");
    const backdrop = document.getElementById("mobile-drawer-backdrop");

    const openDrawer = () => {
      if (drawer) {
        drawer.classList.remove("-translate-x-full");
        drawer.classList.add("translate-x-0");
      }
      if (backdrop) backdrop.classList.remove("hidden");
      if (hamburgerBtn) hamburgerBtn.setAttribute("aria-expanded", "true");
    };

    const closeDrawer = () => {
      if (drawer) {
        drawer.classList.add("-translate-x-full");
        drawer.classList.remove("translate-x-0");
      }
      if (backdrop) backdrop.classList.add("hidden");
      if (hamburgerBtn) hamburgerBtn.setAttribute("aria-expanded", "false");
    };

    hamburgerBtn?.addEventListener("click", openDrawer);
    closeDrawerBtn?.addEventListener("click", closeDrawer);
    backdrop?.addEventListener("click", closeDrawer);

    // Close mobile drawer when clicking any nav tab button on mobile
    document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (window.innerWidth < 768) closeDrawer();
      });
    });

    // Touch Swipe Gesture Detection to open/close drawer on touch devices
    let touchStartX = 0;
    let touchEndX = 0;

    window.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    window.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;

      // Swipe right from screen edge to open
      if (touchStartX < 35 && swipeDistance > 70) {
        openDrawer();
      }
      // Swipe left on open drawer to close
      if (swipeDistance < -70 && backdrop && !backdrop.classList.contains("hidden")) {
        closeDrawer();
      }
    }, { passive: true });
  }

  setupKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
      // Esc key closes mobile drawer
      if (e.key === "Escape") {
        const backdrop = document.getElementById("mobile-drawer-backdrop");
        const drawer = document.getElementById("sidebar-drawer");
        if (backdrop && !backdrop.classList.contains("hidden")) {
          drawer?.classList.add("-translate-x-full");
          backdrop.classList.add("hidden");
        }
      }

      // Alt + V -> Toggle Microphone
      if (e.altKey && (e.key === "v" || e.key === "V")) {
        e.preventDefault();
        this.speechEngine.toggleListening();
      }

      // Alt + M -> Toggle Ambient Music
      if (e.altKey && (e.key === "m" || e.key === "M")) {
        e.preventDefault();
        document.getElementById("ambient-music-btn")?.click();
      }
    });
  }

  announceToScreenReader(text) {
    const announcer = document.getElementById("sr-announcer");
    if (announcer) {
      announcer.textContent = text;
    }
  }

  setupSpeechEvents() {
    const micBtn = document.getElementById("mic-toggle-btn");
    const floatingMicBtn = document.getElementById("floating-mic-btn");
    const equalizer = document.getElementById("hud-equalizer");
    const speechStateText = document.getElementById("hud-speech-state-text");
    const liveBanner = document.getElementById("live-speech-banner");
    const liveText = document.getElementById("live-speech-text");

    this.speechEngine.onSpeechStartCallback = () => {
      this.updateArcReactorState("listening");
      if (micBtn) micBtn.classList.add("mic-pulse-active");
      if (floatingMicBtn) floatingMicBtn.classList.add("mic-pulse-active");
      if (equalizer) equalizer.classList.add("active");
      if (speechStateText) speechStateText.textContent = "LISTENING... SPEAK NOW";
      if (liveBanner) liveBanner.classList.remove("hidden");
      if (liveBanner) liveBanner.classList.add("flex");
      this.announceToScreenReader("JARVIS microphone active and listening.");
    };

    this.speechEngine.onSpeechEndCallback = () => {
      if (this.aiCore.status === "READY") {
        this.updateArcReactorState("ready");
      }
      if (micBtn) micBtn.classList.remove("mic-pulse-active");
      if (floatingMicBtn) floatingMicBtn.classList.remove("mic-pulse-active");
      if (equalizer && !this.speechEngine.isSpeaking) equalizer.classList.remove("active");
      if (speechStateText && !this.speechEngine.isSpeaking) {
        speechStateText.textContent = 'READY • SAY "HEY JARVIS"';
      }
      if (liveBanner) {
        liveBanner.classList.add("hidden");
        liveBanner.classList.remove("flex");
      }
      this.announceToScreenReader("JARVIS microphone offline.");
    };

    this.speechEngine.onTranscriptCallback = (transcript, isFinal) => {
      if (liveText) liveText.textContent = `Recognized: "${transcript}"`;
      const input = document.getElementById("chat-input");
      if (input) input.value = transcript;

      if (isFinal) {
        this.handleUserMessage(transcript);
      }
    };

    this.speechEngine.onWakeWordCallback = () => {
      playAudioFx("activate");
      this.updateArcReactorState("listening");
      if (speechStateText) speechStateText.textContent = "WAKE WORD: 'HEY JARVIS'";

      // Display "Yes Sir?" on screen and speak "Yes Sir?"
      this.appendMessageToUI("model", "Yes Sir? How may I assist you?");
      this.speechEngine.speak("Yes Sir? How may I assist you?", () => {
        this.updateArcReactorState("listening");
      });
    };

    this.speechEngine.onSpeakingStateChangeCallback = (isSpeaking) => {
      if (isSpeaking) {
        this.updateArcReactorState("speaking");
        if (equalizer) equalizer.classList.add("active");
        if (speechStateText) speechStateText.textContent = "SPEAKING RESPONSE...";
      } else {
        if (this.aiCore.status === "READY") {
          this.updateArcReactorState("ready");
        }
        if (equalizer && !this.speechEngine.isListening) equalizer.classList.remove("active");
        if (speechStateText && !this.speechEngine.isListening) {
          speechStateText.textContent = 'READY • SAY "HEY JARVIS"';
        }
      }
    };
  }

  setupAICoreEvents() {
    this.aiCore.onStatusChange((status) => {
      this.updateArcReactorState(status.toLowerCase());
    });
  }

  updateArcReactorState(state) {
    const core = document.getElementById("arc-core");
    const statusText = document.getElementById("hud-core-status-text");

    if (!core) return;

    core.classList.remove("listening", "thinking", "speaking");

    if (state === "thinking") {
      core.classList.add("thinking");
      if (statusText) statusText.textContent = "ANALYZING TELEMETRY...";
    } else if (state === "speaking") {
      core.classList.add("speaking");
      if (statusText) statusText.textContent = "AUDIO OUTPUT ACTIVE";
    } else if (state === "listening") {
      core.classList.add("listening");
      if (statusText) statusText.textContent = "OPTICAL & AUDIO SCANNING";
    } else {
      if (statusText) statusText.textContent = "JARVIS CORE ONLINE - 100%";
    }
  }

  switchTab(tab) {
    this.activeTab = tab;

    // Update nav tab buttons UI
    document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
      if (btn.getAttribute("data-tab") === tab) {
        btn.classList.add("bg-[#00D1FF]", "text-slate-950", "font-bold", "shadow-[0_0_15px_rgba(0,209,255,0.4)]");
        btn.classList.remove("text-cyan-200", "hover:bg-[#00D1FF]/20");
      } else {
        btn.classList.remove("bg-[#00D1FF]", "text-slate-950", "font-bold", "shadow-[0_0_15px_rgba(0,209,255,0.4)]");
        btn.classList.add("text-cyan-200", "hover:bg-[#00D1FF]/20");
      }
    });

    // Hide all view panels, show current
    document.querySelectorAll(".app-tab-panel").forEach((panel) => {
      panel.classList.add("hidden");
    });

    const currentPanel = document.getElementById(`tab-panel-${tab}`);
    if (currentPanel) {
      currentPanel.classList.remove("hidden");
    }

    playAudioFx("click");

    // Initialize subtab controllers lazily upon entry
    if (tab === "tools") {
      this.toolsManager.init(document.getElementById("tab-panel-tools"));
    } else if (tab === "webcam") {
      if (!this.webcamEngine) {
        this.webcamEngine = new WebcamEngine("webcam-video", "webcam-canvas");
      }
      this.webcamEngine.startCamera();
    } else if (tab === "weather") {
      this.weatherCtrl.loadWeather("New York", document.getElementById("tab-panel-weather"));
    } else if (tab === "news") {
      this.newsCtrl.loadNews("Tech & AI", document.getElementById("tab-panel-news"));
    } else if (tab === "translator") {
      this.translatorCtrl.init(document.getElementById("tab-panel-translator"));
    } else if (tab === "pdf") {
      this.pdfCtrl.init(document.getElementById("tab-panel-pdf"));
    } else if (tab === "settings") {
      this.settingsPanel.init(document.getElementById("tab-panel-settings"));
    } else {
      if (this.webcamEngine && this.webcamEngine.isActive) {
        this.webcamEngine.stopCamera();
      }
    }
  }

  openToolSubtab(subtoolKey) {
    if (this.activeTab === "tools") {
      this.toolsManager.switchSubtool(subtoolKey, document.getElementById("tab-panel-tools"));
    }
  }

  async handleUserMessage(message) {
    // Append User Message to UI
    this.appendMessageToUI("user", message);

    // Check Built-in Commands First
    const systemResponse = await parseAndExecuteCommand(message, this);
    if (systemResponse !== null) {
      this.appendMessageToUI("model", systemResponse);
      this.speechEngine.speak(systemResponse);
      return;
    }

    // Check Webcam snapshot mode
    let imageBase64 = null;
    if (this.webcamEngine && this.webcamEngine.isActive) {
      imageBase64 = this.webcamEngine.captureFrame();
    }

    // If no built-in system command match, query Gemini AI
    try {
      this.updateArcReactorState("thinking");

      // Create streaming placeholder message bubble
      const modelBubbleId = "msg-" + Date.now();
      this.createStreamingBubbleUI(modelBubbleId);

      let fullAiText = "";
      await this.aiCore.sendMessage({
        message,
        imageBase64,
        onChunk: (chunkText, currentFullText) => {
          fullAiText = currentFullText;
          this.updateStreamingBubbleUI(modelBubbleId, currentFullText);
        },
      });

      // Speak response
      this.updateArcReactorState("speaking");
      this.speechEngine.speak(fullAiText, () => {
        this.updateArcReactorState("ready");
      });
    } catch (err) {
      showToast("AI Execution Error: " + err.message, "error");
      this.appendMessageToUI("model", "⚠️ System Exception: " + err.message);
    }
  }

  appendMessageToUI(role, text) {
    const list = document.getElementById("chat-messages-list");
    if (!list) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const isUser = role === "user";

    const msgBox = document.createElement("div");
    msgBox.className = `flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1 animate-slide-in`;

    const senderLabel = isUser ? "YOU" : "J.A.R.V.I.S.";
    const avatarBadge = isUser ? "👤" : "🤖";
    const bgStyle = isUser
      ? "bg-gradient-to-r from-blue-600/60 to-cyan-600/60 border-cyan-400/50 rounded-2xl rounded-tr-none text-white shadow-[0_0_15px_rgba(0,119,255,0.3)]"
      : "glass-panel border-[#00D1FF]/30 rounded-2xl rounded-tl-none text-cyan-100 shadow-[0_0_15px_rgba(0,209,255,0.2)]";

    const htmlContent = marked.parse(text || "");

    msgBox.innerHTML = `
      <div class="flex items-center gap-2 text-[10px] font-mono text-cyan-400/80 px-1">
        <span>${avatarBadge} ${senderLabel}</span>
        <span>•</span>
        <span>${timeStr}</span>
      </div>
      <div class="p-4 max-w-[85%] sm:max-w-[75%] border text-sm leading-relaxed ${bgStyle}">
        <div class="prose prose-invert max-w-none text-cyan-100">${htmlContent}</div>
      </div>
    `;

    list.appendChild(msgBox);
    list.scrollTop = list.scrollHeight;
  }

  createStreamingBubbleUI(id) {
    const list = document.getElementById("chat-messages-list");
    if (!list) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const msgBox = document.createElement("div");
    msgBox.id = id;
    msgBox.className = "flex flex-col items-start space-y-1 animate-slide-in";

    msgBox.innerHTML = `
      <div class="flex items-center gap-2 text-[10px] font-mono text-cyan-400/80 px-1">
        <span>🤖 J.A.R.V.I.S.</span>
        <span>•</span>
        <span>${timeStr}</span>
      </div>
      <div class="p-4 max-w-[85%] sm:max-w-[75%] border glass-panel border-[#00D1FF]/30 rounded-2xl rounded-tl-none text-cyan-100 shadow-[0_0_15px_rgba(0,209,255,0.2)] text-sm leading-relaxed">
        <div class="bubble-content prose prose-invert max-w-none text-cyan-100"><span class="animate-pulse">JARVIS stream telemetry initializing...</span></div>
      </div>
    `;

    list.appendChild(msgBox);
    list.scrollTop = list.scrollHeight;
  }

  updateStreamingBubbleUI(id, fullText) {
    const msgBox = document.getElementById(id);
    if (!msgBox) return;

    const contentEl = msgBox.querySelector(".bubble-content");
    if (contentEl) {
      contentEl.innerHTML = marked.parse(fullText || "");
    }

    const list = document.getElementById("chat-messages-list");
    if (list) list.scrollTop = list.scrollHeight;
  }

  renderChatHistory() {
    const list = document.getElementById("chat-messages-list");
    if (!list) return;

    list.innerHTML = "";
    const history = this.aiCore.getHistory();

    if (history.length === 0) {
      list.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center space-y-3 text-cyan-400/60 p-8">
          <div class="w-16 h-16 rounded-full border border-[#00D1FF]/30 flex items-center justify-center text-3xl animate-pulse">
            🤖
          </div>
          <div class="text-sm font-mono tracking-widest uppercase">JARVIS v2 Session Ready</div>
          <div class="text-xs text-gray-400 max-w-md">Type a prompt, click the mic icon, or say "Hey Jarvis" to initiate speech commands.</div>
        </div>
      `;
      return;
    }

    history.forEach((msg) => {
      this.appendMessageToUI(msg.role, msg.text);
    });
  }

  clearChat() {
    this.aiCore.clearHistory();
    this.renderChatHistory();
    showToast("Conversation memory cleared.", "info");
  }

  stopSpeaking() {
    this.speechEngine.stopSpeaking();
  }

  startClockLoop() {
    const clockEl = document.getElementById("hud-clock-time");
    const update = () => {
      if (clockEl) {
        clockEl.textContent = new Date().toLocaleTimeString();
      }
    };
    update();
    setInterval(update, 1000);
  }

  startDiagnosticsLoop() {
    const batteryEl = document.getElementById("telemetry-env");
    const hwEl = document.getElementById("telemetry-hw");

    const updateStats = async () => {
      const sys = await getSystemDiagnostics();
      if (batteryEl) batteryEl.textContent = `22.4°C OPTIMAL • BATT: ${sys.battery.level}`;
      if (hwEl) hwEl.textContent = `CPU 12% • RAM ${sys.memoryGB} • CORES ${sys.cpuCores}`;
    };

    updateStats();
    setInterval(updateStats, 10000);
  }
}

// Instantiate on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.jarvisApp = new JarvisApp();
});

