import type { BundleState, ControllerSpec, Vec2 } from '@aperi21/schema';
import type { Viewport } from '../camera';
import type { UiTheme } from '../theme/types';
import { placeBox, stackedAnchor, type Box, type ScreenAnchor } from './layout';
import { readPath, writePath } from './path';
import type {
  ControllerEventContext,
  ControllerImpl,
  ControllerRenderContext,
  PointerInput,
} from './types';

type SliderSpec = Extract<ControllerSpec, { type: 'slider' }>;

interface Layout {
  x: number;
  y: number;
  w: number;
  h: number;
  trackY: number;
  handleR: number;
}

/** 선언에 `size` 가 없을 때의 크기. 코어는 기본값만 준다 (원칙 7 ③). */
const DEFAULT_SLIDER_WIDTH = 220;
const DEFAULT_SLIDER_HEIGHT = 44;
/**
 * 자리를 선언하지 않은 슬라이더끼리의 세로 간격.
 *
 * 축의 `ui.layout.stackGap` 을 쓰지 않는다 — 그 값은 **한 줄짜리** 조작기(칩 줄)
 * 사이의 간격이다. 쌓이는 상자의 크기가 서로 다르면 간격도 그 상자를 따라야
 * 한다. 축이 정할 수 있는 것은 "얼마나 띄우나" 가 아니라 "무엇 사이" 다.
 */
const SLIDER_STACK_GAP = 12;
/** 자리를 선언하지 않으면 오른쪽 위에서 아래로 쌓인다. */
const DEFAULT_AT: ScreenAnchor = { screen: 'top-right' };

function computeLayout(
  spec: SliderSpec,
  viewport: Viewport,
  toScreen: (w: Vec2) => Vec2,
  slot: number,
  ui: UiTheme,
): Layout {
  const [w, h] = spec.size ?? [DEFAULT_SLIDER_WIDTH, DEFAULT_SLIDER_HEIGHT];
  const at = spec.at ?? stackedAnchor(DEFAULT_AT, slot, [0, h + SLIDER_STACK_GAP]);
  const box = placeBox(at, w, h, viewport, toScreen, ui.layout.margin);
  // 안쪽 치수는 크기를 따라간다 — 고정하면 큰 슬라이더에서 비율이 깨진다.
  return { ...box, trackY: box.y + box.h / 2 + 6, handleR: Math.max(5, h * 0.18) };
}

function hitLayout(input: PointerInput, layout: Layout): boolean {
  return (
    input.px >= layout.x &&
    input.px <= layout.x + layout.w &&
    input.py >= layout.y &&
    input.py <= layout.y + layout.h
  );
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * 수평 슬라이더 — binds.value (state 경로) 를 range [lo, hi] 에 매핑해 편집.
 * 선언 하나가 인스턴스 하나다. 자리는 선언의 `at`, 없으면 선언 순서대로 쌓인다.
 */
export class SliderController implements ControllerImpl<SliderSpec> {
  readonly type = 'slider' as const;

  private dragging = false;
  /** 마지막 렌더의 자리. */
  private box: Box | null = null;

  isDragging(): boolean {
    return this.dragging;
  }

  /** 마지막 렌더에서 차지한 화면 상자. 자동 프레이밍이 이만큼을 비운다. */
  screenBounds(): Box | null {
    return this.box;
  }


  render(rc: ControllerRenderContext, spec: SliderSpec, state: BundleState): void {
    const { ctx, ui, viewport, i18n } = rc;
    const layout = computeLayout(spec, viewport, rc.toScreen, rc.slot, rc.ui);
    this.box = { x: layout.x, y: layout.y, w: layout.w, h: layout.h };
    const [lo, hi] = spec.range;
    const raw = readPath<number>(state, spec.binds.value);
    const value = typeof raw === 'number' ? raw : lo;
    const t = clamp((value - lo) / Math.max(1e-6, hi - lo), 0, 1);

    ctx.save();

    // 바탕
    ctx.fillStyle = ui.surface;
    ctx.strokeStyle = ui.border;
    ctx.lineWidth = ui.strokeWidth.regular;
    ctx.beginPath();
    ctx.rect(layout.x, layout.y, layout.w, layout.h);
    ctx.fill();
    ctx.stroke();

    // track
    const trackX0 = layout.x + 12;
    const trackX1 = layout.x + layout.w - 12;
    ctx.strokeStyle = ui.label;
    ctx.lineWidth = ui.strokeWidth.thick;
    ctx.beginPath();
    ctx.moveTo(trackX0, layout.trackY);
    ctx.lineTo(trackX1, layout.trackY);
    ctx.stroke();

    // filled part
    const hx = trackX0 + t * (trackX1 - trackX0);
    ctx.strokeStyle = ui.selected;
    ctx.lineWidth = ui.strokeWidth.heavy;
    ctx.beginPath();
    ctx.moveTo(trackX0, layout.trackY);
    ctx.lineTo(hx, layout.trackY);
    ctx.stroke();

    // handle
    ctx.fillStyle = ui.selected;
    ctx.beginPath();
    ctx.arc(hx, layout.trackY, layout.handleR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ui.onSelected;
    ctx.lineWidth = ui.strokeWidth.thick;
    ctx.stroke();

    // 라벨 + 값
    ctx.font = `${ui.fontSize.small}px ${ui.fontFamilyMono}`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = ui.label;
    ctx.textAlign = 'left';
    ctx.fillText(i18n.resolve(spec.label), layout.x + 8, layout.y + 6);

    ctx.font = `600 ${ui.fontSize.large}px ${ui.fontFamilyMono}`;
    ctx.fillStyle = ui.text;
    ctx.textAlign = 'right';
    const txt = `${value.toFixed(2)}${spec.unit ? ' ' + spec.unit : ''}`;
    ctx.fillText(txt, layout.x + layout.w - 8, layout.y + 6);

    ctx.restore();
  }

  hitTest(input: PointerInput, ctx: ControllerEventContext, spec: SliderSpec): boolean {
    return hitLayout(input, computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot, ctx.ui));
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: SliderSpec,
    state: BundleState,
  ): BundleState | null {
    const layout = computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot, ctx.ui);
    if (!hitLayout(input, layout)) return null;
    this.dragging = true;
    return this.valueFromPointer(input, layout, spec, state);
  }

  onPointerMove(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: SliderSpec,
    state: BundleState,
  ): BundleState | null {
    if (!this.dragging) return null;
    const layout = computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot, ctx.ui);
    return this.valueFromPointer(input, layout, spec, state);
  }

  onPointerUp(): BundleState | null {
    this.dragging = false;
    // 잡고 있다는 사실은 러너가 `ControllerInstance.heldPath` 로 적는다 — 조작기 종류와
    // 무관한 공통 규약이라 여기서 다시 적지 않는다.
    return null;
  }

  private valueFromPointer(
    input: PointerInput,
    layout: Layout,
    spec: SliderSpec,
    state: BundleState,
  ): BundleState {
    const trackX0 = layout.x + 12;
    const trackX1 = layout.x + layout.w - 12;
    const t = clamp((input.px - trackX0) / Math.max(1, trackX1 - trackX0), 0, 1);
    const [lo, hi] = spec.range;
    const value = lo + t * (hi - lo);
    return writePath(state, spec.binds.value, roundTo(value, 3));
  }
}

function roundTo(v: number, decimals: number): number {
  const p = Math.pow(10, decimals);
  return Math.round(v * p) / p;
}
