/**
 * JARVIS AI v2 - Canvas Interactive Particle System & Radar Grid
 */

export class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.maxDistance = 120;
    this.mouse = { x: null, y: null, radius: 150 };
    this.color = "#00D1FF";
    this.secondaryColor = "#0077ff";
    this.resizeTimeout = null;
    this.isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.init();
    if (!this.isReducedMotion) {
      this.animate();
    }
    this.setupListeners();
  }

  setThemeColors(primaryHex, secondaryHex) {
    this.color = primaryHex || "#00D1FF";
    this.secondaryColor = secondaryHex || "#0077ff";
  }

  calculateParticleCount() {
    const width = window.innerWidth;
    if (width < 480) return 25;       // Low-power Mobile
    if (width < 768) return 40;       // Large Mobile / Phablet
    if (width < 1440) return 70;      // Laptop / Tablet
    if (width < 2560) return 100;     // Desktop / 2K
    return 130;                       // 4K / Ultrawide
  }

  init() {
    this.resize();
    this.numParticles = this.calculateParticleCount();
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.6 + 0.2
      });
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupListeners() {
    // Debounced window resize
    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.init();
      }, 150);
    });

    // Touch & Mouse interactions
    const handleMove = (x, y) => {
      this.mouse.x = x;
      this.mouse.y = y;
    };

    window.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener("mouseleave", () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
    window.addEventListener("touchend", () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // Reduced motion media query change detection
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", (e) => {
      this.isReducedMotion = e.matches;
      if (!this.isReducedMotion) {
        this.animate();
      }
    });
  }

  drawGrid() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.strokeStyle = "rgba(0, 243, 255, 0.03)";
    ctx.lineWidth = 1;

    const step = 60;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  animate() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    this.drawGrid();

    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;

      // Bounce off walls
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse interaction (push/pull effect)
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x -= (dx / dist) * force * 2;
          p.y -= (dy / dist) * force * 2;
        }
      }

      // Draw particle node
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Connect neighbor particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.maxDistance) {
          const lineAlpha = (1 - dist / this.maxDistance) * 0.25;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = this.color;
          ctx.globalAlpha = lineAlpha;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1.0;
    requestAnimationFrame(() => this.animate());
  }
}
