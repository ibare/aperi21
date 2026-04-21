import type { HostTheme } from '../theme/types';
import type { Viewport } from '../camera';

export type BackgroundParticleKind = 'none' | 'rain' | 'stars-dense' | 'stars-sparse';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
}

/**
 * Canvas 에 직접 그리는 배경 입자. Scene Graph 와 무관하며 env/stage 변화에
 * 따라 kind 만 바뀐다. Camera 와 독립 (스크린 좌표).
 */
export class BackgroundParticleSystem {
  private kind: BackgroundParticleKind = 'none';
  private particles: Particle[] = [];
  private lastViewport: Viewport = { width: 0, height: 0 };

  setKind(kind: BackgroundParticleKind, viewport: Viewport): void {
    if (this.kind === kind && this.lastViewport.width === viewport.width && this.lastViewport.height === viewport.height) {
      return;
    }
    this.kind = kind;
    this.lastViewport = viewport;
    this.rebuild(viewport);
  }

  update(dt: number, viewport: Viewport): void {
    if (this.kind === 'none') return;
    if (viewport.width !== this.lastViewport.width || viewport.height !== this.lastViewport.height) {
      this.lastViewport = viewport;
      this.rebuild(viewport);
      return;
    }
    if (this.kind === 'rain') {
      for (const p of this.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y > viewport.height + 10) {
          p.y = -10;
          p.x = Math.random() * viewport.width;
        }
      }
    } else {
      // 별은 반짝임만. twinkle
      for (const p of this.particles) {
        p.life += dt;
        p.alpha = 0.4 + 0.4 * Math.sin(p.life * 2 + p.x * 0.1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, theme: HostTheme): void {
    if (this.kind === 'none' || this.particles.length === 0) return;
    ctx.save();
    if (this.kind === 'rain') {
      ctx.strokeStyle = theme.resolveColor('secondary', 'subtle');
      ctx.lineWidth = 1;
      for (const p of this.particles) {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 0.03, p.y + p.vy * 0.03);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = theme.foreground;
      for (const p of this.particles) {
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    }
    ctx.restore();
  }

  private rebuild(viewport: Viewport): void {
    this.particles = [];
    if (this.kind === 'none') return;
    const area = viewport.width * viewport.height;
    if (this.kind === 'rain') {
      const count = Math.min(180, Math.floor(area / 6000));
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * viewport.width,
          y: Math.random() * viewport.height,
          vx: -60 + Math.random() * 20,
          vy: 380 + Math.random() * 180,
          size: 1,
          alpha: 0.4 + Math.random() * 0.4,
          life: 0,
        });
      }
    } else if (this.kind === 'stars-dense') {
      const count = Math.min(260, Math.floor(area / 2800));
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * viewport.width,
          y: Math.random() * viewport.height,
          vx: 0,
          vy: 0,
          size: Math.random() > 0.85 ? 2 : 1,
          alpha: 0.3 + Math.random() * 0.6,
          life: Math.random() * Math.PI * 2,
        });
      }
    } else if (this.kind === 'stars-sparse') {
      const count = Math.min(80, Math.floor(area / 12000));
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * viewport.width,
          y: Math.random() * viewport.height,
          vx: 0,
          vy: 0,
          size: 1,
          alpha: 0.25 + Math.random() * 0.4,
          life: Math.random() * Math.PI * 2,
        });
      }
    }
  }
}
