// ========================================================================
// centripetal-force — 순수 운동학
// ========================================================================
// 월드 좌표(회전 중심 원점, y 위). 공은 반시계로 돈다.
// ========================================================================

import {
  FIRST_RELEASE_ANGLE,
  FLY,
  HOLD,
  OMEGA,
  RADIUS,
  RELEASE_ANGLE_STEP,
  RELEASED,
  SPEED,
} from './schema';
import type { CentripetalForceState } from './state';

/** k 번째(0 부터) 놓임에서 공이 놓이는 각 — 원본이 자동으로 놓던 각. */
export function releaseAngle(k: number): number {
  return FIRST_RELEASE_ANGLE + RELEASE_ANGLE_STEP * k;
}
/** 단계 끝 판정의 여유 — 원본과 같은 값. */
const EPS = 1e-9;
/** 한 걸음 안에서 단계가 바뀌는 횟수의 상한. 폭주 방지일 뿐이다. */
const MAX_SWITCHES = 16;

/** 각 θ 에서 묶인 공의 자리. */
export function onCircle(theta: number): [number, number] {
  return [RADIUS * Math.cos(theta), RADIUS * Math.sin(theta)];
}

/** 지금 자리에서 줄을 놓는다. 반시계 회전의 접선 방향 = 반지름 방향을 90° 돌린 것. */
function release(s: CentripetalForceState): void {
  s.released = true;
  s.releases += 1;
  s.elapsed = 0;
  s.releasePos = [s.pos[0], s.pos[1]];
  s.releaseVel = [-SPEED * Math.sin(s.theta), SPEED * Math.cos(s.theta)];
}

/**
 * 다시 묶는다. 출발각은 **역산**한다 — 묶임 단계를 다 돌았을 때 다음 놓는 각에 닿도록.
 * 단추로 놓은 주기도 그 자리에서 놓였을 뿐, 다음 주기는 이 흐름으로 돌아온다.
 */
function reattach(s: CentripetalForceState): void {
  s.released = false;
  s.elapsed = 0;
  s.theta = releaseAngle(s.releases) - OMEGA * HOLD;
  s.pos = onCircle(s.theta);
}

/**
 * 한 걸음. 단계 경계를 걸음 안에서 **정확히 쪼갠다** — 러너의 걸음 크기가 기기마다
 * 달라도 같은 시각에 같은 자리에서 놓인다.
 *
 * 「지금 놓기」 누름은 걸음 첫머리에서 소비하고 언제나 지운다. 이미 놓인 때는 무시한다.
 */
export function step(params: { state: CentripetalForceState; dt: number }): CentripetalForceState {
  const { state, dt } = params;
  const s: CentripetalForceState = { ...state, pos: [state.pos[0], state.pos[1]] };

  if (s.pressed) {
    s.pressed = false;
    if (!s.released) release(s);
  }

  let remaining = dt;
  for (let i = 0; i <= MAX_SWITCHES && remaining > 0; i++) {
    const left = Math.max(0, (s.released ? RELEASED : HOLD) - s.elapsed);
    const h = Math.min(remaining, left);

    if (!s.released) s.theta += OMEGA * h;
    s.elapsed += h;
    remaining -= h;
    if (s.released) {
      // 놓인 순간 속도로 곧게 — 비행 시간(자취 끝)까지만 가고, 흐려지는 동안은 그 끝에 있다.
      const flown = Math.min(s.elapsed, FLY);
      s.pos = [s.releasePos[0] + s.releaseVel[0] * flown, s.releasePos[1] + s.releaseVel[1] * flown];
    } else {
      s.pos = onCircle(s.theta);
    }

    if (s.elapsed >= (s.released ? RELEASED : HOLD) - EPS) {
      if (s.released) reattach(s);
      else release(s);
    }
  }
  return s;
}
