import type { PrimitiveRenderer, Surface } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta } from '../common';

/**
 * Surface 렌더러. Phase 2 는 ground / incline 만 지원.
 * - ground: 지평선 + 아래쪽 반투명 fill
 * - incline: 원점에서 각도로 뻗는 선 + 하단 삼각형 fill (rough 는 해칭)
 */
export const renderSurface: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Surface;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const g = p.geometry;
  const line = rc.theme.foreground;
  const fill = rc.theme.muted;

  if (g.kind === 'ground') {
    const y = typeof g.y === 'number' ? g.y : 0;
    const [x0s, ys] = rc.toScreen([-1000, y]);
    const [x1s] = rc.toScreen([1000, y]);
    c.strokeStyle = line;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(x0s, ys);
    c.lineTo(x1s, ys);
    c.stroke();

    c.fillStyle = fill;
    c.globalAlpha = 0.15;
    c.fillRect(0, ys, rc.viewport.width, rc.viewport.height - ys);
    c.globalAlpha = 1;
  } else if (g.kind === 'incline') {
    const [ox, oy] = rc.toScreen(g.origin);
    const length = typeof g.length === 'number' ? g.length : 4;
    const rad = -g.angle; // 수학 방향
    const tx = ox + Math.cos(rad) * length * rc.scale;
    const ty = oy - Math.sin(-g.angle) * length * rc.scale;
    // 삼각형 채움
    c.fillStyle = fill;
    c.globalAlpha = 0.2;
    c.beginPath();
    c.moveTo(ox, oy);
    c.lineTo(tx, ty);
    c.lineTo(tx, oy);
    c.closePath();
    c.fill();
    c.globalAlpha = 1;
    c.strokeStyle = line;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(ox, oy);
    c.lineTo(tx, ty);
    c.stroke();
  } else if (g.kind === 'wall') {
    const [x0s, y0s] = rc.toScreen(g.from);
    const [x1s, y1s] = rc.toScreen(g.to);
    c.strokeStyle = line;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(x0s, y0s);
    c.lineTo(x1s, y1s);
    c.stroke();
  }

  finalizeBaseMeta(rc, p);
};
