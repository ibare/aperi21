import type { PrimitiveRenderer, Readout } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor } from '../common';
import { LINE_HEIGHT, drawChip } from '../kit/draw';
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
 *
 * 문안에 줄바꿈(`\n`)이 있으면 여러 줄로 쌓는다. 글자 크기는 **가장 긴 줄**에 맞추고,
 * 아래 모서리에 붙은 것은 위로 쌓는다 — 마지막 줄이 앵커에 닿는다.
 */
export const renderReadout: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Readout;
  const text = resolveText(rc, p.text, p.vars);
  if (!text) return;

  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'muted', emphasis: 'strong' });
  const fontSize = p.fontSize ?? DEFAULT_FONT_SIZE;
  const lines = text.split('\n');

  if ('world' in p.anchor) {
    const [wx, wy] = rc.toScreen(p.anchor.world);
    const [dx, dy] = p.anchor.offset ?? [0, 0];
    const x = wx + dx;
    const y = wy + dy;
    if (p.chip ?? true) {
      drawChip(rc, x, y, text, fontSize, color);
    } else {
      const lineH = fontSize * LINE_HEIGHT;
      c.font = `${fontSize}px ${rc.theme.fontFamilyMono}`;
      c.fillStyle = color;
      c.textAlign = p.align ?? 'center';
      c.textBaseline = 'middle';
      // 가운데 정렬 — 여러 줄이면 앵커를 중심으로 위아래로 벌어진다.
      const top = y - (lineH * (lines.length - 1)) / 2;
      lines.forEach((line, i) => c.fillText(line, x, top + lineH * i));
    }
    finalizeBaseMeta(rc, p);
    return;
  }

  const [ox, oy] = p.anchor.offset ?? [0, 0];
  const right = p.anchor.screen.endsWith('right');
  const center = p.anchor.screen.endsWith('center');
  const bottom = p.anchor.screen.startsWith('bottom');
  const x = center
    ? rc.viewport.width / 2 + ox
    : right
      ? rc.viewport.width - SCREEN_MARGIN + ox
      : SCREEN_MARGIN + ox;
  const y = bottom ? rc.viewport.height - SCREEN_MARGIN + oy : SCREEN_MARGIN + oy;

  // 가장 긴 줄로 맞춘다.
  const available = Math.max(1, rc.viewport.width - SCREEN_MARGIN * 2 - Math.abs(ox));
  const longest = lines.reduce(
    (a, b) => (rc.measure.textWidth(b, fontSize) > rc.measure.textWidth(a, fontSize) ? b : a),
    '',
  );
  const size = fitFontSize(rc, longest, available, fontSize, MIN_FONT_SIZE);
  const lineH = size * LINE_HEIGHT;

  c.font = `${size}px ${rc.theme.fontFamily}`;
  c.fillStyle = color;
  c.textAlign = p.align ?? (center ? 'center' : right ? 'right' : 'left');
  c.textBaseline = bottom ? 'bottom' : 'top';
  lines.forEach((line, i) => {
    // 아래 앵커는 위로 쌓는다 — 마지막 줄이 앵커에 닿는다.
    const ly = bottom ? y - lineH * (lines.length - 1 - i) : y + lineH * i;
    c.fillText(line, x, ly);
  });

  finalizeBaseMeta(rc, p);
};
