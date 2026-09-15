import type { Graph, PrimitiveRenderer } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, setAlpha } from '../common';

/**
 * Graph 렌더러. Phase 2 MVP 는 style==='bar' + placement==='screen-hud' 만.
 * placement==='world-inline' 은 Phase 3+. series 마다 하나의 bar 를 그린다.
 * 에너지 막대처럼 값을 견주는 그림은 `gauge` 를 쓴다. 이 어휘는 여러 계열을
 * 한 축에 놓아야 할 때를 위해 남긴다.
 */
export const renderGraph: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Graph;
  if (p.style !== 'bar') return;
  applyBaseMeta(rc, p);
  const c = rc.ctx;

  // HUD 우상단 고정 영역. 폭 220 × 높이 160.
  const w = 220;
  const h = 160;
  const x = rc.viewport.width - w - 24;
  const y = 24;

  // 배경 카드
  c.fillStyle = rc.theme.background;
  setAlpha(c, 0.8);
  c.fillRect(x, y, w, h);
  setAlpha(c, 1);
  c.strokeStyle = rc.theme.line;
  c.lineWidth = rc.theme.strokeWidth.thin;
  c.strokeRect(x, y, w, h);

  const pad = 12;
  const barsTop = y + pad + 8;
  const barsBottom = y + h - pad - 14;
  const count = p.series.length || 1;
  const barH = Math.min(18, (barsBottom - barsTop) / count - 6);

  const maxVal = Math.max(
    ...p.series.map((s) => Math.max(...s.data.map((d) => d.x))),
    p.reference?.value ?? 0,
    1,
  );
  const trackX = x + pad + 70;
  const trackW = x + w - pad - trackX;

  // series 렌더
  p.series.forEach((s, i) => {
    const by = barsTop + i * (barH + 6);
    // 라벨
    c.font = `${rc.theme.fontSize.small}px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = rc.theme.muted;
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    if (s.label) c.fillText(rc.i18n.resolve(s.label), x + pad, by + barH / 2);
    // track
    c.fillStyle = rc.theme.resolveColor('muted', 'subtle');
    c.fillRect(trackX, by, trackW, barH);
    // fill
    const val = s.data[0]?.x ?? 0;
    const pct = Math.max(0, Math.min(1, val / maxVal));
    const role = s.colorRole ?? 'primary';
    c.fillStyle = rc.theme.resolveColor(role, 'strong');
    c.fillRect(trackX, by, trackW * pct, barH);
    // value
    c.fillStyle = rc.theme.foreground;
    c.textAlign = 'right';
    c.fillText(val.toFixed(1), x + w - pad, by + barH / 2);
  });

  // reference line
  if (p.reference) {
    const refPct = Math.max(0, Math.min(1, p.reference.value / maxVal));
    const rx = trackX + trackW * refPct;
    c.strokeStyle = rc.theme.resolveColor('accent', 'strong');
    c.setLineDash([4, 3]);
    c.beginPath();
    c.moveTo(rx, barsTop - 4);
    c.lineTo(rx, barsBottom + 2);
    c.stroke();
    c.setLineDash([]);
  }

  // xAxis 라벨
  if (p.xAxis?.label) {
    c.font = `${rc.theme.fontSize.small}px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = rc.theme.muted;
    c.textAlign = 'center';
    c.fillText(
      rc.i18n.resolve(p.xAxis.label),
      x + w / 2,
      y + h - pad + 4,
    );
  }

  finalizeBaseMeta(rc, p);
};
