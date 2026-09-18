// ========================================================================
// relativistic-velocity-addition — 순수 물리
// ========================================================================
// 땅의 틀에서 잰다. s 는 배의 앞머리가 등 옆에 선 순간(쏜 순간)부터 흐른 시각이고,
// `run` 이 끝나면 모두 멈춘다(`fire` + `run` 이 달리는 시간이다)(같은 시간 동안 간 거리를 읽으려고 멈춘 장면이다).
//
//   배의 앞머리          x = x₀ + v · s
//   탄환(땅에서 잰)       x = x₀ + w · s        w = (u′ + v) / (1 + u′v/c²)
//   빛(배 · 등 모두)      x = x₀ + c · s
//   그냥 더했다면         탄환 u′ + v,  배의 빛 c + v
//
// c 는 `fire` + `run` 동안 빛이 `lightReach` 를 가도록 화면 빠르기로 옮긴다. 모든 것이
// 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { BULLET_BETA, LIGHT_REACH, ORIGIN_X, RESULT_BETA, SHIP_BETA } from './schema';
import type { RelativisticVelocityAdditionState } from './state';

export interface VelocityAdditionConstants {
  /** 배의 땅에 대한 빠르기 v/c. */
  shipBeta: number;
  /** 탄환의 배에 대한 빠르기 u′/c. */
  bulletBeta: number;
  /** 화면에 띄울 땅에서 잰 탄환의 빠르기(선언값). */
  resultBeta: number;
  /** 한 번의 달리기 동안 빛이 가는 화면 거리(월드) — 연출 배율. */
  lightReach: number;
}

export function readConstants(stage: StageDef): VelocityAdditionConstants {
  const c = stage.constants ?? {};
  return {
    shipBeta: c.shipBeta ?? SHIP_BETA,
    bulletBeta: c.bulletBeta ?? BULLET_BETA,
    resultBeta: c.resultBeta ?? RESULT_BETA,
    lightReach: c.lightReach ?? LIGHT_REACH,
  };
}

/** 상대론 속도 덧셈 (c = 1). 화면에 띄우지 않는다 — 띄우는 값은 선언값 `resultBeta` 다. */
export function addVelocities(u: number, v: number): number {
  return (u + v) / (1 + u * v);
}

/** 한 시각의 자리들(월드 x). */
export interface RaceFrame {
  /** 쏜 순간부터 흐른 시각(초, 화면). 쏘기 전은 음수, `run` 뒤에는 달리는 시간에서 멈춘다. */
  s: number;
  /** 쏘았는가. */
  fired: boolean;
  /** 쏜 뒤 흐른 시간(초) — 섬광의 나이. 멈춘 뒤에도 계속 흐른다. */
  fireAge: number;
  /** 배 앞머리. */
  shipNose: number;
  /** 탄환. */
  bullet: number;
  /** 빛 앞머리(배가 쏜 빛 · 등이 쏜 빛이 같은 자리다). */
  light: number;
  /** 그냥 더했을 때의 탄환 · 배가 쏜 빛의 자리. */
  naiveBullet: number;
  naiveLight: number;
  /** 화면에서 c 의 빠르기(월드/초). */
  cScreen: number;
  /** 땅에서 잰 탄환의 빠르기(계산값, c = 1). */
  w: number;
}

export function raceFrame(tl: TimelineFrame, c: VelocityAdditionConstants): RaceFrame {
  // 달리는 시간 = 쏘는 순간(`fire`)부터 `run` 끝까지.
  const runLen = tl.end('run') - tl.start('fire');
  const cScreen = c.lightReach / runLen;
  const since = tl.u - tl.start('fire');
  const s = Math.min(since, runLen);
  const w = addVelocities(c.bulletBeta, c.shipBeta);
  const along = (beta: number): number => ORIGIN_X + beta * cScreen * Math.max(0, s);
  return {
    s,
    fired: since >= 0,
    fireAge: Math.max(0, since),
    shipNose: ORIGIN_X + c.shipBeta * cScreen * s,
    bullet: along(w),
    light: along(1),
    naiveBullet: ORIGIN_X + (c.bulletBeta + c.shipBeta) * c.lightReach,
    naiveLight: ORIGIN_X + (1 + c.shipBeta) * c.lightReach,
    cScreen,
    w,
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: RelativisticVelocityAdditionState }): RelativisticVelocityAdditionState {
  return params.state;
}
