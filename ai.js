/**
 * JARVIS AI v2 - AI Core & Gemini API Interface
 */

import { saveStorage, loadStorage } from "./utils.js";

export class AICore {
  constructor() {
    this.history = loadStorage("chat_history", []);
    this.status = "READY"; // READY, THINKING, SPEAKING, ERROR
    this.tokenEstimate = 0;
    this.statusListeners = [];
  }

  onStatusChange(listener) {
    this.statusListeners.push(listener);
  }

  setStatus(newStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((fn) => fn(newStatus));
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
    saveStorage("chat_history", []);
    this.tokenEstimate = 0;
  }

  estimateTokens(text) {
    // Rough estimate: 1 token ~ 4 chars
    return Math.ceil(text.length / 4);
  }

  /**
   * Send chat message to Express backend (/api/chat)
   */
  async sendMessage({ message, imageBase64 = null, onChunk = null }) {
    this.setStatus("THINKING");

    // Add user message to history
    if (message) {
      this.history.push({ role: "user", text: message });
      this.tokenEstimate += this.estimateTokens(message);
    }

    try {
      if (onChunk) {
        // Use streaming SSE endpoint
        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            history: this.history.slice(-10), // Keep last 10 messages for context window
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.replace("data: ", ""));
                if (data.text) {
                  fullText += data.text;
                  onChunk(data.text, fullText);
                } else if (data.error) {
                  throw new Error(data.error);
                }
              } catch (e) {
                // Ignore chunk parse errors
              }
            }
          }
        }

        if (fullText) {
          this.history.push({ role: "model", text: fullText });
          saveStorage("chat_history", this.history);
          this.tokenEstimate += this.estimateTokens(fullText);
          this.setStatus("READY");
          return fullText;
        }
      }

      // Fallback or non-streaming standard POST call
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          imageBase64,
          history: this.history.slice(-10),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to communicate with JARVIS core.");
      }

      const aiText = data.response;
      this.history.push({ role: "model", text: aiText });
      saveStorage("chat_history", this.history);
      this.tokenEstimate += this.estimateTokens(aiText);

      this.setStatus("READY");
      return aiText;
    } catch (err) {
      console.error("JARVIS AI Core Exception:", err);
      this.setStatus("ERROR");
      throw err;
    }
  }

  /**
   * Direct Translate Call
   */
  async translateText(text, targetLang) {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Translation failed");
    return data.translation;
  }

  /**
   * PDF Summarization
   */
  async summarizePDF(text, title) {
    const res = await fetch("/api/pdf-summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, title }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "PDF summarization failed");
    return data.summary;
  }

  /**
   * News Briefing
   */
  async fetchNews(category) {
    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "News fetch failed");
    return data.news;
  }

  /**
   * Weather Forecast
   */
  async fetchWeather(location) {
    const res = await fetch("/api/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Weather fetch failed");
    return data.weather;
  }
}
