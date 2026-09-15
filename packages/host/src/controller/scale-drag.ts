import type { BundleState, ControllerSpec, Vec2 } from '@aperi21/schema';
import { readPath, writePath } from './path';
import type {
  ControllerEventContext,
  ControllerImpl,
  ControllerRenderContext,
  PointerInput,
} from './types';

type ScaleDragSpec = Extract<ControllerSpec, { type: 'scale-drag' }>;

/** 트랙에서 이만큼(화면 px) 떨어진 곳까지 잡힌다. 손가락으로도 잡을 수 있게. */
const GRAB_DISTANCE_PX = 16;
/** 손잡이 반지름(화면 px). 눈금의 5px 표식은 움직여도 눈에 띄지 않는다. */
const HANDLE_RADIUS_PX = 8;
/** 잡고 있는 동안의 손잡이 반지름. */
const HANDLE_HELD_RADIUS_PX = 10;

/** 트랙의 두 끝(화면). */
function trackEnds(spec: ScaleDragSpec, toScreen: (w: Vec2) => Vec2): [Vec2, Vec2] {
  const [dx, dy] = spec.track.direction ?? [1, 0];
  const len = Math.hypot(dx, dy) || 1;
  const [x0, y0] = spec.track.pos;
  const end: Vec2 = [x0 + (dx / len) * spec.track.size, y0 + (dy / len) * spec.track.size];
  return [toScreen(spec.track.pos), toScreen(end)];
}

/** 화면 점을 트랙에 내린 비율(0~1)과 트랙까지의 거리(px). */
function project(p: Vec2, a: Vec2, b: Vec2): { k: number; dist: number } {
  const ex = b[0] - a[0];
  const ey = b[1] - a[1];
  const len2 = ex * ex + ey * ey || 1;
  const k = Math.max(0, Math.min(1, ((p[0] - a[0]) * ex + (p[1] - a[1]) * ey) / len2));
  const qx = a[0] + ex * k;
  const qy = a[1] + ey * k;
  return { k, dist: Math.hypot(p[0] - qx, p[1] - qy) };
}

function valueAt(spec: ScaleDragSpec, k: number): number {
  const [lo, hi] = spec.range;
  return lo + k * (hi - lo);
}

function ratioOf(spec: ScaleDragSpec, value: number): number {
  const [lo, hi] = spec.range;
  return Math.max(0, Math.min(1, (value - lo) / (hi - lo || 1)));
}

/**
 * 눈금을 직접 끄는 조작기. 그림 속 눈금 위에 손잡이를 얹고, 누르면 그 자리 값을 잡는다.
 *
 * **인스턴스 상태가 없다.** 잡고 있는지는 번들 상태(`binds.held`)가 안다. 능력 생성물이
 * 조작기를 조각마다 하나 만들어 그 조각의 모든 임베드가 나눠 쓰기 때문에, 여기 필드를
 * 두면 한 문서의 두 임베드가 서로의 끌기를 이어받는다 (C5). 끄는 중인 조작기는 러너가
 * 캔버스마다 기억한다.
 *
 * 글자를 그리지 않는다 — 값 표시는 scene 의 몫이다. 조작기가 쓰면 선언의 정박값
 * 포매터를 거치지 않아 표에 없는 수가 뜬다.
 */
export class ScaleDragController implements ControllerImpl<ScaleDragSpec> {
  readonly type = 'scale-drag' as const;

  isDragging(): boolean {
    return false;
  }

  render(rc: ControllerRenderContext, spec: ScaleDragSpec, state: BundleState): void {
    const raw = readPath<number>(state, spec.binds.value);
    if (typeof raw !== 'number') return;
    const held = readPath<boolean>(state, spec.binds.held) === true;
    const [a, b] = trackEnds(spec, rc.toScreen);
    const k = ratioOf(spec, raw);
    const x = a[0] + (b[0] - a[0]) * k;
    const y = a[1] + (b[1] - a[1]) * k;

    const c = rc.ctx;
    c.save();
    c.beginPath();
    c.arc(x, y, held ? HANDLE_HELD_RADIUS_PX : HANDLE_RADIUS_PX, 0, Math.PI * 2);
    c.fillStyle = rc.ui.text;
    c.fill();
    c.lineWidth = rc.ui.strokeWidth.thick;
    c.strokeStyle = rc.ui.onSelected;
    c.stroke();
    c.restore();
  }

  hitTest(input: PointerInput, ctx: ControllerEventContext, spec: ScaleDragSpec): boolean {
    const [a, b] = trackEnds(spec, ctx.toScreen);
    return project([input.px, input.py], a, b).dist <= GRAB_DISTANCE_PX;
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: ScaleDragSpec,
    state: BundleState,
  ): BundleState | null {
    if (!this.hitTest(input, ctx, spec)) return null;
    return writePath(this.grab(input, ctx, spec, state), spec.binds.held, true);
  }

  onPointerMove(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: ScaleDragSpec,
    state: BundleState,
  ): BundleState | null {
    // 러너는 누른 조작기에만 움직임을 넘긴다.
    return this.grab(input, ctx, spec, state);
  }

  onPointerUp(
    _input: PointerInput,
    _ctx: ControllerEventContext,
    spec: ScaleDragSpec,
    state: BundleState,
  ): BundleState | null {
    return writePath(state, spec.binds.held, false);
  }

  private grab(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: ScaleDragSpec,
    state: BundleState,
  ): BundleState {
    const [a, b] = trackEnds(spec, ctx.toScreen);
    const { k } = project([input.px, input.py], a, b);
    return writePath(state, spec.binds.value, valueAt(spec, k));
  }
}
