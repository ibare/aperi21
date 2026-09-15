import type { BundleState, ControllerSpec } from '@aperi21/schema';
import { placeBox } from './layout';
import { readPath, writePath } from './path';
import type {
  ControllerEventContext,
  ControllerImpl,
  ControllerRenderContext,
  PointerInput,
} from './types';

type ValueEditSpec = Extract<ControllerSpec, { type: 'value-edit' }>;

/**
 * 자리를 내는 데 필요한 것만. 렌더와 이벤트가 **같은 함수**로 자리를 내야 보이는
 * 자리와 잡히는 자리가 어긋나지 않는데, 두 컨텍스트가 같은 타입은 아니다 —
 * 겹치는 부분만 받는다.
 */
type PanelPlacement = Pick<ControllerEventContext, 'viewport' | 'toScreen' | 'slot' | 'ui'>;

/** 선언에 `size` 가 없을 때의 패널 크기. 코어는 기본값만 준다 (원칙 7 ③). */
const DEFAULT_PANEL_W = 120;
const DEFAULT_PANEL_H = 32;
/** 값 글자의 기준 크기. 패널 높이에 비례한다 — 이 조작기 고유 치수다. */
const VALUE_FONT_BASE = 14;
/** 줄여도 여기까지. */
const MIN_LABEL_FONT = 8;
/** 대상 프리미티브 위로 띄우는 높이. */
const PANEL_LIFT = 18;

/**
 * target 프리미티브의 scene 참조에 저장된 위치 근처에 작은 값 편집 패널을 표시.
 * 클릭 하면 편집 모드 진입 — 드래그로 값을 조정(증감) 한다. 드래그 픽셀당 증감량은
 * range 기반으로 산출하며 range 없으면 0.1 단위.
 *
 * scene graph 에서 target id 로 primitive 위치를 찾는 대신, state 내부의
 * 관례적 필드(`elements: [{ id, position: [wx,wy] }]`) 를 탐색한다. DC Circuit
 * bundle 이 이 규약을 따르도록 설계되어 있다. 해당 필드가 없으면 패널은 기본
 * 위치(좌측 상단 바 아래) 에 표시.
 */
export class ValueEditController implements ControllerImpl<ValueEditSpec> {
  readonly type = 'value-edit' as const;

  private dragging = false;
  private dragStartX = 0;
  private dragStartValue = 0;

  isDragging(): boolean {
    return this.dragging;
  }

  render(rc: ControllerRenderContext, spec: ValueEditSpec, state: BundleState): void {
    const { ctx, ui, i18n } = rc;
    const raw = readPath<number>(state, spec.binds.value);
    const value = typeof raw === 'number' ? raw : 0;
    // hitTest 와 같은 함수로 자리를 낸다.
    const { x: px, y: py, w: panelW, h: panelH } = this.panelRect(
      {
        viewport: rc.viewport,
        toScreen: rc.toScreen,
        slot: rc.slot,
        ui: rc.ui,
      },
      spec,
      state,
    );

    ctx.save();
    ctx.fillStyle = ui.surface;
    ctx.strokeStyle = ui.border;
    ctx.lineWidth = ui.strokeWidth.regular;
    ctx.beginPath();
    ctx.rect(px, py, panelW, panelH);
    ctx.fill();
    ctx.stroke();

    // 글자와 안쪽 여백은 선언한 크기를 따른다 — 고정하면 작은 패널을 선언했을 때
    // 글자가 상자를 벗어난다.
    const k = panelH / DEFAULT_PANEL_H;
    const labelFont = Math.max(MIN_LABEL_FONT, Math.round(ui.fontSize.small * k));
    const valueFont = Math.max(ui.fontSize.small, Math.round(VALUE_FONT_BASE * k));
    const pad = Math.max(ui.spacing.xs, Math.round(ui.layout.gap * k));

    // 라벨
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = `${labelFont}px ${ui.fontFamilyMono}`;
    ctx.fillStyle = ui.label;
    const label = spec.label ? i18n.resolve(spec.label) : spec.target;
    ctx.fillText(label, px + pad, py + panelH / 2 - labelFont * 0.8);

    // 값 + 단위
    ctx.textAlign = 'right';
    ctx.font = `600 ${valueFont}px ${ui.fontFamilyMono}`;
    ctx.fillStyle = ui.text;
    const txt = `${Number.isFinite(value) ? value.toFixed(2) : '?'}${
      spec.unit ? ' ' + spec.unit : ''
    }`;
    ctx.fillText(txt, px + panelW - pad, py + panelH / 2 + valueFont * 0.3);

    // 드래그 포인터 힌트
    if (this.dragging) {
      ctx.strokeStyle = ui.toggled;
      ctx.lineWidth = ui.strokeWidth.thick;
      ctx.beginPath();
      ctx.rect(px, py, panelW, panelH);
      ctx.stroke();
    }

    ctx.restore();
  }

