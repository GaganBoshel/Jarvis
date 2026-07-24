/**
 * JARVIS AI v2 - Optical Webcam & Vision Subsystem
 */

import { playAudioFx, showToast } from "./utils.js";

export class WebcamEngine {
  constructor(videoElementId, canvasElementId) {
    this.videoEl = document.getElementById(videoElementId);
    this.canvasEl = document.getElementById(canvasElementId);
    this.stream = null;
    this.isActive = false;
  }

  async startCamera() {
    if (!this.videoEl) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      this.videoEl.srcObject = this.stream;
      await this.videoEl.play();
      this.isActive = true;
      playAudioFx("scan");
      showToast("Optical camera feed ONLINE", "success");
    } catch (err) {
      console.error("Webcam Access Error:", err);
      showToast("Camera access denied or unavailable: " + err.message, "error");
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoEl) {
      this.videoEl.srcObject = null;
    }
    this.isActive = false;
    showToast("Optical camera offline", "info");
  }

  captureFrame() {
    if (!this.isActive || !this.videoEl || !this.canvasEl) {
      showToast("Camera is not active.", "error");
      return null;
    }

    const video = this.videoEl;
    const canvas = this.canvasEl;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw futuristic HUD overlay on photo
    ctx.strokeStyle = "rgba(0, 243, 255, 0.8)";
    ctx.lineWidth = 4;
    // Corners
    const cl = 40;
    // Top Left
    ctx.beginPath();
    ctx.moveTo(20, 20 + cl);
    ctx.lineTo(20, 20);
    ctx.lineTo(20 + cl, 20);
    ctx.stroke();
    // Top Right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20 - cl, 20);
    ctx.lineTo(canvas.width - 20, 20);
    ctx.lineTo(canvas.width - 20, 20 + cl);
    ctx.stroke();

    ctx.fillStyle = "rgba(0, 243, 255, 0.9)";
    ctx.font = "16px monospace";
    ctx.fillText(`J.A.R.V.I.S. VISION - SCAN TIMECODE: ${new Date().toISOString()}`, 30, canvas.height - 30);

    playAudioFx("click");
    return canvas.toDataURL("image/jpeg", 0.85);
  }
}
