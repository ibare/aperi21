import type { BundleState, ControllerSpec, Vec2 } from '@aperi21/schema';
import { readPath, writePath } from './path';
import type {
  ControllerEventContext,
  ControllerImpl,
  ControllerRenderContext,
  PointerInput,
} from './types';

type PointDragSpec = Extract<ControllerSpec, { type: 'point-drag' }>;

/**
 * 선언에 `grabRadius` 가 없을 때 잡히는 반경(화면 px). 손가락으로도 잡을 수 있게
 * 눈에 보이는 손잡이보다 넉넉하다 (`scale-drag` 과 같은 값).
 */
const DEFAULT_GRAB_RADIUS_PX = 16;
/** 손잡이 반지름(화면 px). 이 조작기 고유의 치수라 named 상수로 둔다 (C2 예외). */
const HANDLE_RADIUS_PX = 8;
/** 잡고 있는 동안의 손잡이 반지름. 커지는 것이 잡혔다는 유일한 표시다. */
const HANDLE_HELD_RADIUS_PX = 10;

/** state 에서 읽은 것이 월드 좌표 한 점인가. */
function readPoint(state: BundleState, path: string): Vec2 | null {
  const raw = readPath<unknown>(state, path);
  if (!Array.isArray(raw) || raw.length !== 2) return null;
  const [x, y] = raw as [unknown, unknown];
  if (typeof x !== 'number' || typeof y !== 'number') return null;
  return [x, y];
}

/**
 * 끌린 자리를 후보 중 가장 가까운 곳에 붙인다.
 *
 * 거리는 **월드**에서 잰다. 화면에서 재면 확대 배율에 따라 붙는 점이 달라져, 같은
 * 조각이 배율마다 다른 답을 낸다.
 */
function snap(world: Vec2, candidates: readonly Vec2[]): Vec2 {
  let best: Vec2 | null = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = (c[0] - world[0]) ** 2 + (c[1] - world[1]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best ?? world;
}

/**
 * 그림 속 한 점을 잡아 끄는 손잡이. 방향과 길이를 한꺼번에 바꾼다.
 *
 * `scale-drag` 은 직선 트랙 위 1 차원이고 `angle-dial` 은 따로 뜨는 다이얼이며
 * `placement` 는 팔레트에서 끌어다 놓는 것이다. **그림 안에 있는 점 자체가 손잡이**인
 * 경우가 이것이라, 자리를 선언하지 않는다 — 자리는 `binds.pos` 가 가리키는 값 그 자체다.
 *
 * `screenBounds()` 를 돌려주지 않는다. 자동 프레이밍이 조작기 자리를 비우는데, 그림
 * 안에 있는 이것을 비우게 하면 제 그림을 밀어내게 된다 (`ControllerImpl` 머리말).
 *
 * 글자를 그리지 않는다 — 값 표시는 scene 의 몫이다. 조작기가 쓰면 선언의 포매터를
 * 거치지 않아 표에 없는 수가 뜬다.
 */
export class PointDragController implements ControllerImpl<PointDragSpec> {
  /**
   * 끌고 있는 중인가. **인스턴스 필드다** — 모듈 스코프에 두면 한 문서의 여러 임베드가
   * 서로의 끌기를 이어받는다 (C5). 인스턴스는 선언 하나당 하나이므로 여기서 끝난다.
   *
   * 포인터 id 는 갖지 않는다. 러너가 id 별로 세션을 들고 있어 누른 손가락에게만
   * 움직임을 넘기므로, 조작기가 다시 세면 같은 사실을 두 곳에서 관리하게 된다.
   */
  private dragging = false;

  readonly type = 'point-drag' as const;

  isDragging(): boolean {
    return this.dragging;
  }

  render(rc: ControllerRenderContext, spec: PointDragSpec, state: BundleState): void {
    const pos = readPoint(state, spec.binds.pos);
    if (!pos) return;
    const held = readPath<boolean>(state, spec.binds.held) === true;
    const [x, y] = rc.toScreen(pos);

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

  hitTest(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: PointDragSpec,
    state: BundleState,
  ): boolean {
    const pos = readPoint(state, spec.binds.pos);
    if (!pos) return false;
    const [x, y] = ctx.toScreen(pos);
    const r = spec.grabRadius ?? DEFAULT_GRAB_RADIUS_PX;
    return Math.hypot(input.px - x, input.py - y) <= r;
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: PointDragSpec,
    state: BundleState,
  ): BundleState | null {
    if (!this.hitTest(input, ctx, spec, state)) return null;
    this.dragging = true;
    return writePath(this.grab(input, ctx, spec, state), spec.binds.held, true);
  }

  onPointerMove(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: PointDragSpec,
    state: BundleState,
  ): BundleState | null {
    if (!this.dragging) return null;
    return this.grab(input, ctx, spec, state);
  }

  onPointerUp(
    _input: PointerInput,
    _ctx: ControllerEventContext,
    spec: PointDragSpec,
    state: BundleState,
  ): BundleState | null {
    this.dragging = false;
    // 잡혔다는 사실만 지운다. 손을 뗀 뒤 무엇으로 돌아갈지는 조각의 step 이 안다.
    return writePath(state, spec.binds.held, false);
  }

  /**
   * 포인터가 짚은 자리를 월드 좌표로 써 넣는다.
   *
   * **잡은 순간의 어긋남을 기억하지 않는다.** 점이 포인터를 그대로 따라간다 —
   * `snapTo` 가 있으면 어긋남은 뜻을 잃고(붙는 자리가 후보로 정해진다), 없을 때도
   * 잡히는 반경이 손잡이만 하므로 튐이 보이지 않는다.
   *
   * 격자 스냅(`ctx.snapWorld`)은 걸지 않는다. 제약이 무엇인지는 조각이 `snapTo` 로
   * 말하는 것이고, 거기에 격자를 겹치면 둘이 조용히 다툰다.
   */
  private grab(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: PointDragSpec,
    state: BundleState,
  ): BundleState {
    const world = ctx.toWorld([input.px, input.py]);
    const next = spec.snapTo && spec.snapTo.length > 0 ? snap(world, spec.snapTo) : world;
    return writePath(state, spec.binds.pos, next);
  }
}
