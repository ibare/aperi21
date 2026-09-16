// ========================================================================
// uniform-motion — 순수 물리
// ========================================================================
// 등속이므로 적분할 것이 없다. 쌓는 것은 랩 시계 하나이고, 나머지는 모두 그
// 시계에서 읽어 낸다.
// ========================================================================

import {
  BAR_FADE_FLOOR,
  BAR_FADE_IN,
  BAR_TRAVEL,
  FADE_IN,
  FADE_OUT,
  FADE_OUT_START,
  LAP,
  MARK_LIFE,
  STEPS,
} from './schema';
import type { UniformMotionState } from './state';

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** 빠르게 떠나 천천히 도착한다. 원본의 `1 - (1-p)^3`. */
export function easeOut(p: number): number {
  const q = 1 - p;
  return 1 - q * q * q;
}

export function lerp(a: number, b: number, p: number): number {
  return a + (b - a) * p;
}

/**
 * 랩 시계를 민다.
 *
 * 빠르기를 **잡고 있는 동안은 랩이 처음에 머문다.** 옛 간격과 새 간격이 한 줄에
 * 섞이면 이 조각이 부정하려는 바로 그 그림(간격이 들쭉날쭉한 화면)이 된다.
 * 무엇을 되돌릴지는 조각이 정한다 — 엔진은 잡혔다는 사실만 적는다 (원칙 7 ④).
 */
export function step(params: { state: UniformMotionState; dt: number }): UniformMotionState {
  const { state, dt } = params;
  if (state.held) return state.lapT === 0 ? state : { ...state, lapT: 0 };
  let lapT = state.lapT + dt;
  if (lapT >= LAP) lapT -= LAP;
  return { ...state, lapT };
}

/** 랩 한 바퀴에서 읽어 내는 값들. */
export interface LapReading {
  /** 랩 경과 시간(초). */
  lapT: number;
  /** 걸은 시간(초). `STEPS` 에서 멈춘다 — 여섯 걸음이 끝나면 물체도 선다. */
  walked: number;
  /** 지금까지 찍힌 마지막 자국의 번호. 자국은 0..lastMark 까지 있다. */
  lastMark: number;
  /** 랩 경계에서만 잠깐 흐려진다. 진행 구간에서는 늘 1. */
  alpha: number;
}

export function readLap(state: UniformMotionState): LapReading {
  const { lapT } = state;
  const walked = Math.min(lapT, STEPS);
  // 1e-9 — 정확히 정수 초에 자국이 하나 모자라게 세지 않도록.
  const lastMark = Math.floor(walked + 1e-9);
  const alpha =
    lapT > FADE_OUT_START
      ? 1 - clamp01((lapT - FADE_OUT_START) / FADE_OUT)
      : lapT < FADE_IN
        ? clamp01(lapT / FADE_IN)
        : 1;
  return { lapT, walked, lastMark, alpha };
}

/** 자국 k 가 찍힌 뒤 흐른 시간(초). */
export function markAge(lapT: number, k: number): number {
  return lapT - k;
}

/** 방금 찍혔는가 — 강조색과 반원 파동이 붙는 동안. */
export function isFresh(lapT: number, k: number): boolean {
  const age = markAge(lapT, k);
  return age >= 0 && age < MARK_LIFE;
}

/**
 * 자국 k 의 강조 세기 1→0. 원본의 `pulse`.
 * 방금 찍힌 자국이 얼마나 더 길어지는지를 이 값이 정한다.
 */
export function markPulse(lapT: number, k: number): number {
  return isFresh(lapT, k) ? 1 - markAge(lapT, k) / MARK_LIFE : 0;
}

/**
 * 구간 k 의 막대가 제 줄로 내려간 정도 0~1 (이징 적용).
 *
 * 구간 k 는 자국 k 와 k+1 사이다. 자국 k+1 이 찍히는 순간 떨어져 나온다.
 */
export function barProgress(lapT: number, k: number): number {
  return easeOut(clamp01((lapT - (k + 1)) / BAR_TRAVEL));
}

/** 떨어져 나오는 막대의 옅기 0.35→1. 진행도 0.2 즈음에 다 짙어진다. */
export function barFade(progress: number): number {
  return BAR_FADE_FLOOR + (1 - BAR_FADE_FLOOR) * clamp01(progress / BAR_FADE_IN);
}
