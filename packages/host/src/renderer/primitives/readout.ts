import type { PrimitiveRenderer, Readout } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor } from '../common';
import { drawChip } from '../kit/draw';
import { fitFontSize, resolveText } from '../kit/text';

/** 화면 고정 앵커의 기본 여백(px). 코드에 남는 기본값은 한 곳에 (C2). */
const SCREEN_MARGIN = 24;
const DEFAULT_FONT_SIZE = 11;
const MIN_FONT_SIZE = 8;

/**
 * 값 하나를 읽히게 두는 것.
 *
 * 월드에 붙는 것은 칩을 깔아 그림 위에서도 읽히게 하고, 화면에 고정된 것은
 * 넘칠 때 **자리를 넓히는 대신 글자를 줄인다** — 임베드 높이는 마운트 뒤
 * 바뀌지 않으므로 줄바꿈으로 밀어낼 수 없다 (원칙 6).
 */
export const renderReadout: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Readout;
  const text = resolveText(rc, p.text, p.vars);
  if (!text) return;

  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'muted', emphasis: 'strong' });
  const fontSize = p.fontSize ?? DEFAULT_FONT_SIZE;

  if ('world' in p.anchor) {
    const [wx, wy] = rc.toScreen(p.anchor.world);
    const [dx, dy] = p.anchor.offset ?? [0, 0];
    const x = wx + dx;
    const y = wy + dy;
    if (p.chip ?? true) {
      drawChip(rc, x, y, text, fontSize, color);
    } else {
      c.font = `${fontSize}px ${rc.theme.fontFamilyMono}`;
      c.fillStyle = color;
      c.textAlign = p.align ?? 'center';
      c.textBaseline = 'middle';
      c.fillText(text, x, y);
    }
    finalizeBaseMeta(rc, p);
    return;
  }

  const [ox, oy] = p.anchor.offset ?? [0, 0];
  const right = p.anchor.screen.endsWith('right');
  const bottom = p.anchor.screen.startsWith('bottom');
  const x = right ? rc.viewport.width - SCREEN_MARGIN + ox : SCREEN_MARGIN + ox;
  const y = bottom ? rc.viewport.height - SCREEN_MARGIN + oy : SCREEN_MARGIN + oy;

  const available = Math.max(1, rc.viewport.width - SCREEN_MARGIN * 2 - Math.abs(ox));
  const size = fitFontSize(rc, text, available, fontSize, MIN_FONT_SIZE);

  c.font = `${size}px ${rc.theme.fontFamily}`;
  c.fillStyle = color;
  c.textAlign = p.align ?? (right ? 'right' : 'left');
  c.textBaseline = bottom ? 'bottom' : 'top';
  c.fillText(text, x, y);

  finalizeBaseMeta(rc, p);
};
