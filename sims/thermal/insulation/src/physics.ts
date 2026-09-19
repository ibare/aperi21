// ========================================================================
// insulation — 순수 물리
// ========================================================================
// 컵마다 뉴턴 냉각이다. 감쌈을 건너 빠져나가는 열이 바깥과의 온도 차에 비례하면
//   T(s) = T바깥 + (T처음 − T바깥) · e^(−k·s)
// 이고(s 는 식기 시작한 뒤 흐른 시간, k 는 감쌈의 통과율), 빠져나간 열의 몫은 1 − e^(−k·s) 다.
// 물이 같으니 세 컵을 가르는 것은 k 하나뿐이다.
//
// 모든 것이 시각의 닫힌 식이라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  AXIS_MAX,
  AXIS_MIN,
  GRAIN_FADE_SHARE,
  GRAIN_TRAVEL,
  K_BARE,
  K_CLOTH,
  K_FOAM,
  PACKETS,
  SEED,
  T_OUTSIDE,
  T_START,
} from './schema';
import type { InsulationState } from './state';

export interface InsulationConstants {
  /** 처음 온도 · 바깥 온도(℃). */
  tStart: number;
  tOutside: number;
  /** 감쌈마다 통과율(1/초). */
  kBare: number;
  kCloth: number;
  kFoam: number;
  /** 다 식을 때까지의 알갱이 수 · 알갱이 하나의 이동 시간(초) · 옅어지는 몫 · 자리 시드. */
  packets: number;
  grainTravel: number;
  grainFadeShare: number;
  seed: number;
  /** 온도 눈금의 아래 · 위 끝(℃). */
  axisMin: number;
  axisMax: number;
}

export function readConstants(stage: StageDef): InsulationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    tStart: c.tStart ?? T_START,
    tOutside: c.tOutside ?? T_OUTSIDE,
    kBare: c.kBare ?? K_BARE,
    kCloth: c.kCloth ?? K_CLOTH,
    kFoam: c.kFoam ?? K_FOAM,
    packets: c.packets ?? PACKETS,
    grainTravel: c.grainTravel ?? GRAIN_TRAVEL,
    grainFadeShare: c.grainFadeShare ?? GRAIN_FADE_SHARE,
    seed: c.seed ?? SEED,
    axisMin: c.axisMin ?? AXIS_MIN,
    axisMax: c.axisMax ?? AXIS_MAX,
  };
}

/** 감쌈 셋. 왼쪽부터 놓이는 순서다. */
export type WrapId = 'bare' | 'cloth' | 'foam';
export const WRAPS: readonly WrapId[] = ['bare', 'cloth', 'foam'];

/** 그 감쌈의 통과율(1/초). */
export function rateOf(id: WrapId, c: InsulationConstants): number {
  return id === 'bare' ? c.kBare : id === 'cloth' ? c.kCloth : c.kFoam;
}

/**
 * 식기 시작한 뒤 흐른 시간(초). 식는 시계는 `early` 가 시작한 순간 출발해 `late` 가 끝나는
 * 순간 멈춘다 — 그 길이가 세 컵에 똑같이 주어진 「같은 시간」 이다. 시각도 선언이 안다.
 */
export function coolTime(tl: TimelineFrame): number {
  return Math.min(Math.max(0, tl.u - tl.start('early')), coolSpan(tl));
}

/** 세 컵에 주어진 같은 시간(초) — 곡선 판이 담는 시간이다. */
export function coolSpan(tl: TimelineFrame): number {
  return tl.end('late') - tl.start('early');
}

/**
 * 식는 시계를 멈추지 않고 읽은 시간(초). 멈춘 뒤에도 이미 떠난 알갱이는 제 길을 마저 가야
 * 해서 알갱이의 자리에만 쓴다 — 새로 떠나는 알갱이는 없다.
 */
export function grainClock(tl: TimelineFrame): number {
  return Math.max(0, tl.u - tl.start('early'));
}

/** 식기 시작한 뒤 s 초의 물 온도(℃). */
export function tempAt(k: number, s: number, c: InsulationConstants): number {
  return c.tOutside + (c.tStart - c.tOutside) * Math.exp(-k * s);
}

/**
 * 알갱이 n 이 떠나는 시각(식기 시작한 뒤 초). 빠져나간 열의 몫 1 − e^(−k·s) 가
 * (n + ½)/packets 를 넘는 순간이다. 통과율이 크면 촘촘하게, 작으면 드물게 떠난다 —
 * 같은 시간에 떠난 알갱이 수가 곧 빠져나간 열이다.
 */
export function departTime(n: number, k: number, c: InsulationConstants): number {
  const share = (n + 0.5) / c.packets;
  return -Math.log(1 - share) / k;
}

/**
 * 알갱이의 짙기 0~1 — 이동 진행도 p 의 함수. 벽을 건너는 동안은 짙고, 마지막
 * `grainFadeShare` 몫 동안 바깥 공기로 옅어진다. 알갱이마다 시각이 달라 시간표 단계로
 * 풀 수 없어 그 몫을 스테이지 상수로 둔다 (NOTES (c)).
 */
export function grainOpacity(p: number, c: InsulationConstants): number {
  const fade = (1 - p) / c.grainFadeShare;
  return fade > 1 ? 1 : fade < 0 ? 0 : fade;
}

/**
 * 시드 결정적 난수 0~1 — (시드, 번호, 갈래)의 함수다. 호출 순서에 상태가 없어서
 * `?t=` 로 연 화면과 실시간 화면이 같다 (S-sim).
 */
export function hash01(seed: number, n: number, lane: number): number {
  let h =
    Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(n + 1, 0x85ebca6b) ^ Math.imul(lane + 1, 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 다시 담는다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: InsulationState }): InsulationState {
  return params.state;
}
