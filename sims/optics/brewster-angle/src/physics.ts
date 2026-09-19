// ========================================================================
// brewster-angle — 순수 물리
// ========================================================================
// 공기(n₁)에서 유리(n₂)로 들어오는 빛을 두 떨림으로 나눠 프레넬 반사 계수를 계산한다.
//   s — 입사면에 수직인 떨림(⊙)
//   p — 입사면 안의 떨림(↕)
// 반사되는 세기의 몫이 Rs = rs² · Rp = rp² 이고, rp 는 굴절 줄기가 반사 줄기와 직각이 되는
// 입사각에서 0 이 된다. 이 두 몫이 조각이 그리는 전부다.
//
// 입사각은 시간표 단계의 진행도로만 움직인다 — 단계 경계를 코드 상수로 두지 않는다 (S-piece).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { DEG, N_AIR, N_GLASS, REFLECT_GAIN, RIGHT_DEG } from './schema';
import type { BrewsterAngleState } from './state';

type Three = readonly [number, number, number];

export interface BrewsterAngleConstants {
  nAir: number;
  nGlass: number;
  /** 입사각이 멈춰 서는 자리(°) 셋. 가운데가 브루스터 각의 정박값. */
  deg: Three;
  /** 브루스터 각에서 두 줄기 사이 각(°)의 정박값 — 글자로만 쓴다. */
  rightDeg: number;
  /** 반사 줄기 표식을 키우는 배율. */
  reflectGain: number;
}

export function readConstants(stage: StageDef): BrewsterAngleConstants {
  const c = (stage.constants ?? {}) as Record<string, number | undefined>;
  return {
    nAir: c.nAir ?? N_AIR,
    nGlass: c.nGlass ?? N_GLASS,
    deg: [c.deg0 ?? DEG[0], c.deg1 ?? DEG[1], c.deg2 ?? DEG[2]],
    rightDeg: c.rightDeg ?? RIGHT_DEG,
    reflectGain: c.reflectGain ?? REFLECT_GAIN,
  };
}

/** 선언된 단계 이름 — `schema.timeline` 과 같은 이름이다. */
export const HOLD_IDS = ['hold0', 'hold1', 'hold2'] as const;
export const TURN_IDS = [null, 'turn1', 'turn2'] as const;
export const RESET_ID = 'reset';
/** 두 줄기가 직각을 이루는 머묾 — 정박 자리 번호. */
export const BREWSTER_HOLD = 1;

/**
 * 지금 입사각(°). 키움 단계마다 이웃 정박 각 사이를 잇고, 되돌림 단계가 마지막 각에서 처음 각으로
 * 되돌린다. 분기가 없다 — `at` 이 단계 전 0 · 뒤 1 이다.
 */
export function incidenceDeg(tl: TimelineFrame, c: BrewsterAngleConstants): number {
  let deg = c.deg[0];
  for (let k = 1; k < c.deg.length; k++) {
    deg += (c.deg[k]! - c.deg[k - 1]!) * tl.at(TURN_IDS[k]!);
  }
  deg -= (c.deg[c.deg.length - 1]! - c.deg[0]) * tl.at(RESET_ID);
  return deg;
}

/** 지금 머물러 있는 정박 번호. 각이 움직이는 중이면 -1. */
export function holdIndex(tl: TimelineFrame): number {
  return (HOLD_IDS as readonly string[]).indexOf(tl.phase);
}

const RAD = Math.PI / 180;

export interface Fresnel {
  /** 굴절각(라디안). */
  thetaT: number;
  /** 진폭 반사 계수 — 부호는 떨림이 뒤집히는지다. */
  rs: number;
  rp: number;
  /** 세기 반사 몫. */
  Rs: number;
  Rp: number;
}

/** 입사각(°)에서 프레넬 반사. 공기 → 유리라 전반사가 없다. */
export function fresnel(deg: number, c: BrewsterAngleConstants): Fresnel {
  const ti = deg * RAD;
  const ci = Math.cos(ti);
  const st = (c.nAir / c.nGlass) * Math.sin(ti);
  const thetaT = Math.asin(Math.min(1, st));
  const ct = Math.cos(thetaT);
  const rs = (c.nAir * ci - c.nGlass * ct) / (c.nAir * ci + c.nGlass * ct);
  const rp = (c.nGlass * ci - c.nAir * ct) / (c.nGlass * ci + c.nAir * ct);
  return { thetaT, rs, rp, Rs: rs * rs, Rp: rp * rp };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: BrewsterAngleState }): BrewsterAngleState {
  return params.state;
}
