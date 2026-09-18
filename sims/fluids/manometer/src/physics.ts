// ========================================================================
// manometer — 순수 물리
// ========================================================================
// U자관의 두 입구에 압력 차 Δp 가 걸리면, 정지한 액체 속 같은 높이의 압력은 같아야
// 하므로 두 액면의 높이 차 h 가
//   Δp = ρ · g · h   →   h = Δp / (ρ g)
// 가 되는 자리에서 멈춘다. 두 팔의 굵기가 같아 한쪽이 h/2 내려가면 다른 쪽이 h/2
// 올라간다. 같은 Δp 에서 h 는 밀도에 반비례한다 — 이 조각이 보이는 것은 이것이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { DP_MAX, G, RHO_HEAVY, RHO_LIGHT } from './schema';
import type { ManometerState } from './state';

export interface ManometerConstants {
  /** 가벼운 액체(물)의 밀도(kg/m³). */
  rhoLight: number;
  /** 무거운 액체(수은)의 밀도(kg/m³). */
  rhoHeavy: number;
  /** 중력 가속도(m/s²). */
  g: number;
  /** 기체 쪽이 바깥 공기보다 높아지는 압력 차의 최댓값(Pa). */
  dpMax: number;
}

export function readConstants(stage: StageDef): ManometerConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    rhoLight: c.rhoLight ?? RHO_LIGHT,
    rhoHeavy: c.rhoHeavy ?? RHO_HEAVY,
    g: c.g ?? G,
    dpMax: c.dpMax ?? DP_MAX,
  };
}

/** 압력 차 Δp(Pa)가 밀도 ρ 인 액체에 만드는 두 액면의 높이 차(m). */
export function headDifference(dp: number, rho: number, g: number): number {
  return dp / (rho * g);
}

export interface ManometerReading {
  /** 최댓값에 견준 지금 압력 차 0~1. 화살표 길이와 치수선 짙기가 이것을 따른다. */
  fraction: number;
  /** 지금 압력 차(Pa). */
  dp: number;
  /** 가벼운 액체 · 무거운 액체의 높이 차(m). */
  hLight: number;
  hHeavy: number;
}

/**
 * 압력계를 읽는다. **단계 경계는 선언이 정한다** — 압력이 오르고 빠지는 두 단계의
 * 진행도를 `timeline.at` 에게 묻는다 (S-piece 「시간표는 선언이다」). 머무는 단계에서는
 * 오름이 1, 빠짐이 0 에 머물러 압력 차가 저절로 최대다 — 분기가 필요 없다.
 */
export function readManometer(tl: TimelineFrame, c: ManometerConstants): ManometerReading {
  const fraction = tl.at('press') - tl.at('release');
  const dp = c.dpMax * fraction;
  return {
    fraction,
    dp,
    hLight: headDifference(dp, c.rhoLight, c.g),
    hHeavy: headDifference(dp, c.rhoHeavy, c.g),
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ManometerState }): ManometerState {
  return params.state;
}