  hitTest(input: PointerInput, ctx: ControllerEventContext, spec: ValueEditSpec, state: BundleState): boolean {
    const rect = this.panelRect(ctx, spec, state);
    return (
      input.px >= rect.x &&
      input.px <= rect.x + rect.w &&
      input.py >= rect.y &&
      input.py <= rect.y + rect.h
    );
  }

  onPointerDown(
    input: PointerInput,
    _ctx: ControllerEventContext,
    spec: ValueEditSpec,
    state: BundleState,
  ): BundleState | null {
    const cur = readPath<number>(state, spec.binds.value) ?? 0;
    this.dragging = true;
    this.dragStartX = input.px;
    this.dragStartValue = cur;
    return null;
  }

  onPointerMove(
    input: PointerInput,
    _ctx: ControllerEventContext,
    spec: ValueEditSpec,
    state: BundleState,
  ): BundleState | null {
    if (!this.dragging) return null;
    const dx = input.px - this.dragStartX;
    const [lo, hi] = spec.range ?? [this.dragStartValue - 10, this.dragStartValue + 10];
    const span = Math.max(1e-6, hi - lo);
    // 패널 폭을 전체 range 에 맵핑 — 폭이 선언으로 바뀌면 감도도 그것을 따른다.
    const panelW = spec.size?.[0] ?? DEFAULT_PANEL_W;
    const delta = (dx / panelW) * span;
    let next = this.dragStartValue + delta;
    if (spec.range) {
      next = Math.max(lo, Math.min(hi, next));
    }
    return writePath(state, spec.binds.value, roundTo(next, 3));
  }

  onPointerUp(): BundleState | null {
    this.dragging = false;
    return null;
  }

  /**
   * 패널의 크기와 자리. **선언이 먼저다** (원칙 7 ③) — `size` 가 크기를, `at` 이
   * 자리를 정하고, `at` 이 없을 때만 대상 프리미티브를 따라간다. 그것도 못 찾으면
   * 기본 자리로 떨어진다.
   *
   * render · hitTest 가 같은 함수로 자리를 낸다 — 한쪽만 바꾸면 보이는 자리와
   * 잡히는 자리가 어긋나는데 예외는 나지 않는다.
   */
  private panelRect(
    ctx: PanelPlacement,
    spec: ValueEditSpec,
    state: BundleState,
  ): { x: number; y: number; w: number; h: number } {
    const [w, h] = spec.size ?? [DEFAULT_PANEL_W, DEFAULT_PANEL_H];
    if (spec.at) {
      return placeBox(spec.at, w, h, ctx.viewport, ctx.toScreen, ctx.ui.layout.margin);
    }
    const [sx, sy] = this.findTargetScreenFromState(ctx, spec, state);
    const x = Math.max(ctx.ui.layout.margin, Math.min(ctx.viewport.width - w - ctx.ui.layout.margin, sx - w / 2));
    const y = Math.max(
      ctx.ui.layout.margin,
      Math.min(ctx.viewport.height - h - ctx.ui.layout.margin, sy - h - PANEL_LIFT),
    );
    return { x, y, w, h };
  }

  private findTargetScreenFromState(
    ctx: PanelPlacement,
    spec: ValueEditSpec,
    state: BundleState,
  ): [number, number] {
    // 관례: state.elements[]: { id, position } 에서 target 과 id 가 일치하는 항목 찾음.
    const elements = readPath<Array<{ id?: string; position?: [number, number] }>>(
      state,
      'elements',
    );
    if (Array.isArray(elements)) {
      const found = elements.find((e) => e && e.id === spec.target && Array.isArray(e.position));
      if (found?.position) {
        return ctx.toScreen(found.position) as [number, number];
      }
    }
    // fallback — 상단 중앙
    return [ctx.viewport.width / 2, 60];
  }
}

function roundTo(v: number, decimals: number): number {
  const p = Math.pow(10, decimals);
  return Math.round(v * p) / p;
}
