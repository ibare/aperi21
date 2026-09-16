import type { PrimitiveRenderer, Readout, RenderContext } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor } from '../common';
import { CHIP, LINE_HEIGHT, drawChip } from '../kit/draw';
import { fitFontSize, resolveText } from '../kit/text';

/** 화면 고정 앵커의 기본 여백(px). 코드에 남는 기본값은 한 곳에 (C2). */
const SCREEN_MARGIN = 24;
const MIN_FONT_SIZE = 8;
/** `weight: 'bold'` 의 실제 굵기. 700 은 작은 글자에서 뭉친다. */
const BOLD_WEIGHT = 600;
/**
 * 안으로 당길 때 가장자리에 남기는 틈(px). 화면 고정 여백보다 좁다 — 월드에 붙은
 * 값은 당겨질수록 가리키던 자리와 멀어지므로 최소한만 민다.
 */
const CLAMP_INSET = 4;
/**
 * 줄 첫머리에 올 수 없는 글자 (금칙 처리). **화면에 새로 만들어 내는 문안이 아니라
 * 판정용 글자 집합**이라 C1 의 대상이 아니다 — 여기 있는 글자는 그려지지 않는다.
 */
const NO_LINE_START = '.,!?)]}>」』…:;%·\'"';

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
 * 한 문단을 주어진 폭 안에서 줄로 나눈다.
 *
 * **한국어는 공백만으로 끊을 수 없다.** 한국어에 띄어쓰기가 있긴 하나 조사가 붙은
 * 어절은 길고(「가속도까지도」), 숫자·단위·기호가 붙으면 어절 하나가 폭을 통째로
 * 넘긴다. 그렇다고 처음부터 음절마다 끊으면 어절 한가운데가 갈려 읽는 속도가 떨어진다.
 * 그래서 두 단계로 나눈다 — **어절(공백) 우선, 그 어절이 한 줄에 안 들어갈 때만
 * 음절 단위**로. 한글 음절은 낱자마다 폭이 같은 네모라 어디서 끊어도 글자가 깨지지
 * 않고, CJK 조판이 오래 쓴 규칙이기도 하다(UAX #14 의 ID 부류).
 *
 * 음절로 끊을 때는 문장부호가 줄 첫머리에 서지 않게 앞 줄에 붙여 둔다 — 마침표만
 * 홀로 내려온 줄은 잘린 것처럼 읽힌다.
 */
function wrapParagraph(
  rc: RenderContext,
  paragraph: string,
  size: number,
  maxWidth: number,
): string[] {
  if (rc.measure.textWidth(paragraph, size) <= maxWidth) return [paragraph];
  const out: string[] = [];
  let line = '';
  const flush = (): void => {
    if (line) out.push(line);
    line = '';
  };
  for (const word of paragraph.split(/\s+/).filter((w) => w.length > 0)) {
    const joined = line ? `${line} ${word}` : word;
    if (rc.measure.textWidth(joined, size) <= maxWidth) {
      line = joined;
      continue;
    }
    if (rc.measure.textWidth(word, size) > maxWidth) {
      // 어절 하나가 폭을 넘는다 — 여기서만 음절로 내려간다.
      flush();
      for (const ch of word) {
        const next = line + ch;
        const overflows = line !== '' && rc.measure.textWidth(next, size) > maxWidth;
        if (overflows && !NO_LINE_START.includes(ch)) {
          out.push(line);
          line = ch;
        } else {
          line = next;
        }
      }
      continue;
    }
    flush();
    line = word;
  }
  flush();
  return out.length > 0 ? out : [''];
}

/** 선언의 문안을 줄로. `wrapWidth` 가 있으면 그 폭 안에서 나눈다. */
function linesOf(rc: RenderContext, p: Readout, text: string, size: number): string[] {
  const paragraphs = text.split('\n');
  const width = p.wrapWidth;
  if (typeof width !== 'number' || width <= 0) return paragraphs;
  return paragraphs.flatMap((para) => wrapParagraph(rc, para, size, width));
}

interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** 정렬·기준선을 감안한 글 덩이의 화면 사각형. */
function boxAt(
  x: number,
  y: number,
  width: number,
  height: number,
  align: CanvasTextAlign,
  vAlign: 'top' | 'middle' | 'bottom',
): Box {
  const left = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;
  const top = vAlign === 'middle' ? y - height / 2 : vAlign === 'bottom' ? y - height : y;
  return { left, right: left + width, top, bottom: top + height };
}

/**
 * 뷰포트 밖으로 나간 만큼 되미는 거리.
 *
 * 애초에 들어갈 수 없는 크기면 밀지 않는다 — 밀어 봐야 여전히 잘리고 가리키던
 * 자리와 어긋나기만 한다. 그 경우의 판단은 `hideWhenClipped` 의 몫이다.
 */
function clampShift(box: Box, viewport: { width: number; height: number }): [number, number] {
  const axis = (lo: number, hi: number, limit: number): number => {
    if (hi - lo > limit - CLAMP_INSET * 2) return 0;
    if (lo < CLAMP_INSET) return CLAMP_INSET - lo;
    if (hi > limit - CLAMP_INSET) return limit - CLAMP_INSET - hi;
    return 0;
  };
  return [
    axis(box.left, box.right, viewport.width),
    axis(box.top, box.bottom, viewport.height),
  ];
}

/** 한 조각이라도 뷰포트 밖이면 참. */
function isClipped(box: Box, viewport: { width: number; height: number }): boolean {
  return box.left < 0 || box.top < 0 || box.right > viewport.width || box.bottom > viewport.height;
}

/** 옮긴 앵커와 그려도 되는지의 판정. `clamp` · `hideWhenClipped` 를 한자리에서 본다. */
function placed(
  rc: RenderContext,
  p: Readout,
  x: number,
  y: number,
  width: number,
  height: number,
  align: CanvasTextAlign,
  vAlign: 'top' | 'middle' | 'bottom',
): { x: number; y: number; draw: boolean } {
  let box = boxAt(x, y, width, height, align, vAlign);
  let px = x;
  let py = y;
  if (p.clamp) {
    const [dx, dy] = clampShift(box, rc.viewport);
    px += dx;
    py += dy;
    box = boxAt(px, py, width, height, align, vAlign);
  }
  return { x: px, y: py, draw: !(p.hideWhenClipped && isClipped(box, rc.viewport)) };
}

/**
 * 값 하나를 읽히게 두는 것.
 *
 * 월드에 붙는 것은 칩을 깔아 그림 위에서도 읽히게 하고, 칩 없는 글과 화면에 고정된
 * 것은 넘칠 때 **자리를 넓히는 대신 글자를 줄인다** — 임베드 높이는 마운트 뒤
 * 바뀌지 않으므로 줄바꿈으로 밀어낼 수 없다 (원칙 6).
 *
 * 문안에 줄바꿈(`\n`)이 있으면 여러 줄로 쌓는다. `wrapWidth` 를 주면 그 폭에서 스스로
 * 나눈다 — 세로가 싼 배치가 남는 가로를 문장에 내주는 자리다. 글자 크기는 **가장 긴
 * 줄**에 맞추고, 아래 모서리에 붙은 것은 위로 쌓는다 — 마지막 줄이 앵커에 닿는다.
 */
export const renderReadout: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Readout;
  const text = resolveText(rc, p.text, p.vars);
  if (!text) return;

  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'muted', emphasis: 'strong' });
  const fontSize = p.fontSize ?? rc.theme.fontSize.regular;
  const lines = linesOf(rc, p, text, fontSize);

  if ('world' in p.anchor) {
    const [wx, wy] = rc.toScreen(p.anchor.world);
    const [dx, dy] = p.anchor.offset ?? [0, 0];
    const x = wx + dx;
    const y = wy + dy;
    if (p.chip ?? true) {
      const body = lines.join('\n');
      const chipW = rc.measure.textWidth(longestLine(rc, lines, fontSize), fontSize) + CHIP.paddingX * 2;
      const chipH = fontSize * LINE_HEIGHT * lines.length + CHIP.paddingY * 2;
      const at = placed(rc, p, x, y, chipW, chipH, 'center', 'middle');
      if (at.draw) {
        drawChip(rc, at.x, at.y, body, fontSize, color, fontOf(rc, p, 'mono', fontSize));
      }
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
      const blockW = rc.measure.textWidth(longestLine(rc, lines, size), size);
      const blockH = lineH * (lines.length - 1) + size;
      const at = placed(rc, p, x, y, blockW, blockH, align, 'middle');
      if (at.draw) {
        c.font = fontOf(rc, p, 'mono', size);
        c.fillStyle = color;
        c.textAlign = align;
        c.textBaseline = 'middle';
        // 가운데 정렬 — 여러 줄이면 앵커를 중심으로 위아래로 벌어진다.
        const top = at.y - (lineH * (lines.length - 1)) / 2;
        lines.forEach((line, i) => c.fillText(line, at.x, top + lineH * i));
      }
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
  const align: CanvasTextAlign = p.align ?? (center ? 'center' : right ? 'right' : 'left');
  const blockW = rc.measure.textWidth(longestLine(rc, lines, size), size);
  const blockH = lineH * (lines.length - 1) + size;
  const at = placed(rc, p, x, y, blockW, blockH, align, bottom ? 'bottom' : 'top');
  if (!at.draw) {
    finalizeBaseMeta(rc, p);
    return;
  }

  c.font = fontOf(rc, p, 'text', size);
  c.fillStyle = color;
  c.textAlign = align;
  c.textBaseline = bottom ? 'bottom' : 'top';
  lines.forEach((line, i) => {
    // 아래 앵커는 위로 쌓는다 — 마지막 줄이 앵커에 닿는다.
    const ly = bottom ? at.y - lineH * (lines.length - 1 - i) : at.y + lineH * i;
    c.fillText(line, at.x, ly);
  });

  finalizeBaseMeta(rc, p);
};
