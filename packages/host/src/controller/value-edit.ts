import type { BundleState, ControllerSpec } from '@aperi21/schema';
import { readPath, writePath } from './path';
import type {
  ControllerEventContext,
  ControllerImpl,
  ControllerRenderContext,
  PointerInput,
} from './types';

type ValueEditSpec = Extract<ControllerSpec, { type: 'value-edit' }>;

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
    const { ctx, theme, viewport, i18n } = rc;
    const raw = readPath<number>(state, spec.binds.value);
    const value = typeof raw === 'number' ? raw : 0;
    const bounds = this.findTargetScreen(rc, spec, state);

    const [sx, sy] = bounds;
    const panelW = 120;
    const panelH = 32;
    const px = Math.max(8, Math.min(viewport.width - panelW - 8, sx - panelW / 2));
    const py = Math.max(8, Math.min(viewport.height - panelH - 8, sy - panelH - 18));

    ctx.save();
    ctx.fillStyle = theme.resolveColor('muted', 'subtle');
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(px, py, panelW, panelH);
    ctx.fill();
    ctx.stroke();

    // 라벨
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = `10px ${theme.fontFamilyMono}`;
    ctx.fillStyle = theme.muted;
    const label = spec.label ? i18n.resolve(spec.label) : spec.target;
    ctx.fillText(label, px + 8, py + panelH / 2 - 8);

    // 값 + 단위
    ctx.textAlign = 'right';
    ctx.font = `600 14px ${theme.fontFamilyMono}`;
    ctx.fillStyle = theme.foreground;
    const txt = `${Number.isFinite(value) ? value.toFixed(2) : '?'}${
      spec.unit ? ' ' + spec.unit : ''
    }`;
    ctx.fillText(txt, px + panelW - 8, py + panelH / 2 + 4);

    // 드래그 포인터 힌트
    if (this.dragging) {
      ctx.strokeStyle = theme.resolveColor('accent', 'strong');
      ctx.lineWidth = 2;
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
    // 패널 폭(120px) 을 전체 range 에 맵핑 — 드래그 거리/120 만큼 이동.
    const delta = (dx / 120) * span;
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

  private panelRect(
    ctx: ControllerEventContext,
    spec: ValueEditSpec,
    state: BundleState,
  ): { x: number; y: number; w: number; h: number } {
    const [sx, sy] = this.findTargetScreenFromState(ctx, spec, state);
    const panelW = 120;
    const panelH = 32;
    const x = Math.max(8, Math.min(ctx.viewport.width - panelW - 8, sx - panelW / 2));
    const y = Math.max(8, Math.min(ctx.viewport.height - panelH - 8, sy - panelH - 18));
    return { x, y, w: panelW, h: panelH };
  }

  private findTargetScreen(
    rc: ControllerRenderContext,
    spec: ValueEditSpec,
    state: BundleState,
  ): [number, number] {
    return this.findTargetScreenFromState(
      {
        viewport: rc.viewport,
        toWorld: rc.toWorld,
        toScreen: rc.toScreen,
        snapWorld: (w) => w,
        scale: rc.scale,
      },
      spec,
      state,
    );
  }

  private findTargetScreenFromState(
    ctx: ControllerEventContext,
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
