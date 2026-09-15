/**
 * 칩 줄 — 고를 것들을 나란히 놓고 하나(또는 여럿)를 켠다.
 *
 * `view-tabs` · `stage-tabs` · `env-toggles` · `reset-buttons` 넷이 같은 모양을 쓴다.
 * 넷이 각자 그리면 같은 것이 네 모양으로 나온다 (원칙 4).
 *
 * **자리는 렌더가 내고 hitTest 는 그것을 본다.** 칩 폭은 글자 길이를 따라가는데
 * 이벤트 컨텍스트에는 글자를 재는 수단이 없다. 그래서 렌더가 낸 자리를 조작기
 * 인스턴스가 들고 있다가 hitTest 에 쓴다 — 인스턴스는 임베드마다 하나이므로
 * 이 기억이 다른 임베드로 새지 않는다 (C5).
 */

import type { Anchor, Vec2 } from '@aperi21/schema';
import type { Viewport } from '../camera';
import { placeBox, stackedAnchor, type ScreenAnchor } from './layout';
import type { UiTheme } from '../theme/types';
import type { ControllerRenderContext, PointerInput } from './types';

/**
 * 칩 줄이 쓰는 치수는 전부 UI 축의 토큰이다.
 *
 * 예전에는 이 파일에 `height: 22` 같은 숫자가 박혀 있었다. 그러면 테마를 갈아
 * 끼워도 조작기의 크기·간격은 그대로다 — 색만 바뀌고 모양은 코드에 남는다 (C2).
 */
function metrics(ui: UiTheme) {
  return {
    margin: ui.layout.margin,
    pad: ui.spacing.xs,
    gap: ui.spacing.xs,
    padX: ui.spacing.md,
    height: ui.layout.controlHeight,
    stackGap: ui.layout.stackGap,
    fontSize: ui.fontSize.regular,
    labelFontSize: ui.fontSize.small,
    labelGap: ui.spacing.sm,
  };
}

/** 고를 것 하나. */
export interface Chip {
  id: string;
  text: string;
  active: boolean;
}

/** 자리를 받은 칩. */
export interface ChipRect {
  id: string;
  text: string;
  active: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 칩 줄이 차지한 자리. 프레이밍 여백 계산이 이것을 본다. */
export interface ChipRow {
  x: number;
  y: number;
  w: number;
  h: number;
  rects: ChipRect[];
}

export interface ChipRowOptions {
  /** 선언의 자리. 없으면 `fallback` 모서리에서 `slot` 만큼 쌓는다. */
  at: ChipRowLayout;
  /** 이름표. 빈 문자열이면 두지 않는다. */
  label?: string;
  /** 선언의 크기 `[너비, 높이]`. 없으면 내용에 맞춘다. */
  size?: Vec2;
}

export interface ChipRowLayout {
  /** 선언이 준 자리. 없으면 `fallback` 에서 `slot` 만큼 쌓는다. */
  declared?: Anchor;
  fallback: ScreenAnchor;
  slot: number;
  viewport: Viewport;
  toScreen(world: Vec2): Vec2;
}

/**
 * 칩들을 한 줄에 놓는다. 넘치면 줄 끝에서 자른다 — 임베드는 가로로 넓고 세로로
 * 좁아서, 줄을 늘리면 그림이 그만큼 작아진다 (S-piece 「세로가 비싸다」).
 */
export function layoutChipRow(
  rc: ControllerRenderContext,
  chips: readonly Chip[],
  opts: ChipRowOptions,
): ChipRow {
  const { at, label, size } = opts;
  const m = metrics(rc.ui);
  const labelWidth = label ? rc.measure.textWidth(label, m.labelFontSize) + m.labelGap : 0;

  const widths = chips.map((c) => rc.measure.textWidth(c.text, m.fontSize) + m.padX * 2);
  const natural =
    m.pad * 2 +
    labelWidth +
    widths.reduce((sum, w) => sum + w, 0) +
    Math.max(0, chips.length - 1) * m.gap;

  const boxW = size?.[0] ?? natural;
  const boxH = size?.[1] ?? m.height + m.pad * 2;

  const anchor =
    at.declared ?? stackedAnchor(at.fallback, at.slot, [0, boxH + m.stackGap]);
  const box = placeBox(anchor, boxW, boxH, at.viewport, at.toScreen, m.margin);

  const rects: ChipRect[] = [];
  let x = box.x + m.pad + labelWidth;
  const y = box.y + (boxH - m.height) / 2;
  const limit = box.x + boxW - m.pad;
  for (let i = 0; i < chips.length; i++) {
    const chip = chips[i]!;
    const w = widths[i]!;
    if (x + w > limit && rects.length > 0) break;
    rects.push({ id: chip.id, text: chip.text, active: chip.active, x, y, w, h: m.height });
    x += w + m.gap;
  }
  return { ...box, w: boxW, h: boxH, rects };
}

/**
 * 칩 줄을 그린다.
 *
 * `toggle` 이면 켜진 칩을 accent 로, 아니면 primary 로 칠한다 — 탭은 "지금 여기"
 * 이고 토글은 "이것도 켜져 있다" 라서 같은 색을 쓰면 둘이 구분되지 않는다.
 */
export function drawChipRow(
  rc: ControllerRenderContext,
  row: ChipRow,
  opts: { label?: string; mode?: 'tab' | 'toggle' } = {},
): void {
  const { ctx, ui } = rc;
  const m = metrics(ui);
  const mode = opts.mode ?? 'tab';

  ctx.save();

  ctx.fillStyle = ui.surface;
  ctx.strokeStyle = ui.border;
  ctx.lineWidth = ui.strokeWidth.regular;
  roundRect(ctx, row.x, row.y, row.w, row.h, ui.radius.small);
  ctx.fill();
  ctx.stroke();

  if (opts.label) {
    ctx.font = `${m.labelFontSize}px ${ui.fontFamilyMono}`;
    ctx.fillStyle = ui.label;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.label, row.x + m.pad, row.y + row.h / 2);
  }

  ctx.font = `${m.fontSize}px ${ui.fontFamilyMono}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const r of row.rects) {
    if (r.active) {
      ctx.fillStyle = mode === 'toggle' ? ui.toggled : ui.selected;
      roundRect(ctx, r.x, r.y, r.w, r.h, ui.radius.small);
      ctx.fill();
    }
    ctx.fillStyle = r.active ? ui.onSelected : ui.label;
    ctx.fillText(r.text, r.x + r.w / 2, r.y + r.h / 2);
  }

  ctx.restore();
}

/** 포인터가 짚은 칩. 없으면 null. */
export function chipHit(input: PointerInput, row: ChipRow | null): ChipRect | null {
  if (!row) return null;
  for (const r of row.rects) {
    if (input.px >= r.x && input.px <= r.x + r.w && input.py >= r.y && input.py <= r.y + r.h) {
      return r;
    }
  }
  return null;
}

/** 포인터가 줄 상자 안에 있는가 — 칩 사이 여백도 이 조작기의 것이다. */
export function rowHit(input: PointerInput, row: ChipRow | null): boolean {
  if (!row) return false;
  return (
    input.px >= row.x &&
    input.px <= row.x + row.w &&
    input.py >= row.y &&
    input.py <= row.y + row.h
  );
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
