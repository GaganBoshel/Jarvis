/**
 * JARVIS AI v2 - Extra Tools Suite Module
 * Includes 12 integrated productivity utilities:
 * Live Clock, Calendar, Stopwatch, Timer, Notes, Todo List, Quick Calculator,
 * QR Code Generator, Password Generator, Unit Converter, Currency Converter, Clipboard Manager.
 */

import { saveStorage, loadStorage, showToast, playAudioFx } from "./utils.js";

export class ToolsManager {
  constructor() {
    this.activeTool = "clock";
    this.stopwatchTime = 0;
    this.stopwatchTimer = null;
    this.stopwatchLaps = [];

    this.timerTime = 0;
    this.timerTimer = null;

    this.notes = loadStorage("tools_notes", [
      { id: 1, title: "Arc Reactor Specs", body: "Palladium core replaced with synthetic element vibranium alloy.", pinned: true }
    ]);

    this.todos = loadStorage("tools_todos", [
      { id: 1, text: "Calibrate repulsor thrusters", completed: true },
      { id: 2, text: "Run full diagnostic scan on Mark LXXXV armor", completed: false }
    ]);

    this.clipboardHistory = loadStorage("tools_clipboard", []);
  }

  init(containerEl) {
    if (!containerEl) return;
    this.render(containerEl);
  }

  switchSubtool(toolKey, containerEl) {
    this.activeTool = toolKey;
    if (containerEl) this.render(containerEl);
  }

