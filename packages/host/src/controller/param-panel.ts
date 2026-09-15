import type { BundleState, ControllerSpec, ParamDef } from '@aperi21/schema';
import { chipHit, roundRect, type ChipRow } from './chips';
import { placeBox, stackedAnchor, type Box, type ScreenAnchor } from './layout';
import { readPath } from './path';
import { controllerText } from './text';
import type {
  ControllerEventContext,
  ControllerImpl,
  ControllerRenderContext,
  PointerInput,
  SessionView,
} from './types';

type ParamPanelSpec = Extract<ControllerSpec, { type: 'param-panel' }>;

/**
 * 이 조작기 **고유의** 치수 기본값. 여백·글자처럼 축이 정하는 것은 `ui` 토큰에서
 * 받고, 여기 남는 것은 파라미터 상자라서 필요한 값들이다 (C2 「기본값도 named
 * 상수로 한 곳에」). 선언의 `size` 가 있으면 그것이 이긴다 (원칙 7 ③).
 */
const PANEL = {
  /** 선언에 `size` 가 없을 때의 너비. */
  width: 200,
  /** 이름표 줄의 높이. */
  headerHeight: 16,
  /** 파라미터 한 줄의 높이 — 이름·값 한 줄과 트랙 한 줄. */
  rowHeight: 30,
  /** 트랙 굵기. */
  trackHeight: 4,
  /** 손잡이 반지름. */
  handleRadius: 5,
  /** 되돌리기 칩의 크기. */
  resetWidth: 44,
  resetHeight: 14,
} as const;

/** 자리를 선언하지 않으면 왼쪽 아래에서 위로 쌓인다 (`stage-tabs` 머리말 참고). */
const DEFAULT_AT: ScreenAnchor = { screen: 'bottom-left' };

interface Row {
  param: ParamDef;
  value: number;
  /** 트랙 좌우 끝(화면 px). `range` 가 없으면 null — 값만 읽힌다. */
  track: { x0: number; x1: number; y: number } | null;
}

interface Layout {
  x: number;
  y: number;
  w: number;
  h: number;
  rows: Row[];
  /** 되돌리기 칩. 선언이 끄면 null. */
  reset: ChipRow | null;
}

/** 선언이 고른 파라미터만. 생략하면 전부. */
function pickParams(spec: ParamPanelSpec, session: SessionView): ParamDef[] {
  if (!spec.params) return [...session.parameters];
  const byId = new Map(session.parameters.map((p) => [p.id, p]));
  return spec.params.map((id) => byId.get(id)).filter((p): p is ParamDef => !!p);
}

/**
 * 파라미터의 지금 값.
 *
 * `statePath` 를 가진 것은 **state 가 단일 소스다** — 같은 값을 다른 조작기가
 * 밀고 있을 수 있어서(발사체의 각도 다이얼), 세션 쪽 사본을 보면 둘이 어긋난다.
 */
