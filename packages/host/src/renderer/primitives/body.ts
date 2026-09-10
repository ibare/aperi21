import type { Body, PrimitiveRenderer } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';

/**
 * Body 렌더러. Phase 2 MVP 는 circle / point / rect / rod 만 지원.
 * emphasis === 'strong' 은 radial glow 추가.
 */
export const renderBody: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Body;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const [sx, sy] = rc.toScreen(p.pos);
  const color = primitiveColor(rc, p, { role: 'primary', emphasis: 'strong' });
  const size = typeof p.size === 'number' ? p.size : 0.2;
  const radius = Math.max(2, size * rc.scale);

  if (p.shape === 'point') {
    c.fillStyle = color;
    c.beginPath();
    c.arc(sx, sy, 3, 0, Math.PI * 2);
    c.fill();
  } else if (p.shape === 'rect' || p.shape === 'rod') {
    const w =
      Array.isArray(p.size) ? p.size[0]! * rc.scale : radius * 2;
    const h =
      Array.isArray(p.size) ? p.size[1]! * rc.scale : radius;
    c.save();
    c.translate(sx, sy);
    if (p.orientation) c.rotate(-p.orientation);
    c.fillStyle = color;
    c.fillRect(-w / 2, -h / 2, w, h);
    c.strokeStyle = rc.theme.line;
    c.lineWidth = 1;
    c.strokeRect(-w / 2, -h / 2, w, h);
    c.restore();
  } else {
    // circle / disc / default
    if (((p as Body).style?.emphasis ?? 'strong') === 'strong') {
      const glow = c.createRadialGradient(sx, sy, radius * 0.3, sx, sy, radius * 3);
      glow.addColorStop(0, color);
      glow.addColorStop(1, 'transparent');
      c.save();
      setAlpha(c, 0.35);
      c.fillStyle = glow;
      c.beginPath();
      c.arc(sx, sy, radius * 3, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    c.fillStyle = color;
    c.beginPath();
    c.arc(sx, sy, radius, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = rc.theme.line;
    c.lineWidth = 1;
    c.stroke();
  }

  if (p.label) {
    c.font = `11px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = rc.theme.muted;
    c.textAlign = 'center';
    c.fillText(rc.i18n.resolve(p.label), sx, sy + radius + 14);
  }

  finalizeBaseMeta(rc, p);
};
