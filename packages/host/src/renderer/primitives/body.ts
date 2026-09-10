import type { Body, PrimitiveRenderer } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';

/**
 * Body 렌더러. circle / point / rect / rod / custom.
 *
 * circle 의 둘레 번짐은 `glow` 가 정한다. 생략하면 `emphasis: 'strong'` 일 때 켜진다.
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
  } else if (p.shape === 'custom') {
    // 외형은 pos 기준 월드 단위, y 위. 화면으로는 배율을 곱하고 y 를 뒤집는다.
    // Path2D 는 매 프레임 새로 만든다 — 모듈에 캐시하면 인스턴스끼리 섞인다 (C5).
    if (p.customPath) {
      c.save();
      c.translate(sx, sy);
      if (p.orientation) c.rotate(-p.orientation);
      c.scale(rc.scale, -rc.scale);
      c.fillStyle = color;
      c.fill(new Path2D(p.customPath));
      c.restore();
    }
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
    if (p.glow ?? (p.style?.emphasis ?? 'strong') === 'strong') {
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
