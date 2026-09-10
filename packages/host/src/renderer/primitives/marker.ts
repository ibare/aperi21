import type { Marker, PrimitiveRenderer } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';

/**
 * Marker 렌더러. Phase 2 는 kind === 'label' 을 중심으로 처리. 다른 kind 는
 * 일단 텍스트만 그리고, 필요하면 Phase 3+ 에서 확장.
 */
export const renderMarker: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Marker;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const [sx, sy] = rc.toScreen(p.pos);
  const text = p.text ? rc.i18n.resolve(p.text) : '';
  const color = primitiveColor(rc, p, { role: 'muted', emphasis: 'medium' });

  if (p.kind === 'label' && text) {
    c.font = `600 11px ${rc.theme.fontFamilyMono}`;
    const tw = rc.measure.textWidth(text, 11);
    const pad = 6;
    const w = tw + pad * 2;
    const h = 18;
    c.fillStyle = rc.theme.background;
    setAlpha(c, 0.85);
    c.fillRect(sx - w / 2, sy - h - 4, w, h);
    setAlpha(c, 1);
    c.strokeStyle = rc.theme.line;
    c.lineWidth = 1;
    c.strokeRect(sx - w / 2, sy - h - 4, w, h);
    c.fillStyle = color;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(text, sx, sy - h / 2 - 4);
  } else if (p.kind === 'pin') {
    c.fillStyle = color;
    c.beginPath();
    c.arc(sx, sy, 4, 0, Math.PI * 2);
    c.fill();
    if (text) {
      c.font = `10px ${rc.theme.fontFamilyMono}`;
      c.fillStyle = rc.theme.muted;
      c.textAlign = 'left';
      c.fillText(text, sx + 8, sy + 4);
    }
  } else if (text) {
    c.font = `10px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = color;
    c.textAlign = 'left';
    c.textBaseline = 'top';
    c.fillText(text, sx + 4, sy + 4);
  }

  finalizeBaseMeta(rc, p);
};