  render(containerEl) {
    containerEl.innerHTML = `
      <div class="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-6">
        <!-- Sub-navigation Bar for 12 Tools -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin border-b border-cyan-500/20">
          ${[
            { id: "clock", label: "⏰ Clock" },
            { id: "calendar", label: "📅 Calendar" },
            { id: "stopwatch", label: "⏱ Stopwatch" },
            { id: "timer", label: "⌛ Timer" },
            { id: "notes", label: "📝 Notes" },
            { id: "todo", label: "✅ Todo" },
            { id: "calculator", label: "🧮 Calculator" },
            { id: "qrcode", label: "📱 QR Generator" },
            { id: "password", label: "🔐 Pass Generator" },
            { id: "unit", label: "📏 Unit Convert" },
            { id: "currency", label: "💱 Currency" },
            { id: "clipboard", label: "📋 Clipboard" }
          ]
            .map(
              (t) => `
            <button class="tool-subtab-btn shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              this.activeTool === t.id
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,243,255,0.5)] font-bold"
                : "bg-slate-900/80 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/20"
            }" data-tool="${t.id}">${t.label}</button>
          `
            )
            .join("")}
        </div>

        <!-- Tool Content Area -->
        <div id="tool-content-viewport" class="pt-2">
          ${this.getToolHTML()}
        </div>
      </div>
    `;

    // Attach subtab click listeners
    containerEl.querySelectorAll(".tool-subtab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-tool");
        if (id) this.switchSubtool(id, containerEl);
      });
    });

    this.attachToolEvents(containerEl);
  }

  getToolHTML() {
    switch (this.activeTool) {
      case "clock":
        return `
          <div class="flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <span class="text-xs font-mono tracking-widest text-cyan-400 uppercase">STARK TIME CHRONOMETER</span>
            <div id="live-hud-clock" class="text-6xl sm:text-7xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 tracking-wider">00:00:00</div>
            <div id="live-hud-date" class="text-sm font-semibold text-cyan-200/80 uppercase tracking-widest">LOADING DATE...</div>
          </div>
        `;

      case "calendar":
        return `
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest">HOLOGRAPHIC CALENDAR MATRIX</span>
              <span id="cal-month-title" class="text-sm font-bold text-white font-mono">JULY 2026</span>
            </div>
            <div class="grid grid-cols-7 gap-2 text-center text-xs font-mono text-cyan-400/70 font-bold mb-2">
              <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
            </div>
            <div id="calendar-days-grid" class="grid grid-cols-7 gap-2 text-center text-xs font-mono"></div>
          </div>
        `;

      case "stopwatch":
        return `
          <div class="flex flex-col items-center justify-center p-6 space-y-6">
            <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest">PRECISION CHRONO STOPWATCH</span>
            <div id="stopwatch-display" class="text-5xl font-mono font-bold text-white tracking-widest">00:00:00.00</div>
            <div class="flex items-center gap-3">
              <button id="sw-start-btn" class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl uppercase tracking-wider transition-all">Start</button>
              <button id="sw-lap-btn" class="bg-slate-900 border border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/20 text-xs px-5 py-2 rounded-xl uppercase tracking-wider transition-all">Lap</button>
              <button id="sw-reset-btn" class="bg-red-500/20 border border-red-500/50 text-red-200 hover:bg-red-500/40 text-xs px-5 py-2 rounded-xl uppercase tracking-wider transition-all">Reset</button>
            </div>
            <div id="stopwatch-laps" class="w-full max-h-36 overflow-y-auto space-y-1 text-xs font-mono text-cyan-200 border-t border-cyan-500/20 pt-2"></div>
          </div>
        `;

      case "timer":
        return `
          <div class="flex flex-col items-center justify-center p-6 space-y-6">
            <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest">COUNTDOWN TIMER PROTOCOL</span>
            <div id="timer-display" class="text-5xl font-mono font-bold text-white tracking-widest">05:00</div>
            <div class="flex items-center gap-3">
              <input type="number" id="timer-min-input" value="5" min="1" max="120" class="w-20 bg-slate-900 border border-cyan-500/40 text-center text-cyan-100 rounded-xl py-1 text-sm font-mono focus:outline-none focus:border-cyan-400" />
              <span class="text-xs text-gray-400 font-mono">mins</span>
            </div>
            <div class="flex items-center gap-3">
              <button id="tm-start-btn" class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-6 py-2 rounded-xl uppercase tracking-wider transition-all">Start Timer</button>
              <button id="tm-stop-btn" class="bg-red-500/20 border border-red-500/50 text-red-200 hover:bg-red-500/40 text-xs px-6 py-2 rounded-xl uppercase tracking-wider transition-all">Stop</button>
            </div>
          </div>
        `;

      case "notes":
        return `
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest">ENCRYPTED NOTES VAULT</span>
              <button id="note-add-btn" class="bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-xs px-3 py-1 rounded-lg uppercase tracking-wider font-semibold hover:bg-cyan-500/40">+ New Note</button>
            </div>
            <div id="notes-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              ${this.notes
                .map(
                  (n) => `
                <div class="bg-slate-900/80 border border-cyan-500/30 p-3.5 rounded-xl space-y-2 relative">
                  <div class="flex items-center justify-between">
                    <div class="font-bold text-sm text-white">${n.title}</div>
                    <button class="note-del-btn text-xs text-gray-400 hover:text-red-400" data-id="${n.id}">✕</button>
                  </div>
                  <div class="text-xs text-cyan-100/80 line-clamp-3">${n.body}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `;

      case "todo":
        return `
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest">MISSION TODO CHECKLIST</span>
              <span class="text-xs font-mono text-cyan-300">${this.todos.filter((t) => t.completed).length} / ${this.todos.length} Done</span>
            </div>
            <div class="flex gap-2">
              <input type="text" id="todo-input" placeholder="Add mission task..." class="w-full bg-slate-900 border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-cyan-100 placeholder-gray-500 focus:outline-none focus:border-cyan-400" />
              <button id="todo-add-btn" class="bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider">Add</button>
            </div>
            <div id="todo-list" class="space-y-2 max-h-52 overflow-y-auto">
              ${this.todos
                .map(
                  (t) => `
                <div class="flex items-center justify-between p-2.5 bg-slate-900/60 border border-cyan-500/20 rounded-xl">
                  <label class="flex items-center gap-3 text-xs text-cyan-100 cursor-pointer ${t.completed ? "line-through opacity-50" : ""}">
                    <input type="checkbox" class="todo-toggle accent-cyan-400 rounded" data-id="${t.id}" ${t.completed ? "checked" : ""} />
                    <span>${t.text}</span>
                  </label>
                  <button class="todo-del-btn text-xs text-gray-400 hover:text-red-400" data-id="${t.id}">✕</button>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `;

      case "calculator":
        return `
          <div class="max-w-xs mx-auto space-y-3">
            <input type="text" id="calc-display" readonly value="0" class="w-full bg-slate-950 border border-cyan-500/40 rounded-xl p-3 text-right font-mono text-2xl text-cyan-200 tracking-wider focus:outline-none" />
            <div class="grid grid-cols-4 gap-2">
              ${["C", "(", ")", "/", "7", "8", "9", "*", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "DEL", "="]
                .map(
                  (btn) => `
                <button class="calc-btn p-3 bg-slate-900 border border-cyan-500/30 hover:bg-cyan-500/20 rounded-xl font-mono text-sm font-bold ${
                  btn === "=" ? "bg-cyan-500 text-slate-950 col-span-2" : "text-cyan-200"
                }" data-val="${btn}">${btn}</button>
              `
                )
                .join("")}
            </div>
          </div>
        `;

      case "qrcode":
        return `
          <div class="flex flex-col items-center justify-center p-4 space-y-4">
            <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest">QR CODE GENERATOR</span>
            <input type="text" id="qr-input" value="https://ai.studio/build" placeholder="Enter URL or text..." class="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-xl p-2.5 text-xs text-cyan-100 placeholder-gray-500 focus:outline-none focus:border-cyan-400" />
            <div id="qr-output-box" class="p-4 bg-white rounded-2xl shadow-[0_0_20px_rgba(0,243,255,0.4)]">
              <img id="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://ai.studio/build" alt="QR Code" class="w-44 h-44" />
            </div>
          </div>
        `;

      case "password":
        return `
          <div class="max-w-md mx-auto space-y-4">
            <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest">HIGH-ENTROPY PASSWORD GENERATOR</span>
            <div class="flex items-center gap-2">
              <input type="text" id="pass-output" readonly value="⚡J4rv1s!St4rk2026$" class="w-full bg-slate-950 border border-cyan-500/40 rounded-xl p-3 text-cyan-200 font-mono text-sm tracking-wider" />
              <button id="pass-copy-btn" class="bg-cyan-500 text-slate-950 font-bold px-4 py-3 rounded-xl text-xs uppercase">Copy</button>
            </div>
            <button id="pass-gen-btn" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,243,255,0.4)]">
              Generate New Secure Token
            </button>
          </div>
        `;

      case "unit":
        return `
          <div class="max-w-md mx-auto space-y-4">
            <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest">STARK UNIT CONVERTER</span>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-gray-400 font-mono">Value (Km):</label>
                <input type="number" id="unit-km-input" value="1" class="w-full bg-slate-900 border border-cyan-500/40 rounded-xl p-2.5 text-xs text-cyan-100" />
              </div>
              <div>
                <label class="text-xs text-gray-400 font-mono">Equals (Miles):</label>
                <input type="text" id="unit-miles-output" readonly value="0.621" class="w-full bg-slate-950 border border-cyan-500/40 rounded-xl p-2.5 text-xs text-cyan-300 font-mono font-bold" />
              </div>
            </div>
          </div>
        `;

      case "currency":
        return `
          <div class="max-w-md mx-auto space-y-4">
            <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest">CURRENCY EXCHANGE MATRIX</span>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-gray-400 font-mono">USD ($):</label>
                <input type="number" id="curr-usd" value="100" class="w-full bg-slate-900 border border-cyan-500/40 rounded-xl p-2.5 text-xs text-cyan-100" />
              </div>
              <div>
                <label class="text-xs text-gray-400 font-mono">EUR (€ Approx):</label>
                <input type="text" id="curr-eur" readonly value="92.00" class="w-full bg-slate-950 border border-cyan-500/40 rounded-xl p-2.5 text-xs text-cyan-300 font-mono font-bold" />
              </div>
            </div>
          </div>
        `;

      case "clipboard":
        return `
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest">CLIPBOARD LOG VAULT</span>
              <button id="clip-add-btn" class="bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-xs px-3 py-1 rounded-lg uppercase">Read Clipboard</button>
            </div>
            <div id="clip-history-list" class="space-y-2 max-h-52 overflow-y-auto">
              ${
                this.clipboardHistory.length === 0
                  ? `<div class="text-xs text-gray-500 italic text-center p-4">No saved clipboard entries. Click Read Clipboard to grab text.</div>`
                  : this.clipboardHistory
                      .map(
                        (item, i) => `
                    <div class="p-2.5 bg-slate-900/60 border border-cyan-500/20 rounded-xl flex items-center justify-between text-xs text-cyan-100">
                      <span class="truncate max-w-xs">${item}</span>
                      <button class="clip-copy-item text-cyan-400 hover:text-white" data-idx="${i}">📋 Copy</button>
                    </div>
                  `
                      )
                      .join("")
              }
            </div>
          </div>
        `;
    }
  }

  attachToolEvents(containerEl) {
    if (this.activeTool === "clock") {
      const updateClock = () => {
        const clockEl = document.getElementById("live-hud-clock");
        const dateEl = document.getElementById("live-hud-date");
        if (clockEl) {
          const now = new Date();
          clockEl.textContent = now.toLocaleTimeString();
          if (dateEl) {
            dateEl.textContent = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
          }
        }
      };
      updateClock();
      setInterval(updateClock, 1000);
    }

    if (this.activeTool === "calendar") {
      const daysGrid = document.getElementById("calendar-days-grid");
      if (daysGrid) {
        const now = new Date();
        const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

        let cells = "";
        for (let i = 0; i < firstDay; i++) {
          cells += `<div class="p-2 text-transparent">0</div>`;
        }
        for (let d = 1; d <= totalDays; d++) {
          const isToday = d === now.getDate();
          cells += `
            <div class="p-2 rounded-lg border ${
              isToday
                ? "bg-cyan-500 text-slate-950 font-bold border-cyan-300 shadow-[0_0_10px_rgba(0,243,255,0.6)]"
                : "border-cyan-500/20 bg-slate-900/60 text-cyan-200"
            }">${d}</div>
          `;
        }
        daysGrid.innerHTML = cells;
      }
    }

    if (this.activeTool === "stopwatch") {
      const display = document.getElementById("stopwatch-display");
      const startBtn = document.getElementById("sw-start-btn");
      const lapBtn = document.getElementById("sw-lap-btn");
      const resetBtn = document.getElementById("sw-reset-btn");
      const lapsContainer = document.getElementById("stopwatch-laps");

      startBtn?.addEventListener("click", () => {
        if (!this.stopwatchTimer) {
          const startTime = Date.now() - this.stopwatchTime;
          this.stopwatchTimer = setInterval(() => {
            this.stopwatchTime = Date.now() - startTime;
            const ms = Math.floor((this.stopwatchTime % 1000) / 10);
            const secs = Math.floor((this.stopwatchTime / 1000) % 60);
            const mins = Math.floor(this.stopwatchTime / 60000);
            if (display) {
              display.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
            }
          }, 10);
          startBtn.textContent = "Pause";
        } else {
          clearInterval(this.stopwatchTimer);
          this.stopwatchTimer = null;
          startBtn.textContent = "Start";
        }
      });

      lapBtn?.addEventListener("click", () => {
        if (display && lapsContainer) {
          this.stopwatchLaps.push(display.textContent);
          lapsContainer.innerHTML = this.stopwatchLaps.map((lap, i) => `<div>Lap ${i + 1}: ${lap}</div>`).join("");
        }
      });

      resetBtn?.addEventListener("click", () => {
        clearInterval(this.stopwatchTimer);
        this.stopwatchTimer = null;
        this.stopwatchTime = 0;
        this.stopwatchLaps = [];
        if (display) display.textContent = "00:00:00.00";
        if (startBtn) startBtn.textContent = "Start";
        if (lapsContainer) lapsContainer.innerHTML = "";
      });
    }

    if (this.activeTool === "calculator") {
      const calcDisplay = document.getElementById("calc-display");
      containerEl.querySelectorAll(".calc-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const val = e.currentTarget.getAttribute("data-val");
          if (!calcDisplay) return;

          if (val === "C") {
            calcDisplay.value = "0";
          } else if (val === "DEL") {
            calcDisplay.value = calcDisplay.value.slice(0, -1) || "0";
          } else if (val === "=") {
            try {
              calcDisplay.value = eval(calcDisplay.value);
            } catch (err) {
              calcDisplay.value = "Error";
            }
          } else {
            if (calcDisplay.value === "0" || calcDisplay.value === "Error") {
              calcDisplay.value = val;
            } else {
              calcDisplay.value += val;
            }
          }
        });
      });
    }

    if (this.activeTool === "qrcode") {
      const qrInput = document.getElementById("qr-input");
      const qrImg = document.getElementById("qr-img");
      qrInput?.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        if (val && qrImg) {
          qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(val)}`;
        }
      });
    }

    if (this.activeTool === "password") {
      const genBtn = document.getElementById("pass-gen-btn");
      const copyBtn = document.getElementById("pass-copy-btn");
      const passOutput = document.getElementById("pass-output");

      genBtn?.addEventListener("click", () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        let res = "";
        for (let i = 0; i < 18; i++) {
          res += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (passOutput) passOutput.value = res;
      });

      copyBtn?.addEventListener("click", () => {
        if (passOutput) {
          navigator.clipboard.writeText(passOutput.value);
          showToast("Password copied to clipboard!", "success");
        }
      });
    }

    if (this.activeTool === "todo") {
      const todoInput = document.getElementById("todo-input");
      const addBtn = document.getElementById("todo-add-btn");

      addBtn?.addEventListener("click", () => {
        const text = todoInput?.value.trim();
        if (text) {
          this.todos.push({ id: Date.now(), text, completed: false });
          saveStorage("tools_todos", this.todos);
          this.render(containerEl);
        }
      });

      containerEl.querySelectorAll(".todo-toggle").forEach((chk) => {
        chk.addEventListener("change", (e) => {
          const id = Number(e.currentTarget.getAttribute("data-id"));
          const item = this.todos.find((t) => t.id === id);
          if (item) item.completed = e.currentTarget.checked;
          saveStorage("tools_todos", this.todos);
          this.render(containerEl);
        });
      });

      containerEl.querySelectorAll(".todo-del-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = Number(e.currentTarget.getAttribute("data-id"));
          this.todos = this.todos.filter((t) => t.id !== id);
          saveStorage("tools_todos", this.todos);
          this.render(containerEl);
        });
      });
    }

    if (this.activeTool === "unit") {
      const kmInput = document.getElementById("unit-km-input");
      const milesOutput = document.getElementById("unit-miles-output");
      kmInput?.addEventListener("input", (e) => {
        const km = parseFloat(e.target.value) || 0;
        if (milesOutput) milesOutput.value = (km * 0.621371).toFixed(3);
      });
    }

    if (this.activeTool === "currency") {
      const usdInput = document.getElementById("curr-usd");
      const eurOutput = document.getElementById("curr-eur");
      usdInput?.addEventListener("input", (e) => {
        const usd = parseFloat(e.target.value) || 0;
        if (eurOutput) eurOutput.value = (usd * 0.92).toFixed(2);
      });
    }

    if (this.activeTool === "clipboard") {
      const clipBtn = document.getElementById("clip-add-btn");
      clipBtn?.addEventListener("click", async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            this.clipboardHistory.unshift(text);
            saveStorage("tools_clipboard", this.clipboardHistory);
            this.render(containerEl);
            showToast("Clipboard text logged!", "success");
          }
        } catch (e) {
          showToast("Clipboard permission required.", "error");
        }
      });
    }
  }
}
