// ========================================================================
// dispersion — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 진행도의 함수이고 `step` 은 항등이다.
//
// 굴절률 n(λ) 은 세 정박점(빨강 · 파랑 · 보라)을 x = 1/λ² 에 대한 이차식으로 잇는다 —
// 코시 식의 앞 세 항과 같은 꼴이다. 세 점을 정확히 지나므로 화면 글자(정박값)와 곡선이 어긋나지 않는다.
// 꺾인 각은 n₁ sinθ₁ = n(λ) sinθ₂ 에서 나오고, 화면에는 빨강 각을 기준으로 벗어난 몫을
// `spreadGain` 배 키운 각을 긋는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  INCIDENT_DEG,
  INDEX_DIGITS,
  N_AIR,
  N_BLUE,
  N_RED,
  N_VIOLET,
  NM_BLUE,
  NM_RED,
  NM_VIOLET,
  RAY_COUNT,
  SPREAD_GAIN,
} from './schema';
import type { DispersionState } from './state';

export const DEG = Math.PI / 180;

export interface DispersionConstants {
  nAir: number;
  incidentDeg: number;
  nmRed: number;
  nRed: number;
  nmBlue: number;
  nBlue: number;
  nmViolet: number;
  nViolet: number;
  rayCount: number;
  spreadGain: number;
  indexDigits: number;
}

export function readConstants(stage?: StageDef): DispersionConstants {
  const c = (stage?.constants ?? {}) as Record<string, number | undefined>;
  return {
    nAir: c.nAir ?? N_AIR,
    incidentDeg: c.incidentDeg ?? INCIDENT_DEG,
    nmRed: c.nmRed ?? NM_RED,
    nRed: c.nRed ?? N_RED,
    nmBlue: c.nmBlue ?? NM_BLUE,
    nBlue: c.nBlue ?? N_BLUE,
    nmViolet: c.nmViolet ?? NM_VIOLET,
    nViolet: c.nViolet ?? N_VIOLET,
    rayCount: c.rayCount ?? RAY_COUNT,
    spreadGain: c.spreadGain ?? SPREAD_GAIN,
    indexDigits: c.indexDigits ?? INDEX_DIGITS,
  };
}

/**
 * 유리의 굴절률 n(λ). 세 정박점을 x = 1/λ² 에 대해 라그랑주 이차 보간한다.
 * 정박점 목록 셋이 이름으로 흩어져 있다 (NOTES (c) G105).
 */
export function indexAt(c: DispersionConstants, nm: number): number {
  const xs = [c.nmRed, c.nmBlue, c.nmViolet].map((l) => 1 / (l * l));
  const ns = [c.nRed, c.nBlue, c.nViolet];
  const x = 1 / (nm * nm);
  let n = 0;
  for (let i = 0; i < 3; i++) {
    let term = ns[i]!;
    for (let j = 0; j < 3; j++) {
      if (j !== i) term *= (x - xs[j]!) / (xs[i]! - xs[j]!);
    }
    n += term;
  }
  return n;
}

/** 스넬 — 공기에서 n₂ 로 들어갈 때 꺾인 각(라디안). 들어가는 쪽이 빽빽해 늘 답이 있다. */
export function refractedAngle(n1: number, n2: number, incident: number): number {
  const s = (n1 / n2) * Math.sin(incident);
  return Math.asin(Math.max(-1, Math.min(1, s)));
}

/**
 * 화면에 긋는 꺾인 각(라디안). 빨강 줄기의 참 각을 기준으로, 그 파장이 벗어난 몫을
 * `spreadGain` 배 키운다. 빨강은 참 각 그대로다.
 */
export function shownAngle(c: DispersionConstants, nm: number): number {
  const incident = c.incidentDeg * DEG;
  const base = refractedAngle(c.nAir, c.nRed, incident);
  const real = refractedAngle(c.nAir, indexAt(c, nm), incident);
  return base + c.spreadGain * (real - base);
}

/** 유리 속 색 줄기들의 파장 — 보라 정박점에서 빨강 정박점까지 고르게. */
export function rayWavelengths(c: DispersionConstants): number[] {
  const count = Math.max(2, Math.round(c.rayCount));
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(c.nmViolet + ((c.nmRed - c.nmViolet) * i) / (count - 1));
  return out;
}

export interface Reading {
  /** 들어오는 흰 줄기가 입사점까지 자란 몫 0~1. */
  beamIn: number;
  /** 색 줄기가 유리 속으로 자란 몫 0~1. */
  raysOut: number;
  /** 줄기 전체의 짙기 0~1 — 주기 끝에 옅어진다. */
  visible: number;
  /** 짚기의 무게 0~1 — 짚은 줄기 하나만 짙고 나머지가 옅어지는 정도. */
  focus: number;
  /** 지금 짚은 파장(nm). */
  scanNm: number;
}

/**
 * 시간표 진행도 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다.
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` 가 그 단계 앞에서 0, 지난 뒤 1 이다.
 */
export function derive(tl: TimelineFrame, c: DispersionConstants): Reading {
  return {
    beamIn: tl.at('enter'),
    raysOut: tl.at('split'),
    visible: 1 - tl.at('fade'),
    focus: tl.at('focus') - tl.at('unfocus'),
    scanNm: c.nmRed + (c.nmViolet - c.nmRed) * tl.at('scan'),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: DispersionState }): DispersionState {
  return params.state;
}
