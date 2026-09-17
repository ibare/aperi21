// ========================================================================
// atwood-machine — 순수 물리
// ========================================================================

import { BASE_SIDE, DIFF_LEFT, DROP, G, PERIOD, TOTAL } from './schema';
import type { AtwoodMachineState } from './state';

/** 조절기 값을 0.1 kg 간격에 붙인다 — 0.30000000000000004 가 같음 판정을 깨지 않게. */
export function snapDiff(diff: number): number {
  return Math.round(diff * 10) / 10;
}

/** 합을 유지한 채 두 추로 나눈다. */
export function masses(diff: number): { heavy: number; light: number } {
  return { heavy: (TOTAL + diff) / 2, light: (TOTAL - diff) / 2 };
}

/** a = 차이·g/합. */
export function accel(diff: number): number {
  return (diff * G) / TOTAL;
}

/** 무거운 추가 DROP 을 내려오는 데 걸리는 시간. 가속도가 0 이면 닿지 않는다. */
export function landTime(a: number): number {
  return a > 0 ? Math.sqrt((2 * DROP) / a) : Infinity;
}

/** 주기 안 시각 tau 에 내려온 거리. 바닥에서 멈춘다. */
export function fallen(a: number, tau: number): number {
  return Math.min(DROP, 0.5 * a * tau * tau);
}

/** 추 한 변(월드 m). 질량의 세제곱근에 비례, 3.0 kg 이 BASE_SIDE. */
export function side(m: number): number {
  return BASE_SIDE * Math.cbrt(m / 3.0);
}

/** 주기 안 시각을 [0, PERIOD) 로 되감는다. */
export function wrapTau(tau: number): number {
  const r = tau % PERIOD;
  return r < 0 ? r + PERIOD : r;
}

/**
 * 조절기 값과 주기 안 시각에서 캡션이 읽는 조건과 수를 정한다.
 *
 * 원본의 판정 그대로다 — 착지 시각 이상이면 닿았다. 오른쪽이 한 주기 안에 닿지 못하면
 * (차이 0.1) 왼쪽만 닿은 문장이 주기 끝까지 남는다.
 */
export function derive(rawDiff: number, tau: number, held: boolean): AtwoodMachineState {
  const diff = snapDiff(rawDiff);
  const tL = landTime(accel(DIFF_LEFT));
  const tR = landTime(accel(diff));
  const leftLanded = tau >= tL;
  const rightLanded = tau >= tR;
  return {
    diff,
    held,
    tau,
    still: diff === 0,
    equal: diff === DIFF_LEFT,
    bothLanded: leftLanded && rightLanded,
    rightOnlyLanded: rightLanded && !leftLanded,
    leftOnlyLanded: leftLanded && !rightLanded,
    ratioText: (diff / DIFF_LEFT).toFixed(1),
    tLeftText: tL.toFixed(2),
    tRightText: Number.isFinite(tR) ? tR.toFixed(2) : '',
  };
}

/**
 * 주기 안 시각만 적분한다. 조절기를 잡는 동안은 0 — 러너가 값이 바뀔 때마다 시계를 0 으로
 * 되돌리므로(`restart`), 놓는 순간 두 시각이 함께 0 에서 흐른다.
 */
export function step(params: { state: AtwoodMachineState; dt: number }): AtwoodMachineState {
  const s = params.state;
  const tau = s.held ? 0 : wrapTau(s.tau + params.dt);
  return derive(s.diff, tau, s.held);
}
