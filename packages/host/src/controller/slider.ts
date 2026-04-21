import type { BundleState, ControllerSpec } from '@aperi21/schema';
import type { Viewport } from '../camera';
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

const SLIDER_MARGIN = 24;
const SLIDER_WIDTH = 220;
const SLIDER_HEIGHT = 44;

function computeLayout(viewport: Viewport, index = 0): Layout {
  // 우측 상단 기둥에 세로로 쌓인다 (index 가 늘수록 아래로).
  const x = viewport.width - SLIDER_WIDTH - SLIDER_MARGIN;
  const y = SLIDER_MARGIN + index * (SLIDER_HEIGHT + 12);
  return {
    x,
    y,
    w: SLIDER_WIDTH,
    h: SLIDER_HEIGHT,
    trackY: y + SLIDER_HEIGHT / 2 + 6,
    handleR: 8,
  };
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
 * 여러 slider 가 동시에 존재하면 `__index` 인스턴스 상태로 순서를 구분하여
 * 우측 상단에 세로로 쌓인다. (현재 MVP 는 id 필드가 없으므로 binds.value 경로로
 * index 를 결정 — 같은 spec 인 경우 처음 것이 0 번.)
 */
export class SliderController implements ControllerImpl<SliderSpec> {
  readonly type = 'slider' as const;

  private dragging = false;
  private layoutIndexByPath = new Map<string, number>();

  isDragging(): boolean {
    return this.dragging;
  }

  render(rc: ControllerRenderContext, spec: SliderSpec, state: BundleState): void {
    const { ctx, theme, viewport, i18n } = rc;
    const idx = this.assignIndex(spec.binds.value);
    const layout = computeLayout(viewport, idx);
    const [lo, hi] = spec.range;
    const raw = readPath<number>(state, spec.binds.value);
    const value = typeof raw === 'number' ? raw : lo;
    const t = clamp((value - lo) / Math.max(1e-6, hi - lo), 0, 1);

    ctx.save();

    // 바탕
    ctx.fillStyle = theme.resolveColor('muted', 'subtle');
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(layout.x, layout.y, layout.w, layout.h);
    ctx.fill();
    ctx.stroke();

    // track
    const trackX0 = layout.x + 12;
    const trackX1 = layout.x + layout.w - 12;
    ctx.strokeStyle = theme.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trackX0, layout.trackY);
    ctx.lineTo(trackX1, layout.trackY);
    ctx.stroke();

    // filled part
    const hx = trackX0 + t * (trackX1 - trackX0);
    ctx.strokeStyle = theme.resolveColor('primary', 'strong');
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(trackX0, layout.trackY);
    ctx.lineTo(hx, layout.trackY);
    ctx.stroke();

    // handle
    ctx.fillStyle = theme.resolveColor('primary', 'strong');
    ctx.beginPath();
    ctx.arc(hx, layout.trackY, layout.handleR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = theme.background;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 라벨 + 값
    ctx.font = `10px ${theme.fontFamilyMono}`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = theme.muted;
    ctx.textAlign = 'left';
    ctx.fillText(i18n.resolve(spec.label), layout.x + 8, layout.y + 6);

    ctx.font = `600 12px ${theme.fontFamilyMono}`;
    ctx.fillStyle = theme.foreground;
    ctx.textAlign = 'right';
    const txt = `${value.toFixed(2)}${spec.unit ? ' ' + spec.unit : ''}`;
    ctx.fillText(txt, layout.x + layout.w - 8, layout.y + 6);

    ctx.restore();
  }

  hitTest(input: PointerInput, ctx: ControllerEventContext, spec: SliderSpec): boolean {
    const idx = this.assignIndex(spec.binds.value);
    return hitLayout(input, computeLayout(ctx.viewport, idx));
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: SliderSpec,
    state: BundleState,
  ): Partial<BundleState> | null {
    const idx = this.assignIndex(spec.binds.value);
    const layout = computeLayout(ctx.viewport, idx);
    if (!hitLayout(input, layout)) return null;
    this.dragging = true;
    return this.valueFromPointer(input, layout, spec, state);
  }

  onPointerMove(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: SliderSpec,
    state: BundleState,
  ): Partial<BundleState> | null {
    if (!this.dragging) return null;
    const idx = this.assignIndex(spec.binds.value);
    const layout = computeLayout(ctx.viewport, idx);
    return this.valueFromPointer(input, layout, spec, state);
  }

  onPointerUp(): Partial<BundleState> | null {
    this.dragging = false;
    return null;
  }

  private assignIndex(path: string): number {
    const existing = this.layoutIndexByPath.get(path);
    if (existing !== undefined) return existing;
    const idx = this.layoutIndexByPath.size;
    this.layoutIndexByPath.set(path, idx);
    return idx;
  }

  private valueFromPointer(
    input: PointerInput,
    layout: Layout,
    spec: SliderSpec,
    state: BundleState,
  ): Partial<BundleState> {
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
