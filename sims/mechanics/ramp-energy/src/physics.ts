// ========================================================================
// ramp-energy — 순수 물리
// ========================================================================
// 속력은 오직 **지금까지 내려온 높이**에서 나온다. 길의 모양은 그 높이를 언제
// 내주느냐만 정하지, 다 내준 뒤의 속력은 못 건드린다 — 그래서 에너지 보존이
// 근사가 아니라 구성상 정확하고, 적분 오차는 도착 *시각* 에만 남는다.
//
// 그 계산을 조각이 다시 짜지 않는다. `@aperi21/plugin-mechanics` 의
// `advanceOnPath` 가 `speedFromDrop`(v = √(2g·Δh))으로 속력을 뽑고 길 위의
// 자리만 RK4 로 적분한다 (원칙 1 이 sim 에 허용하는 도메인 plugin 의 순수 계산).
// ========================================================================

import type { EnvironmentDef, StageDef, Vec2 } from '@aperi21/schema';
import { G, advanceOnPath } from '@aperi21/plugin-mechanics';
import { CYCLE_END_X, LANES, RAMP, STROBE, U0 } from './schema';
import { ballsAtStart, type BallState, type RampEnergyState } from './state';

/** 스테이지가 정한 중력(m/s²). */
export function gravityOf(stage: StageDef): number {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return c.g ?? G;
}

/**
 * 길의 모양 — 정규화 매개변수 u∈[0,1] 을 (가로 비율, 내려온 비율)로 옮긴다.
 *
 * 셋은 두 끝점과 낙차가 같고 **높이를 언제 내주는가**만 다르다. 무엇이어야
 * 하는지는 주제가 정한다 — 엔진이 "경사면은 직선" 을 정하면 이 조각은 못 만든다
 * (원본 NOTES 「누가 강제하면 안 되는 것」).
 */
interface Shape {
  fx(u: number): number;
  fy(u: number): number;
}

/** (t − sin t) / (1 − cos t) = ratio 를 푸는 이분법. 사이클로이드의 끝 각. */
function cycloidTheta(ratio: number): number {
  let lo = 0.05;
  let hi = 6.2;
  for (let i = 0; i < 64; i++) {
    const m = (lo + hi) / 2;
    if ((m - Math.sin(m)) / (1 - Math.cos(m)) < ratio) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

function shapeOf(lane: number, drop: number): Shape {
  if (lane === 0) {
    // 먼저 뚝 떨어지고 나중에 완만하다 — 사이클로이드. 가장 먼저 내려선다.
    const te = cycloidTheta(RAMP.dx / drop);
    const kx = te - Math.sin(te);
    const ky = 1 - Math.cos(te);
    return {
      fx: (u) => (te * u - Math.sin(te * u)) / kx,
      fy: (u) => (1 - Math.cos(te * u)) / ky,
    };
  }
  if (lane === 1) {
    // 곧은 비탈.
    return { fx: (u) => u, fy: (u) => u };
  }
  // 처음엔 완만하고 끝에서 떨어진다 — 가장 늦게 내려선다.
  return { fx: (u) => u, fy: (u) => 0.3 * u + 0.7 * u * u };
}

/** 출발 높이(월드 y). 속력은 여기서 얼마나 내려왔는지에서만 나온다. */
export function startYOf(lane: number, drop: number): number {
  return LANES[lane]!.baseY + drop;
}

/**
 * 레인의 길 — 매개변수를 좌표로 옮긴다.
 *
 * **활주로까지 한 줄로 잇는다.** u ≤ 1 은 경사, u > 1 은 수평 활주로다. 활주로에서는
 * 높이가 그대로라 `advanceOnPath` 가 주는 속력이 낙차가 정한 그 값에서 멈추고,
 * 그것이 곧 등속 주행이다 — 착지에 분기를 두지 않아도 된다.
 */
export function pathOf(lane: number, drop: number): (u: number) => Vec2 {
  const shape = shapeOf(lane, drop);
  const baseY = LANES[lane]!.baseY;
  const startY = baseY + drop;
  return (u) =>
    u <= 1
      ? [RAMP.x0 + RAMP.dx * shape.fx(u), startY - drop * shape.fy(u)]
      : [RAMP.x1 + RAMP.dx * (u - 1), baseY];
}

/** 공 하나를 한 걸음 전진시키고, 0.15 초마다 지나온 자리를 남긴다. */
function advance(ball: BallState, lane: number, drop: number, dt: number, g: number): BallState {
  const at = pathOf(lane, drop);
  const u = advanceOnPath(ball.u, dt, { at, startY: startYOf(lane, drop), g });

  let since = ball.since + dt;
  let marks = ball.marks;
  while (since >= STROBE) {
    since -= STROBE;
    marks = [...marks, at(u)];
  }
  return { u, since, marks };
}

export function step(params: {
  state: RampEnergyState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): RampEnergyState {
  const { state, dt, stage } = params;

  // 높이를 다시 정하는 동안은 출발선에 세워 둔다. 경로 중간에 낙차를 바꾸면
  // 이미 내준 높이와 새 낙차가 어긋나 에너지가 맞지 않는다 — 놓으면 새 높이로
  // 처음부터 굴린다. 무엇으로 돌아갈지는 조각이 안다 (`heldPath`).
  if (state.held) {
    const staged = !state.allOnFloor && state.balls.every((b) => b.u === U0 && b.marks.length === 0);
    return staged ? state : { ...state, allOnFloor: false, balls: ballsAtStart() };
  }

  const g = gravityOf(stage);
  const balls = state.balls.map((ball, lane) => advance(ball, lane, state.drop, dt, g));

  // 셋 다 화면을 벗어나면 점을 지우고 같은 높이에서 다시 출발한다. **시각이 아니라
  // 상태로 판정하므로** 낙차를 바꿔 사이클 길이가 달라져도 알아서 맞는다.
  const allOut = balls.every((ball, lane) => pathOf(lane, state.drop)(ball.u)[0] > CYCLE_END_X);
  if (allOut) return { ...state, allOnFloor: false, balls: ballsAtStart() };

  // 셋 다 활주로에 내려섰는가 — 캡션이 이 자리를 본다. 조건을 세는 것은 여기이고
  // 선언은 결과가 놓인 자리만 가리킨다 (원칙 2).
  return { ...state, allOnFloor: balls.every((ball) => ball.u >= 1), balls };
}
