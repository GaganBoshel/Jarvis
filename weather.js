/**
 * JARVIS AI v2 - Weather Subsystem Controller
 */

import { playAudioFx, showToast } from "./utils.js";

export class WeatherController {
  constructor(aiCore) {
    this.aiCore = aiCore;
    this.currentLocation = "New York";
  }

  async loadWeather(location, containerEl) {
    if (!containerEl) return;
    this.currentLocation = location || "New York";

    containerEl.innerHTML = `
      <div class="flex flex-col items-center justify-center p-12 text-cyan-400">
        <div class="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div class="text-sm tracking-widest uppercase">Querying Atmospheric Telemetry for ${this.currentLocation}...</div>
      </div>
    `;

    try {
      const data = await this.aiCore.fetchWeather(this.currentLocation);
      playAudioFx("beep");
      this.renderWeather(data, containerEl);
    } catch (err) {
      containerEl.innerHTML = `
        <div class="glass-panel p-6 border border-red-500/50 rounded-xl text-red-300 text-center">
          <div class="text-lg font-bold mb-2">Meteorological Telemetry Error</div>
          <div class="text-sm opacity-80">${err.message}</div>
          <button id="weather-retry-btn" class="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500 text-red-200 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all">Retry Link</button>
        </div>
      `;
      document.getElementById("weather-retry-btn")?.addEventListener("click", () => this.loadWeather(this.currentLocation, containerEl));
    }
  }

  renderWeather(w, containerEl) {
    const city = w.city || this.currentLocation;
    const temp = w.temp ?? 22;
    const condition = w.condition || "Clear Skies";
    const humidity = w.humidity ?? 45;
    const windSpeed = w.windSpeed ?? 12;
    const uvIndex = w.uvIndex ?? 4;
    const rec = w.recommendation || "All atmospheric vectors within optimal parameters, sir.";
    const forecast = w.forecast || [
      { day: "Tomorrow", temp: temp + 1, condition: condition },
      { day: "Day 2", temp: temp - 2, condition: "Partly Cloudy" },
      { day: "Day 3", temp: temp, condition: "Clear" },
    ];

    containerEl.innerHTML = `
      <div class="glass-panel p-6 rounded-2xl border border-cyan-500/30 relative overflow-hidden space-y-6">
        <!-- Glow Overlay -->
        <div class="absolute -right-16 -top-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <!-- Header Search Bar -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
          <div>
            <span class="text-xs font-mono uppercase tracking-widest text-cyan-400">ATMOSPHERIC SATELLITE FEED</span>
            <h2 class="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              <span>📍 ${city}</span>
            </h2>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <input type="text" id="weather-search-input" value="${city}" placeholder="Enter City Name..." class="bg-slate-900/80 border border-cyan-500/40 px-3 py-1.5 rounded-lg text-sm text-cyan-100 placeholder-gray-500 focus:outline-none focus:border-cyan-400 w-full sm:w-48" />
            <button id="weather-search-btn" class="bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/60 px-4 py-1.5 rounded-lg text-xs font-semibold text-cyan-200 uppercase tracking-wider transition-all">Scan</button>
          </div>
        </div>

        <!-- Main Temp Display -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div class="md:col-span-1 flex flex-col items-center md:items-start justify-center border-r-0 md:border-r border-cyan-500/20 pr-0 md:pr-6">
            <div class="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 font-mono">${temp}°C</div>
            <div class="text-lg font-semibold text-cyan-200 mt-1">${condition}</div>
          </div>

          <div class="md:col-span-2 grid grid-cols-3 gap-4 text-center">
            <div class="bg-cyan-950/40 border border-cyan-500/20 p-3 rounded-xl">
              <div class="text-xs text-cyan-400/80 uppercase font-mono">Humidity</div>
              <div class="text-xl font-bold text-white mt-1">${humidity}%</div>
            </div>
            <div class="bg-cyan-950/40 border border-cyan-500/20 p-3 rounded-xl">
              <div class="text-xs text-cyan-400/80 uppercase font-mono">Wind Speed</div>
              <div class="text-xl font-bold text-white mt-1">${windSpeed} <span class="text-xs font-normal">km/h</span></div>
            </div>
            <div class="bg-cyan-950/40 border border-cyan-500/20 p-3 rounded-xl">
              <div class="text-xs text-cyan-400/80 uppercase font-mono">UV Index</div>
              <div class="text-xl font-bold text-white mt-1">${uvIndex}</div>
            </div>
          </div>
        </div>

        <!-- Recommendation Banner -->
        <div class="bg-cyan-900/30 border-l-4 border-cyan-400 p-4 rounded-r-xl text-sm text-cyan-100 flex items-start gap-3">
          <div class="text-cyan-400 text-lg font-bold">🤖</div>
          <div>
            <div class="text-xs uppercase font-mono tracking-widest text-cyan-400">JARVIS ADVISORY</div>
            <div class="italic text-cyan-200/90 mt-0.5">"${rec}"</div>
          </div>
        </div>

        <!-- 3-Day Forecast Grid -->
        <div>
          <div class="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">3-DAY METEOROLOGICAL FORECAST</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            ${forecast
              .map(
                (f) => `
              <div class="bg-slate-900/60 border border-cyan-500/20 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <div class="text-xs font-mono text-cyan-300 font-bold">${f.day}</div>
                  <div class="text-xs text-gray-400 mt-0.5">${f.condition}</div>
                </div>
                <div class="text-xl font-bold text-white font-mono">${f.temp}°C</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;

    // Search event
    document.getElementById("weather-search-btn")?.addEventListener("click", () => {
      const inputVal = document.getElementById("weather-search-input")?.value;
      if (inputVal) this.loadWeather(inputVal, containerEl);
    });

    document.getElementById("weather-search-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const inputVal = document.getElementById("weather-search-input")?.value;
        if (inputVal) this.loadWeather(inputVal, containerEl);
      }
    });
  }
}
