/**
 * JARVIS AI v2 - Built-in Commands Parser & Executor
 */

import { getSystemDiagnostics, playAudioFx } from "./utils.js";

export async function parseAndExecuteCommand(transcript, appController) {
  const query = transcript.trim().toLowerCase();

  // 1. Navigation / Open Links
  if (query.includes("open google")) {
    window.open("https://www.google.com", "_blank");
    return "Opening Google in a new tab, sir.";
  }
  if (query.includes("open youtube")) {
    window.open("https://www.youtube.com", "_blank");
    return "Launching YouTube.";
  }
  if (query.includes("open github")) {
    window.open("https://github.com", "_blank");
    return "Accessing GitHub repositories.";
  }
  if (query.includes("open gmail") || query.includes("open mail")) {
    window.open("https://mail.google.com", "_blank");
    return "Opening Gmail inbox.";
  }
  if (query.includes("open chatgpt") || query.includes("open openai")) {
    window.open("https://chat.openai.com", "_blank");
    return "Opening ChatGPT portal.";
  }
  if (query.includes("open spotify")) {
    window.open("https://open.spotify.com", "_blank");
    return "Opening Spotify web player.";
  }

  // 2. Search Commands
  if (query.startsWith("search google for ") || query.startsWith("search google ")) {
    const term = query.replace("search google for ", "").replace("search google ", "").trim();
    window.open(`https://www.google.com/search?q=${encodeURIComponent(term)}`, "_blank");
    return `Executing Google search for: "${term}".`;
  }
  if (query.startsWith("search youtube for ") || query.startsWith("search youtube ")) {
    const term = query.replace("search youtube for ", "").replace("search youtube ", "").trim();
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`, "_blank");
    return `Searching YouTube for: "${term}".`;
  }

  // 3. Music Control Commands
  if (query === "play music" || query === "start music" || query.includes("play ambient music")) {
    appController.playAmbientMusic();
    return "Playing Stark ambient synth soundtrack, sir.";
  }
  if (query === "pause music") {
    appController.pauseAmbientMusic();
    return "Ambient soundtrack paused.";
  }
  if (query === "resume music") {
    appController.resumeAmbientMusic();
    return "Resuming ambient soundtrack.";
  }
  if (query === "stop music") {
    appController.stopAmbientMusic();
    return "Ambient music stopped.";
  }

  // 4. Time & Date
  if (query.includes("time") && !query.includes("timer")) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    return `The current local time is ${timeStr}.`;
  }
  if (query.includes("date") || query.includes("today")) {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    return `Today's date is ${dateStr}.`;
  }

  // 5. System & Telemetry Commands
  if (query.includes("battery percentage") || query.includes("battery level") || query.includes("battery")) {
    const sys = await getSystemDiagnostics();
    return `Battery telemetry: ${sys.battery.level} capacity remaining. Charging status: ${sys.battery.charging ? "Power supply connected" : "Operating on internal battery"}.`;
  }
  if (query.includes("charging status")) {
    const sys = await getSystemDiagnostics();
    return `Charging status: ${sys.battery.charging ? "AC Adapter connected and charging." : "Discharging on internal battery."}`;
  }
  if (query.includes("internet status") || query.includes("connection status")) {
    const sys = await getSystemDiagnostics();
    return `Internet connectivity status: ${sys.online ? "ONLINE" : "OFFLINE"}. Link capacity: ${sys.connectionType}.`;
  }
  if (query.includes("browser information") || query.includes("browser info")) {
    const sys = await getSystemDiagnostics();
    return `Browser environment: ${sys.browser}. User Agent: ${navigator.userAgent}`;
  }
  if (query.includes("device information") || query.includes("system info") || query.includes("device info")) {
    const sys = await getSystemDiagnostics();
    return `Device Telemetry:\n- OS: ${sys.os}\n- CPU Cores: ${sys.cpuCores}\n- System Memory: ${sys.memoryGB}\n- Display Resolution: ${sys.screenRes}\n- Network: ${sys.online ? "Online" : "Offline"}`;
  }
  if (query.includes("screen resolution") || query.includes("display resolution")) {
    return `Screen display dimensions: ${window.screen.width} x ${window.screen.height} pixels. Viewport: ${window.innerWidth} x ${window.innerHeight}.`;
  }

  // 6. Tool Suite Navigation Commands
  if (query.includes("open calculator") || query === "calculator") {
    appController.switchTab("tools");
    appController.openToolSubtab("calculator");
    return "Calculator module activated on your HUD.";
  }
  if (query.includes("generate password") || query.includes("open password generator")) {
    appController.switchTab("tools");
    appController.openToolSubtab("password");
    return "Password security generator open.";
  }
  if (query.includes("generate qr code") || query.includes("open qr generator") || query.includes("qr code")) {
    appController.switchTab("tools");
    appController.openToolSubtab("qrcode");
    return "QR Code Generator module active.";
  }
  if (query.includes("translate this") || query.includes("open translator") || query.includes("translate")) {
    appController.switchTab("translator");
    return "Polyglot translation portal active.";
  }
  if (query.includes("summarize this pdf") || query.includes("open pdf") || query.includes("pdf summarizer")) {
    appController.switchTab("pdf");
    return "PDF document analysis tool loaded.";
  }
  if (query.includes("take photo") || query.includes("capture snapshot") || query.includes("take picture")) {
    appController.switchTab("webcam");
    if (appController.webcamEngine) {
      const img = appController.webcamEngine.captureFrame();
      if (img) {
        return "Optical snapshot captured and buffered for vision telemetry.";
      }
    }
    return "Optical webcam vision active. Ready for frame capture.";
  }
  if (query.includes("start webcam") || query.includes("open camera") || query.includes("open webcam")) {
    appController.switchTab("webcam");
    return "Optical camera feed initiated.";
  }
  if (query.includes("stop webcam") || query.includes("close camera") || query.includes("stop camera")) {
    if (appController.webcamEngine) {
      appController.webcamEngine.stopCamera();
    }
    return "Optical camera feed terminated.";
  }
  if (query.includes("open weather") || query === "weather") {
    appController.switchTab("weather");
    return "Meteorological satellite dashboard active.";
  }
  if (query.includes("open news") || query === "latest news" || query === "news") {
    appController.switchTab("news");
    return "Intelligence news feed loaded.";
  }

  // 7. Theme Switching
  if (query.includes("light mode")) {
    appController.setTheme("lightMode");
    return "Switching HUD to Stark Light Mode.";
  }
  if (query.includes("dark mode") || query.includes("neon blue") || query.includes("sleek cyan")) {
    appController.setTheme("neonCyan");
    return "Sleek Cyan HUD theme engaged.";
  }
  if (query.includes("cyberpunk mode") || query.includes("cyberpunk")) {
    appController.setTheme("cyberpunk");
    return "Cyberpunk theme activated.";
  }
  if (query.includes("crimson mode") || query.includes("red theme")) {
    appController.setTheme("crimson");
    return "Mark L Crimson protocol initiated.";
  }

  // 8. Speech & Session Controls
  if (query === "clear chat" || query === "clear conversation") {
    appController.clearChat();
    return "Chat conversation memory cleared.";
  }
  if (query === "stop speaking" || query === "shut up" || query === "be quiet" || query === "stop audio") {
    appController.speechEngine.stopSpeaking();
    return "Audio synthesis output muted.";
  }
  if (query === "pause speaking" || query === "pause audio") {
    appController.speechEngine.pauseSpeaking();
    return "Audio output paused.";
  }
  if (query === "resume speaking" || query === "resume audio") {
    appController.speechEngine.resumeSpeaking();
    return "Audio output resumed.";
  }
  if (query === "help" || query === "commands" || query === "show commands") {
    return `JARVIS Voice Command Reference:\n- Navigation: "Open Google", "Open YouTube", "Open GitHub", "Open Gmail", "Open Spotify"\n- Search: "Search Google for [query]", "Search YouTube for [query]"\n- Music: "Play music", "Pause music", "Resume music", "Stop music"\n- System: "Tell me the time / date", "Battery percentage", "Charging status", "Device info", "Screen resolution"\n- Tools: "Open Calculator", "Generate password", "Generate QR code", "Translate this", "Summarize this PDF", "Start webcam", "Take photo"\n- Controls: "Dark mode", "Light mode", "Clear chat", "Stop speaking", "Pause speaking", "Resume speaking"`;
  }

  // Return null if no built-in system command match -> forward query to Gemini AI
  return null;
}