function currentValue(param: ParamDef, session: SessionView, state: BundleState): number {
  if (param.statePath) {
    const v = readPath<number>(state, param.statePath);
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  const v = session.params[param.id];
  return typeof v === 'number' && Number.isFinite(v) ? v : param.default;
}

function computeLayout(
  rc: ControllerRenderContext,
  spec: ParamPanelSpec,
  state: BundleState,
): Layout | null {
  const params = pickParams(spec, rc.session);
  if (params.length === 0) return null;
  const ui = rc.ui;

  const showReset = spec.reset !== false;
  const w = spec.size?.[0] ?? PANEL.width;
  const h =
    spec.size?.[1] ??
    ui.spacing.md * 2 + PANEL.headerHeight + params.length * PANEL.rowHeight;

  const at = spec.at ?? stackedAnchor(DEFAULT_AT, rc.slot, [0, h + ui.layout.stackGap]);
  const box = placeBox(at, w, h, rc.viewport, rc.toScreen, ui.layout.margin);

  const trackX0 = box.x + ui.spacing.md;
  const trackX1 = box.x + w - ui.spacing.md;

  const rows: Row[] = params.map((param, i) => {
    const top = box.y + ui.spacing.md + PANEL.headerHeight + i * PANEL.rowHeight;
    return {
      param,
      value: currentValue(param, rc.session, state),
      track: param.range
        ? { x0: trackX0, x1: trackX1, y: top + ui.fontSize.regular + ui.spacing.xs + PANEL.trackHeight }
        : null,
    };
  });

  const reset: ChipRow | null = showReset
    ? {
        x: box.x + w - ui.spacing.md - PANEL.resetWidth,
        y: box.y + ui.spacing.md - 2,
        w: PANEL.resetWidth,
        h: PANEL.resetHeight,
        rects: [
          {
            id: 'reset',
            text: rc.i18n.t('ui.paramPanel.reset', 'reset'),
            active: false,
            x: box.x + w - ui.spacing.md - PANEL.resetWidth,
            y: box.y + ui.spacing.md - 2,
            w: PANEL.resetWidth,
            h: PANEL.resetHeight,
          },
        ],
      }
    : null;

  return { x: box.x, y: box.y, w, h, rows, reset };
}

function decimalsForStep(step: number | undefined): number {
  if (!step || step >= 1) return 0;
  if (step >= 0.1) return 1;
  if (step >= 0.01) return 2;
  return 3;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * 파라미터 상자 — 조각이 선언한 값들을 한자리에 모아 조작한다.
 *
 * 예전에는 러너가 파라미터가 하나라도 있으면 자동으로 띄웠다. 그래서 저작자가
 * "이 조각은 값을 만지게 하지 않는다" 를 고를 수 없었다 (원칙 2). 이제 선언해야 뜬다.
 *
 * `range` 가 없는 파라미터는 값만 읽힌다 — 캔버스에는 숫자를 받아 적을 자리가 없다.
 */
export class ParamPanelController implements ControllerImpl<ParamPanelSpec> {
  readonly type = 'param-panel' as const;

  /** 마지막에 그린 자리. hitTest 가 이것을 본다 (chips.ts 머리말). */
  private layout: Layout | null = null;
  /** 끌고 있는 파라미터 id. */
  private dragId: string | null = null;

  isDragging(): boolean {
    return this.dragId !== null;
  }

  screenBounds(): Box | null {
    const l = this.layout;
    return l ? { x: l.x, y: l.y, w: l.w, h: l.h } : null;
  }

  render(rc: ControllerRenderContext, spec: ParamPanelSpec, state: BundleState): void {
    this.layout = computeLayout(rc, spec, state);
    const layout = this.layout;
    if (!layout) return;

    const { ctx, ui } = rc;
    ctx.save();

    ctx.fillStyle = ui.surface;
    ctx.strokeStyle = ui.border;
    ctx.lineWidth = ui.strokeWidth.regular;
    roundRect(ctx, layout.x, layout.y, layout.w, layout.h, ui.radius.small);
    ctx.fill();
    ctx.stroke();

    ctx.font = `${ui.fontSize.small}px ${ui.fontFamilyMono}`;
    ctx.fillStyle = ui.label;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(
      controllerText(rc.i18n, spec.label, 'ui.paramPanel.title', 'params'),
      layout.x + ui.spacing.md,
      layout.y + ui.spacing.md,
    );

    if (layout.reset) {
      const chip = layout.reset.rects[0]!;
      ctx.strokeStyle = ui.border;
      roundRect(ctx, chip.x, chip.y, chip.w, chip.h, ui.radius.small);
      ctx.stroke();
      ctx.fillStyle = ui.label;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(chip.text, chip.x + chip.w / 2, chip.y + chip.h / 2);
    }

    for (const row of layout.rows) {
      const top = row.track
        ? row.track.y - PANEL.trackHeight - ui.spacing.xs - ui.fontSize.regular
        : layout.y + ui.spacing.md + PANEL.headerHeight;

      ctx.font = `${ui.fontSize.regular}px ${ui.fontFamilyMono}`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = ui.label;
      ctx.fillText(rc.i18n.resolve(row.param.label), layout.x + ui.spacing.md, top);

      const digits = decimalsForStep(row.param.step);
      const text = `${row.value.toFixed(digits)}${row.param.unit ? ' ' + row.param.unit : ''}`;
      ctx.textAlign = 'right';
      ctx.fillStyle = ui.text;
      ctx.fillText(text, layout.x + layout.w - ui.spacing.md, top);

      if (!row.track || !row.param.range) continue;
      const [lo, hi] = row.param.range;
      const t = clamp((row.value - lo) / Math.max(1e-6, hi - lo), 0, 1);
      const hx = row.track.x0 + t * (row.track.x1 - row.track.x0);

      ctx.strokeStyle = ui.border;
      ctx.lineWidth = PANEL.trackHeight;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(row.track.x0, row.track.y);
      ctx.lineTo(row.track.x1, row.track.y);
      ctx.stroke();

      ctx.strokeStyle = ui.selected;
      ctx.beginPath();
      ctx.moveTo(row.track.x0, row.track.y);
      ctx.lineTo(hx, row.track.y);
      ctx.stroke();

      ctx.fillStyle = ui.selected;
      ctx.beginPath();
      ctx.arc(hx, row.track.y, PANEL.handleRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  hitTest(input: PointerInput, _ctx: ControllerEventContext, _spec: ParamPanelSpec): boolean {
    const layout = this.layout;
    if (!layout) return false;
    return (
      input.px >= layout.x &&
      input.px <= layout.x + layout.w &&
      input.py >= layout.y &&
      input.py <= layout.y + layout.h
    );
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    _spec: ParamPanelSpec,
    _state: BundleState,
  ): BundleState | null {
    const layout = this.layout;
    if (!layout) return null;

    if (chipHit(input, layout.reset)) {
      ctx.session.resetState();
      return null;
    }

    const row = this.rowAt(input, layout);
    if (!row) return null;
    this.dragId = row.param.id;
    this.apply(row, input, ctx);
    return null;
  }

  onPointerMove(
    input: PointerInput,
    ctx: ControllerEventContext,
    _spec: ParamPanelSpec,
    _state: BundleState,
  ): BundleState | null {
    if (!this.dragId || !this.layout) return null;
    const row = this.layout.rows.find((r) => r.param.id === this.dragId);
    if (row) this.apply(row, input, ctx);
    return null;
  }

  onPointerUp(): BundleState | null {
    this.dragId = null;
    return null;
  }

  /** 포인터가 짚은 줄. 트랙 세로 위아래로 한 줄 높이의 절반까지 잡는다. */
  private rowAt(input: PointerInput, layout: Layout): Row | null {
    for (const row of layout.rows) {
      if (!row.track) continue;
      if (Math.abs(input.py - row.track.y) <= PANEL.rowHeight / 2) return row;
    }
    return null;
  }

  private apply(row: Row, input: PointerInput, ctx: ControllerEventContext): void {
    if (!row.track || !row.param.range) return;
    const t = clamp((input.px - row.track.x0) / Math.max(1, row.track.x1 - row.track.x0), 0, 1);
    const [lo, hi] = row.param.range;
    const raw = lo + t * (hi - lo);
    const step = row.param.step;
    const value = step ? Math.round(raw / step) * step : raw;
    ctx.session.setParam(row.param.id, clamp(value, lo, hi));
  }
}
