/**
 * JARVIS AI v2 - Advanced Speech Recognition & Speech Synthesis Engine
 * Features:
 * - Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 * - Continuous listening mode with graceful auto-restart
 * - Wake Word detection ("Hey Jarvis") with audio prompt and voice response ("Yes Sir?")
 * - SpeechSynthesis with natural voice selection, pitch, rate, volume, queue management
 * - Speech Pause, Resume, Stop controls
 * - Robust error handling (permission denied, audio-capture, speech timeout)
 */

import { CONFIG } from "./config.js";
import { playAudioFx, showToast } from "./utils.js";

export class SpeechEngine {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.isPaused = false;
    this.voices = [];
    this.selectedVoice = null;
    this.speechQueue = [];
    this.manualStopped = false;

    // Callbacks for UI sync
    this.onTranscriptCallback = null;
    this.onWakeWordCallback = null;
    this.onSpeechStartCallback = null;
    this.onSpeechEndCallback = null;
    this.onSpeakingStateChangeCallback = null;

    this.initRecognition();
    this.loadVoices();
  }

  /**
   * Load and filter system voices for speech synthesis
   */
  loadVoices() {
    if (!this.synthesis) return;
    const populate = () => {
      this.voices = this.synthesis.getVoices();
      if (this.voices.length === 0) return;

      // Prefer high quality English male or natural neural voices
      this.selectedVoice =
        this.voices.find(
          (v) =>
            v.lang.startsWith(CONFIG.speech.lang.slice(0, 2)) &&
            (v.name.includes("Natural") ||
              v.name.includes("Google") ||
              v.name.includes("Daniel") ||
              v.name.includes("Oliver") ||
              v.name.includes("Arthur") ||
              v.name.includes("UK Male") ||
              v.name.includes("George"))
        ) ||
        this.voices.find((v) => v.lang.startsWith("en")) ||
        this.voices[0];
    };

    populate();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = populate;
    }
  }

  getVoices() {
    if (!this.voices || this.voices.length === 0) {
      if (this.synthesis) this.voices = this.synthesis.getVoices();
    }
    return this.voices;
  }

  setVoice(voiceName) {
    const found = this.voices.find((v) => v.name === voiceName);
    if (found) {
      this.selectedVoice = found;
      showToast(`JARVIS Voice set to: ${found.name}`, "info");
    }
  }

  setLanguage(langCode) {
    CONFIG.speech.lang = langCode;
    if (this.recognition) {
      this.recognition.lang = langCode;
      if (this.isListening) {
        this.stopListening();
        setTimeout(() => this.startListening(), 300);
      }
    }
    this.loadVoices();
    showToast(`Speech language updated: ${langCode}`, "info");
  }

  /**
   * Initialize Web Speech Recognition
   */
  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech Recognition API is not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = CONFIG.speech.continuousListening;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = CONFIG.speech.lang;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.manualStopped = false;
      if (this.onSpeechStartCallback) this.onSpeechStartCallback();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onSpeechEndCallback) this.onSpeechEndCallback();

      // Continuous auto-restart logic unless manually stopped
      if (!this.manualStopped && (CONFIG.speech.continuousListening || CONFIG.speech.wakeWordEnabled)) {
        setTimeout(() => {
          if (!this.isListening && !this.manualStopped) {
            try {
              this.recognition.start();
            } catch (e) {
              // Ignore restart collisions
            }
          }
        }, 800);
      }
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      this.isListening = false;

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        this.manualStopped = true;
        showToast("Microphone access permission denied. Click Voice Mic to enable.", "error");
      } else if (event.error === "no-speech") {
        // Silently retry on speech timeout
      }

      if (this.onSpeechEndCallback) this.onSpeechEndCallback();
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const rawText = (finalTranscript || interimTranscript).trim();
      const lowerText = rawText.toLowerCase();

      // Check Wake Word ("Hey Jarvis" / "Jarvis")
      if (CONFIG.speech.wakeWordEnabled && lowerText.includes(CONFIG.wakeWord)) {
        playAudioFx("activate");
        showToast("Wake Word Detected: Hey Jarvis", "info");

        if (this.onWakeWordCallback) this.onWakeWordCallback();

        // Extract any user command uttered right after wake word
        const wakeIdx = lowerText.indexOf(CONFIG.wakeWord);
        const commandAfter = rawText.substring(wakeIdx + CONFIG.wakeWord.length).trim();

        if (commandAfter && finalTranscript && this.onTranscriptCallback) {
          this.onTranscriptCallback(commandAfter, true);
        }
        return;
      }

      // Normal speech transcription broadcast
      if (finalTranscript && this.onTranscriptCallback) {
        this.onTranscriptCallback(finalTranscript, true);
      } else if (interimTranscript && this.onTranscriptCallback) {
        this.onTranscriptCallback(interimTranscript, false);
      }
    };
  }

  startListening() {
    if (!this.recognition) {
      showToast("Speech Recognition is not supported in this browser environment.", "error");
      return;
    }
    this.manualStopped = false;
    this.stopSpeaking();

    try {
      this.recognition.start();
    } catch (e) {
      // Already active
    }
  }

  stopListening() {
    this.manualStopped = true;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore stop error
      }
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
      showToast("Microphone deactivated.", "info");
    } else {
      this.startListening();
      showToast("Microphone listening...", "info");
    }
  }

  /**
   * Speak response using Web SpeechSynthesis API
   */
  speak(text, onEnd) {
    if (!this.synthesis || !CONFIG.speech.autoSpeakResponses) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel current speech to prevent overlaps
    this.stopSpeaking();

    // Clean text: remove markdown symbols, code blocks, URLs
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*#_~>]/g, "")
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) utterance.voice = this.selectedVoice;
    utterance.rate = CONFIG.speech.rate;
    utterance.pitch = CONFIG.speech.pitch;
    utterance.volume = CONFIG.speech.volume;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      if (this.onSpeakingStateChangeCallback) {
        this.onSpeakingStateChangeCallback(true);
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      if (this.onSpeakingStateChangeCallback) {
        this.onSpeakingStateChangeCallback(false);
      }
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.warn("Speech synthesis error:", err);
      this.isSpeaking = false;
      this.isPaused = false;
      if (this.onSpeakingStateChangeCallback) {
        this.onSpeakingStateChangeCallback(false);
      }
      if (onEnd) onEnd();
    };

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      if (this.onSpeakingStateChangeCallback) {
        this.onSpeakingStateChangeCallback(false);
      }
    }
  }

  pauseSpeaking() {
    if (this.synthesis && this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
      this.isPaused = true;
      showToast("Speech synthesis paused.", "info");
    }
  }

  resumeSpeaking() {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
      this.isPaused = false;
      showToast("Speech synthesis resumed.", "info");
    }
  }
}

