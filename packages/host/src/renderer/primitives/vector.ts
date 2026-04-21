import type { PrimitiveRenderer, Vec2, Vector } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor } from '../common';

/**
 * Vector 렌더러. 본체 라인 + 화살촉 삼각형. len < 2px 스킵.
 * label 있으면 시작점에서 40% 지점에 배치. showMagnitude 는 중점에 |delta| 표시.
 */
export const renderVector: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Vector;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const to: Vec2 = [p.from[0] + p.delta[0], p.from[1] + p.delta[1]];
  const [sx0, sy0] = rc.toScreen(p.from);
  const [sx1, sy1] = rc.toScreen(to);
  const dx = sx1 - sx0;
  const dy = sy1 - sy0;
  const len = Math.hypot(dx, dy);
  if (len < 2) {
    finalizeBaseMeta(rc, p);
    return;
  }
  const color = primitiveColor(rc, p, { role: 'accent', emphasis: 'medium' });
  const ux = dx / len;
  const uy = dy / len;

  c.strokeStyle = color;
  c.fillStyle = color;
  c.lineWidth = 2;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(sx0, sy0);
  // 화살촉 공간 남기기
  const headSize = typeof p.headSize === 'number' ? p.headSize * rc.scale : 8;
  const tipX = sx1 - ux * headSize * 0.4;
  const tipY = sy1 - uy * headSize * 0.4;
  c.lineTo(tipX, tipY);
  c.stroke();

  // 화살촉
  c.beginPath();
  c.moveTo(sx1, sy1);
  c.lineTo(sx1 - ux * headSize - uy * headSize * 0.5, sy1 - uy * headSize + ux * headSize * 0.5);
  c.lineTo(sx1 - ux * headSize + uy * headSize * 0.5, sy1 - uy * headSize - ux * headSize * 0.5);
  c.closePath();
  c.fill();

  if (p.label) {
    c.font = `600 11px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = color;
    c.textAlign = 'left';
    const lx = sx0 + ux * len * 0.4 + 6;
    const ly = sy0 + uy * len * 0.4 - 4;
    c.fillText(rc.i18n.resolve(p.label), lx, ly);
  }

  if (p.showMagnitude) {
    const mag = Math.hypot(p.delta[0], p.delta[1]);
    c.font = `10px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = rc.theme.muted;
    c.fillText(mag.toFixed(1), (sx0 + sx1) / 2 + 6, (sy0 + sy1) / 2 + 4);
  }

  finalizeBaseMeta(rc, p);
};
