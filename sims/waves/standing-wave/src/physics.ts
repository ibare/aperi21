// ========================================================================
// standing-wave — 순수 물리
// ========================================================================

import type { TimelineFrame } from '@aperi21/schema';
import { NODE_SHIFT, PERIOD } from './schema';
import type { StandingWaveState } from './state';

const OMEGA = (2 * Math.PI) / PERIOD;

/** 파장 단위 위치 u 의 위상. 마디가 가장자리에 붙지 않도록 1/8 파장 밀어 둔다. */
const kx = (u: number): number => 2 * Math.PI * (u - NODE_SHIFT);

/** 오른쪽으로 가는 성분 파동(진폭 1). */
export const rightWave = (u: number, t: number): number => Math.sin(kx(u) - OMEGA * t);
/** 왼쪽으로 가는 성분 파동(진폭 1). */
export const leftWave = (u: number, t: number): number => Math.sin(kx(u) + OMEGA * t);

/** 원본 시간표 이징 `smooth` 와 같은 곡선. 과거 시각의 진행도를 엔진에 물을 자리가 없어 다시 쓴다. */
const smooth = (x: number): number => x * x * (3 - 2 * x);
const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

/**
 * 반대 방향 파동의 진폭 비율 — 지금 시각. 시간표 진행도로만 읽는다.
 * 정상파 구간은 둘 다 0(앞) 또는 둘 다 1(뒤)이라 1, 한 방향 구간은 1 − 1 + 0 = 0.
 */
export function leftAmpNow(tl: TimelineFrame): number {
  return 1 - tl.at('removing') + tl.at('adding');
}

/**
 * 반대 방향 파동의 진폭 비율 — **임의 시각 t'**. 무늬의 과거 행이 쓴다.
 * 단계 경계 · 길이는 선언에서 읽는다(`start` · `duration`). 엔진이 다른 시각의 진행도를
 * 돌려주지 않아 이 곡선만 조각이 다시 계산한다 (장부 G59).
 */
export function leftAmpAt(tl: TimelineFrame, t: number): number {
  const s = ((t % tl.period) + tl.period) % tl.period;
  const rm = smooth(clamp01((s - tl.start('removing')) / tl.duration('removing')));
  const ad = smooth(clamp01((s - tl.start('adding')) / tl.duration('adding')));
  return 1 - rm + ad;
}

/** 마디가 제자리에 있는 구간 — 반대 방향 진폭이 정확히 같을 때만. */
export function isStanding(tl: TimelineFrame): boolean {
  return tl.phase === 'standing' || tl.phase === 'standing-tail';
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: StandingWaveState }): StandingWaveState {
  return params.state;
}
