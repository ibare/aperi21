import type { PrimitiveRenderer, Readout, RenderContext } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor } from '../common';
import { LINE_HEIGHT, drawChip } from '../kit/draw';
import { fitFontSize, resolveText } from '../kit/text';

/** 화면 고정 앵커의 기본 여백(px). 코드에 남는 기본값은 한 곳에 (C2). */
const SCREEN_MARGIN = 24;
const MIN_FONT_SIZE = 8;
/** `weight: 'bold'` 의 실제 굵기. 700 은 작은 글자에서 뭉친다. */
const BOLD_WEIGHT = 600;

/** 선언의 글꼴 · 기울임 · 굵기를 캔버스 font 문자열로. */
function fontOf(rc: RenderContext, p: Readout, fallback: 'text' | 'mono', size: number): string {
  const family = (p.font ?? fallback) === 'mono' ? rc.theme.fontFamilyMono : rc.theme.fontFamily;
  const style = p.italic ? 'italic ' : '';
  const weight = p.weight === 'bold' ? `${BOLD_WEIGHT} ` : '';
  return `${style}${weight}${size}px ${family}`;
}

/** 여러 줄 중 가장 긴 줄. 글자 크기는 이 줄에 맞춘다. */
function longestLine(rc: RenderContext, lines: readonly string[], size: number): string {
  return lines.reduce(
    (a, b) => (rc.measure.textWidth(b, size) > rc.measure.textWidth(a, size) ? b : a),
    '',
  );
}

/**
 * 값 하나를 읽히게 두는 것.
 *
 * 월드에 붙는 것은 칩을 깔아 그림 위에서도 읽히게 하고, 칩 없는 글과 화면에 고정된
 * 것은 넘칠 때 **자리를 넓히는 대신 글자를 줄인다** — 임베드 높이는 마운트 뒤
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
  const fontSize = p.fontSize ?? rc.theme.fontSize.regular;
  const lines = text.split('\n');

  if ('world' in p.anchor) {
    const [wx, wy] = rc.toScreen(p.anchor.world);
    const [dx, dy] = p.anchor.offset ?? [0, 0];
    const x = wx + dx;
    const y = wy + dy;
    if (p.chip ?? true) {
      drawChip(rc, x, y, text, fontSize, color, fontOf(rc, p, 'mono', fontSize));
    } else {
      const align = p.align ?? 'center';
      // 정렬에 따라 뷰포트 안에 남은 폭. 원 옆 캡션처럼 긴 문장이 캔버스 밖으로 새지 않게.
      const room =
        align === 'left'
          ? rc.viewport.width - SCREEN_MARGIN - x
          : align === 'right'
            ? x - SCREEN_MARGIN
            : 2 * Math.min(x - SCREEN_MARGIN, rc.viewport.width - SCREEN_MARGIN - x);
      const size = fitFontSize(rc, longestLine(rc, lines, fontSize), Math.max(1, room), fontSize, MIN_FONT_SIZE);
      const lineH = size * LINE_HEIGHT;
      c.font = fontOf(rc, p, 'mono', size);
      c.fillStyle = color;
      c.textAlign = align;
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

  const available = Math.max(1, rc.viewport.width - SCREEN_MARGIN * 2 - Math.abs(ox));
  const size = fitFontSize(rc, longestLine(rc, lines, fontSize), available, fontSize, MIN_FONT_SIZE);
  const lineH = size * LINE_HEIGHT;

  c.font = fontOf(rc, p, 'text', size);
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
