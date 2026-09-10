import type { BundleState, ControllerSpec, Vec2 } from '@aperi21/schema';
import type { Viewport } from '../camera';
import { placeBox, stackedAnchor, type ScreenAnchor } from './layout';
import { readPath, writePath } from './path';
import { controllerText } from './text';
import type {
  ControllerEventContext,
  ControllerImpl,
  ControllerRenderContext,
  PointerInput,
} from './types';

type AngleSpec = Extract<ControllerSpec, { type: 'angle-dial' }>;

interface Layout {
  cx: number;
  cy: number;
  r: number;
}

const DIAL_MARGIN = 32;
const DIAL_RADIUS = 72;
/** 자리를 선언하지 않은 다이얼끼리의 가로 간격. */
const DIAL_STACK_GAP = 24;
/** 자리를 선언하지 않으면 왼쪽 아래에서 오른쪽으로 쌓인다. */
const DEFAULT_AT: ScreenAnchor = { screen: 'bottom-left' };

/** 반원 다이얼의 상자는 지름 × 반지름. 중심은 상자 아래 가운데. */
function computeLayout(
  spec: AngleSpec,
  viewport: Viewport,
  toScreen: (w: Vec2) => Vec2,
  slot: number,
): Layout {
  const r = DIAL_RADIUS;
  const at = spec.at ?? stackedAnchor(DEFAULT_AT, slot, [2 * r + DIAL_STACK_GAP, 0]);
  const box = placeBox(at, 2 * r, r, viewport, toScreen, DIAL_MARGIN);
  return { cx: box.x + r, cy: box.y + r, r };
}

function hitDial(input: PointerInput, layout: Layout): boolean {
  const dx = input.px - layout.cx;
  const dy = input.py - layout.cy;
  const d2 = dx * dx + dy * dy;
  // 반원(위쪽) 안쪽 + 바깥 4px 여유. y 가 center 보다 아래면 제외 — 다이얼 아래의
  // 캔버스 클릭이 다이얼로 빨려가지 않도록 여유는 작게 둔다.
  if (input.py > layout.cy + 2) return false;
  return d2 <= (layout.r + 4) * (layout.r + 4);
}

/**
 * 반원 다이얼. 마우스 위치 → 중심 기준 각도 → range 로 클램프 후 spec.binds.angle
 * 경로에 기록. tickAt 에 지정된 각도에 강조 눈금. 선언 하나가 인스턴스 하나다.
 */
export class AngleDialController implements ControllerImpl<AngleSpec> {
  readonly type = 'angle-dial' as const;

  private dragging = false;

  isDragging(): boolean {
    return this.dragging;
  }

  render(rc: ControllerRenderContext, spec: AngleSpec, state: BundleState): void {
    const { ctx, theme, viewport } = rc;
    const layout = computeLayout(spec, viewport, rc.toScreen, rc.slot);
    const angle = Number(readPath<number>(state, spec.binds.angle) ?? 45);
    const range = spec.range ?? [0, 90];

    ctx.save();

    // 반원 base
    ctx.beginPath();
    ctx.arc(layout.cx, layout.cy, layout.r, Math.PI, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = theme.resolveColor('muted', 'subtle');
    ctx.fill();
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 각도 틱 (10° 마다) — 0°=오른쪽, 90°=위쪽 (포물선 발사 방향)
    ctx.strokeStyle = theme.muted;
    ctx.lineWidth = 1;
    for (let a = range[0]; a <= range[1]; a += 10) {
      const rad = (a * Math.PI) / 180;
      const x1 = layout.cx + Math.cos(rad) * (layout.r - 6);
      const y1 = layout.cy - Math.sin(rad) * (layout.r - 6);
      const x2 = layout.cx + Math.cos(rad) * layout.r;
      const y2 = layout.cy - Math.sin(rad) * layout.r;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // tickAt 강조 (물리 특수점)
    if (spec.tickAt) {
      ctx.strokeStyle = theme.resolveColor('accent', 'strong');
      ctx.lineWidth = 2;
      for (const a of spec.tickAt) {
        const rad = (a * Math.PI) / 180;
        const x1 = layout.cx + Math.cos(rad) * (layout.r - 12);
        const y1 = layout.cy - Math.sin(rad) * (layout.r - 12);
        const x2 = layout.cx + Math.cos(rad) * layout.r;
        const y2 = layout.cy - Math.sin(rad) * layout.r;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // 바늘 — 0°=오른쪽(+x), 90°=위쪽(+y)
    const rad = (angle * Math.PI) / 180;
    const nx = layout.cx + Math.cos(rad) * (layout.r - 12);
    const ny = layout.cy - Math.sin(rad) * (layout.r - 12);
    ctx.strokeStyle = theme.resolveColor('primary', 'strong');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(layout.cx, layout.cy);
    ctx.lineTo(nx, ny);
    ctx.stroke();

    // 중심 point
    ctx.fillStyle = theme.foreground;
    ctx.beginPath();
    ctx.arc(layout.cx, layout.cy, 4, 0, Math.PI * 2);
    ctx.fill();

    // 큰 각도 숫자
    ctx.font = `600 18px ${theme.fontFamilyMono}`;
    ctx.fillStyle = theme.foreground;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(angle)}°`, layout.cx, layout.cy + 24);

    // 이름표 — 선언의 label, 없으면 프레임워크 문구
    ctx.font = `10px ${theme.fontFamilyMono}`;
    ctx.fillStyle = theme.muted;
    ctx.fillText(
      controllerText(rc.i18n, spec.label, 'ui.angleDial.label', 'ANGLE'),
      layout.cx,
      layout.cy + 40,
    );

    ctx.restore();
  }

  hitTest(input: PointerInput, ctx: ControllerEventContext, spec: AngleSpec): boolean {
    return hitDial(input, computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot));
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: AngleSpec,
    state: BundleState,
  ): BundleState | null {
    const layout = computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot);
    if (!hitDial(input, layout)) return null;
    this.dragging = true;
    return this.angleFromPointer(input, layout, spec, state);
  }

  onPointerMove(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: AngleSpec,
    state: BundleState,
  ): BundleState | null {
    if (!this.dragging) return null;
    return this.angleFromPointer(
      input,
      computeLayout(spec, ctx.viewport, ctx.toScreen, ctx.slot),
      spec,
      state,
    );
  }

  onPointerUp(): BundleState | null {
    this.dragging = false;
    return null;
  }

  private angleFromPointer(
    input: PointerInput,
    layout: Layout,
    spec: AngleSpec,
    state: BundleState,
  ): BundleState {
    const dx = input.px - layout.cx;
    const dy = layout.cy - input.py;
    // 반원 위쪽만 허용. 0°=오른쪽, 90°=위쪽 규약.
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    const [lo, hi] = spec.range ?? [0, 90];
    deg = Math.max(lo, Math.min(hi, deg));
    return writePath(state, spec.binds.angle, Math.round(deg));
  }
}
