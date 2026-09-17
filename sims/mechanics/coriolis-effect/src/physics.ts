// ========================================================================
// coriolis-effect — 순수 물리
// ========================================================================
// 사건은 하나다 — 원판 한가운데서 그 순간의 과녁을 향해 던진 공. 판마다 다른 것은
// 그 공의 자리를 무엇에 대해 재느냐뿐이다. 바깥에서는 던진 방향 그대로 곧게,
// 원판 위에서는 같은 점을 원판이 돈 만큼 되돌려 본다.
//
// 좌표는 원본 화면 단위(판 중심 기준, y 아래로 +)다. 월드로의 뒤집기는 scene 이 한다.
// ========================================================================

import type { TimelineFrame } from '@aperi21/schema';
import { AIM, FLIGHT, OMEGA, R, START_AT } from './schema';
import type { CoriolisEffectState } from './state';

export type Frame = 'outside' | 'onDisk';

export interface Throw {
  /** 이번 공을 던진 시각 (원본 페이지 시계, 앞당기기 전). */
  t0: number;
  /** 던진 뒤 흐른 비행 시간. 착지 뒤에는 FLIGHT 에 멈춘다. */
  tau: number;
  /** 길과 공의 알파. 착지 뒤 1→0. */
  fade: number;
}

/** 원본 페이지 시계. 엔진 시계는 `startAt` 만큼 앞당겨져 있다. */
export function pageTime(tl: TimelineFrame): number {
  return tl.t - START_AT;
}

/** 원판이 돈 각도. */
export function diskAngle(t: number): number {
  return OMEGA * t;
}

/** 시간표에서 이번 주기의 던지기를 읽는다. */
export function readThrow(tl: TimelineFrame): Throw {
  return {
    t0: pageTime(tl) - tl.u,
    tau: tl.at('fly') * FLIGHT,
    fade: 1 - tl.at('fade'),
  };
}

/** 던진 지 tau 초 뒤 공의 자리 (판 중심 기준, 원본 화면 좌표). */
export function ballOffset(frame: Frame, t0: number, tau: number): [number, number] {
  const r = (R * tau) / FLIGHT;
  const ang = frame === 'outside' ? AIM + OMEGA * t0 : AIM + OMEGA * t0 - OMEGA * (t0 + tau);
  return [r * Math.cos(ang), r * Math.sin(ang)];
}

/** 쌓는 상태가 없다. */
export function step(params: { state: CoriolisEffectState }): CoriolisEffectState {
  return params.state;
}
