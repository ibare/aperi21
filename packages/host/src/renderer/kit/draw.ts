/**
 * 그리기 재료 — 프리미티브 구현이 쓴다. 조각은 이것을 모른다.
 *
 * `tasks/engine-requirements/REQUIREMENTS.md` §4.2.
 */

import type { RenderContext, Vec2 } from '@aperi21/schema';
import { setAlpha } from '../common';

/** 값 칩의 치수. 코드에 남는 기본값은 named 상수로 한 곳에 둔다 (C2). */
export const CHIP = {
  paddingX: 6,
  paddingY: 3,
  backgroundAlpha: 0.85,
} as const;

/** 여러 줄 글의 줄 높이 — 글자 크기의 배수. */
export const LINE_HEIGHT = 1.4;

/**
 * 배경을 깐 값 칩. 그림 위에서도 읽힌다. `text` 에 줄바꿈이 있으면 여러 줄로 쌓고
 * 칩은 가장 긴 줄에 맞춘다. 가운데(centerX, centerY)를 기준으로 위아래로 벌어진다.
 *
 * `font` 는 캔버스 font 문자열 전체다. 생략하면 그 크기의 모노 글꼴 — 값 칩의 기본.
 */
export function drawChip(
  rc: RenderContext,
  centerX: number,
  centerY: number,
  text: string,
  fontSize: number,
  color: string,
  font: string = `${fontSize}px ${rc.theme.fontFamilyMono}`,
): { width: number; height: number } {
  const c = rc.ctx;
  const lines = text.split('\n');
  const lineH = fontSize * LINE_HEIGHT;
  const textW = Math.max(...lines.map((l) => rc.measure.textWidth(l, fontSize)));
  const width = textW + CHIP.paddingX * 2;
  const height = lineH * lines.length + CHIP.paddingY * 2;
  const x = centerX - width / 2;
  const y = centerY - height / 2;

  setAlpha(c, CHIP.backgroundAlpha);
  c.fillStyle = rc.theme.background;
  c.fillRect(x, y, width, height);
  setAlpha(c, 1);
  c.strokeStyle = rc.theme.line;
  c.lineWidth = rc.theme.strokeWidth.thin;
  c.strokeRect(x, y, width, height);

  c.font = font;
  c.fillStyle = color;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  lines.forEach((line, i) => {
    c.fillText(line, centerX, y + CHIP.paddingY + lineH * (i + 0.5));
  });

  return { width, height };
}

/** 월드 좌표 다각형을 화면 경로로. `close` 면 닫는다. */
export function polygonPath(rc: RenderContext, points: readonly Vec2[], close = true): void {
  const c = rc.ctx;
  c.beginPath();
  points.forEach((p, i) => {
    const [x, y] = rc.toScreen(p);
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  });
  if (close) c.closePath();
}

/**
 * 속도 잔상 획.
 *
 * 점 하나로 그리면 정지 프레임에서 빠른 것과 느린 것이 구별되지 않는다. 직전
 * 자리까지 획을 그으면 **속도가 획의 길이로** 드러난다 — 숫자나 색을 쓰지 않고.
 */
export function streak(
  rc: RenderContext,
  from: Vec2,
  to: Vec2,
  width: number,
  color: string,
  alpha = 1,
): void {
  const c = rc.ctx;
  const [x0, y0] = rc.toScreen(from);
  const [x1, y1] = rc.toScreen(to);
  setAlpha(c, alpha);
  c.strokeStyle = color;
  c.lineWidth = Math.max(0.5, width);
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x0, y0);
  c.lineTo(x1, y1);
  c.stroke();
  setAlpha(c, 1);
}
