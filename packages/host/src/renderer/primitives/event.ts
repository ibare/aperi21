import type { Event_, PrimitiveRenderer } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor } from '../common';

/**
 * Event 렌더러. 시간 의존: progress = (time - startedAt)/duration, 0..1.
 * kind==='flash' 는 원형 블룸 (반경 증가 + 알파 감소). duration 지나면 스킵.
 */
export const renderEvent: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Event_;
  const progress = (rc.time - p.startedAt) / p.duration;
  if (progress < 0 || progress > 1) return;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const [sx, sy] = rc.toScreen(p.pos);
  const color = primitiveColor(rc, p, { role: 'accent', emphasis: 'strong' });
  const intensity = p.intensity ?? 1;

  if (p.kind === 'flash' || p.kind === 'pulse') {
    const radius = (10 + progress * 40) * intensity;
    c.globalAlpha = Math.max(0, 1 - progress);
    c.fillStyle = color;
    c.beginPath();
    c.arc(sx, sy, radius, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;
  } else if (p.kind === 'burst') {
    const spokes = 8;
    const r1 = 8 + progress * 28;
    const r0 = progress * 12;
    c.globalAlpha = Math.max(0, 1 - progress);
    c.strokeStyle = color;
    c.lineWidth = 2;
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      c.beginPath();
      c.moveTo(sx + cos * r0, sy + sin * r0);
      c.lineTo(sx + cos * r1, sy + sin * r1);
      c.stroke();
    }
    c.globalAlpha = 1;
  }

  finalizeBaseMeta(rc, p);
};
