import type { Gauge, PrimitiveRenderer } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor } from '../common';

/**
 * Gauge 렌더러 — kind === 'linear' 만 MVP. 화면 좌상단에 수평 막대.
 * 여러 gauge 가 있으면 BaseMeta.id 의 해시로 대충 수직 슬롯을 정한다.
 */
export const renderGauge: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Gauge;
  if ((p.kind ?? 'linear') !== 'linear') return;
  applyBaseMeta(rc, p);
  const c = rc.ctx;

  const w = 180;
  const h = 14;
  const slot = slotFromId(p.id);
  const x = 24;
  const y = 24 + slot * 30;

  c.fillStyle = rc.theme.resolveColor('muted', 'subtle');
  c.fillRect(x, y, w, h);
  const [lo, hi] = p.range ?? [0, 1];
  const pct = Math.max(0, Math.min(1, (p.value - lo) / Math.max(1e-6, hi - lo)));
  c.fillStyle = primitiveColor(rc, p, { role: 'accent', emphasis: 'strong' });
  c.fillRect(x, y, w * pct, h);
  c.strokeStyle = rc.theme.line;
  c.lineWidth = 1;
  c.strokeRect(x, y, w, h);

  c.font = `10px ${rc.theme.fontFamilyMono}`;
  c.fillStyle = rc.theme.muted;
  c.textAlign = 'right';
  c.textBaseline = 'middle';
  const unit = p.unit ? rc.i18n.resolve(p.unit) : '';
  c.fillText(`${p.value.toFixed(2)} ${unit}`.trim(), x + w + 40, y + h / 2);
  if (p.label) {
    c.textAlign = 'left';
    c.fillText(rc.i18n.resolve(p.label), x, y - 4);
  }

  finalizeBaseMeta(rc, p);
};

function slotFromId(id?: string): number {
  if (!id) return 0;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % 4;
}
