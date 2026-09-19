// ========================================================================
// malus-law — 순수 물리
// ========================================================================
// 세로로 떨리는 진동(길이 1)을 판 축(세로에서 θ 기운 방향)에 투영하면 축 방향 성분은 cos θ 이고,
// 판을 지난 빛의 세기는 진폭의 제곱을 따라 cos² θ 다. 이 두 몫이 조각이 그리는 전부다.
//
// 판의 각은 시간표 단계의 진행도로만 움직인다 — 단계 경계를 코드 상수로 두지 않는다 (S-piece).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { COMPONENT, DEG, INTENSITY, STOP_COUNT } from './schema';
import type { MalusLawState } from './state';

type Five = readonly [number, number, number, number, number];

export interface MalusLawConstants {
  /** 정박 각(°) 다섯. */
  deg: Five;
  /** 정박 세기 몫 다섯 — 글자로 띄우는 선언값. */
  intensity: Five;
  /** 정박 성분 몫 다섯 — 글자로 띄우는 선언값. */
  component: Five;
}

export function readConstants(stage: StageDef): MalusLawConstants {
  const c = (stage.constants ?? {}) as Record<string, number | undefined>;
  const five = (prefix: string, fallback: readonly number[]): Five => {
    const v = (i: number): number => c[`${prefix}${i}`] ?? fallback[i]!;
    return [v(0), v(1), v(2), v(3), v(4)];
  };
  return { deg: five('deg', DEG), intensity: five('int', INTENSITY), component: five('amp', COMPONENT) };
}

/** 선언된 단계 이름 — `schema.timeline` 과 같은 이름이다. 정박 k 마다 머무는 단계와 거기로 가는 돌림. */
export const HOLD_IDS = ['hold0', 'hold1', 'hold2', 'hold3', 'hold4'] as const;
export const TURN_IDS = [null, 'turn1', 'turn2', 'turn3', 'turn4'] as const;
export const RESET_ID = 'reset';

/**
 * 지금 판 축이 세로(들어온 진동)에서 기운 각(°). 돌림 단계마다 이웃 정박 각 사이를 잇고,
 * 되돌림 단계가 마지막 각에서 처음 각으로 되돌린다. 분기가 없다 — `at` 이 단계 전 0 · 뒤 1 이다.
 */
export function plateDeg(tl: TimelineFrame, c: MalusLawConstants): number {
  let deg = c.deg[0];
  for (let k = 1; k < STOP_COUNT; k++) {
    deg += (c.deg[k]! - c.deg[k - 1]!) * tl.at(TURN_IDS[k]!);
  }
  deg -= (c.deg[STOP_COUNT - 1]! - c.deg[0]) * tl.at(RESET_ID);
  return deg;
}

/** 지금 머물러 있는 정박 번호. 돌리는 중이면 -1. */
export function holdIndex(tl: TimelineFrame): number {
  return (HOLD_IDS as readonly string[]).indexOf(tl.phase);
}

/** 정박 k 의 막대가 이번 주기에 이미 섰는가 — 그 머묾 단계가 시작됐는가. */
export function barStanding(tl: TimelineFrame, k: number): boolean {
  return tl.at(HOLD_IDS[k]!) > 0;
}

/** 세운 막대가 남아 있는 정도 1 → 0. 되돌림 동안 사라진다. */
export function barsOpacity(tl: TimelineFrame): number {
  return 1 - tl.at(RESET_ID);
}

const RAD = Math.PI / 180;

/** 축 방향 성분의 몫(진동 = 1) — 투영 길이. */
export function componentShare(deg: number): number {
  return Math.max(0, Math.cos(deg * RAD));
}

/** 지난 세기의 몫(들어온 세기 = 1) — 성분 몫의 제곱. */
export function intensityShare(deg: number): number {
  const a = componentShare(deg);
  return a * a;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: MalusLawState }): MalusLawState {
  return params.state;
}
