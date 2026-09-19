// ========================================================================
// snells-law — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 진행도의 함수이고 `step` 은 항등이다.
//
// 꺾인 각은 n₁ sinθ₁ = n₂ sinθ₂ 에서 나온다. 들어오는 쪽이 공기라 임계각이 없어
// 전반사는 일어나지 않는다 — 전반사는 이웃 `total-internal-reflection` 의 몫이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ANGLE_DIGITS,
  DIAMOND_DEG,
  GLASS_DEG,
  INCIDENT_DEG,
  INDEX_DIGITS,
  N_AIR,
  N_DIAMOND,
  N_GLASS,
  N_WATER,
  WATER_DEG,
} from './schema';
import type { SnellsLawState } from './state';

export const DEG = Math.PI / 180;

export interface SnellsLawConstants {
  nAir: number;
  nWater: number;
  nGlass: number;
  nDiamond: number;
  incidentDeg: number;
  waterDeg: number;
  glassDeg: number;
  diamondDeg: number;
  angleDigits: number;
  indexDigits: number;
}

export function readConstants(stage?: StageDef): SnellsLawConstants {
  const c = (stage?.constants ?? {}) as Record<string, number | undefined>;
  return {
    nAir: c.nAir ?? N_AIR,
    nWater: c.nWater ?? N_WATER,
    nGlass: c.nGlass ?? N_GLASS,
    nDiamond: c.nDiamond ?? N_DIAMOND,
    incidentDeg: c.incidentDeg ?? INCIDENT_DEG,
    waterDeg: c.waterDeg ?? WATER_DEG,
    glassDeg: c.glassDeg ?? GLASS_DEG,
    diamondDeg: c.diamondDeg ?? DIAMOND_DEG,
    angleDigits: c.angleDigits ?? ANGLE_DIGITS,
    indexDigits: c.indexDigits ?? INDEX_DIGITS,
  };
}

/** 스넬 — 공기(n₁)에서 n₂ 로 들어갈 때 꺾인 각(라디안). 들어가는 쪽이 더 빽빽하면 늘 답이 있다. */
export function refractedAngle(n1: number, n2: number, incident: number): number {
  const s = (n1 / n2) * Math.sin(incident);
  return Math.asin(Math.max(-1, Math.min(1, s)));
}

/** 아래 매질 셋. 순서가 곧 시간표의 차례다 (목록 길이가 코드에 있다 — NOTES (c) G105). */
export type MediumId = 'water' | 'glass' | 'diamond';
export const MEDIA: readonly MediumId[] = ['water', 'glass', 'diamond'];

export function indexOf(c: SnellsLawConstants, m: MediumId): number {
  return m === 'water' ? c.nWater : m === 'glass' ? c.nGlass : c.nDiamond;
}

export interface Reading {
  /** 들어오는 각 · 지금 꺾인 각(라디안). */
  incident: number;
  refracted: number;
  /** 매질마다 「지금 이 매질이다」 의 무게 0~1. 셋의 합은 1 이다 — 이름 줄의 짙기. */
  weight: Record<MediumId, number>;
  /** 떠난 매질의 옅은 줄기 무게 0~1 (물 · 유리만 남는다). */
  ghost: { water: number; glass: number };
  /** 지금 한 매질에 머무는 단계인가 — 꺾인 각 글자를 띄운다. */
  settled: boolean;
}

/**
 * 시간표 진행도 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` 는 그 단계 앞에서 0, 지난 뒤 1 이라
 * 바뀌는 단계의 진행도를 더하기만 하면 지금 굴절률이 나온다.
 */
export function derive(tl: TimelineFrame, c: SnellsLawConstants): Reading {
  const toGlass = tl.at('toGlass');
  const toDiamond = tl.at('toDiamond');
  const reset = tl.at('reset');

  const n2 =
    c.nWater +
    (c.nGlass - c.nWater) * toGlass +
    (c.nDiamond - c.nGlass) * toDiamond +
    (c.nWater - c.nDiamond) * reset;
  const incident = c.incidentDeg * DEG;

  return {
    incident,
    refracted: refractedAngle(c.nAir, n2, incident),
    weight: {
      water: 1 - toGlass + reset,
      glass: toGlass - toDiamond,
      diamond: toDiamond - reset,
    },
    ghost: {
      water: toGlass * (1 - reset),
      glass: toDiamond * (1 - reset),
    },
    settled: (MEDIA as readonly string[]).includes(tl.phase),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: SnellsLawState }): SnellsLawState {
  return params.state;
}
