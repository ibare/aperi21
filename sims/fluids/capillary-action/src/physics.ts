// ========================================================================
// capillary-action — 순수 물리
// ========================================================================
// 원본의 `derived` · `advance` · `tubePressure` 를 그대로 옮겼다.
// ========================================================================

import {
  BASIN,
  COLOR_GAMMA,
  DEPTH,
  EQ_TOL,
  G,
  LIQUIDS,
  PRE_ROLL,
  PX_PER_MM,
  RADII,
  SUBSTEPS,
  THIN_TUBE_SHOW_TAU,
  Y0,
  type LiquidKey,
} from './schema';
import type { CapillaryActionState } from './state';

export interface LiquidDerived {
  rho: number;
  mu: number;
  cos: number;
  /** 메니스커스가 만드는 압력차(부호 포함, Pa). 관마다. */
  pCap: readonly number[];
  /** 목표 높이(m). 관마다. */
  hEq: readonly number[];
  /** 화면 초 → 실제 초 배율. */
  slow: number;
  /** 색 정규화 기준 — 가장 큰 |압력|(가는 관 메니스커스 또는 대야 바닥). */
  pMax: number;
}

function derive(key: LiquidKey): LiquidDerived {
  const L = LIQUIDS[key];
  const cos = Math.cos((L.theta * Math.PI) / 180);
  const pCap = RADII.map((r) => (2 * L.gamma * cos) / r);
  const hEq = pCap.map((p) => p / (L.rho * G));
  const r0 = RADII[0];
  // 가장 가는 관의 시간상수(기둥 길이는 오른 높이 + 잠긴 깊이, 내려가면 잠긴 깊이)를 화면 1.6 초로.
  const tauReal = (8 * L.mu * (Math.max(hEq[0]!, 0) + DEPTH)) / (r0 * r0 * L.rho * G);
  const slow = tauReal / THIN_TUBE_SHOW_TAU;
  const basinDepthM = (BASIN.bottom - Y0) / PX_PER_MM / 1000;
  const pMax = Math.max(Math.abs(pCap[0]!), L.rho * G * basinDepthM);
  return { rho: L.rho, mu: L.mu, cos, pCap, hEq, slow, pMax };
}

const DERIVED: Readonly<Record<LiquidKey, LiquidDerived>> = {
  water: derive('water'),
  mercury: derive('mercury'),
};

export function liquidOf(key: LiquidKey): LiquidDerived {
  return DERIVED[key];
}

/** 기둥 높이를 화면 초 `dtShow` 만큼 전진한다 (루카스-워시번: 메니스커스 압력차 − 기둥 무게, 푸아죄유 저항). */
export function advance(key: LiquidKey, h: readonly number[], dtShow: number): number[] {
  const d = DERIVED[key];
  const sub = (dtShow * d.slow) / SUBSTEPS;
  return h.map((h0, i) => {
    const r = RADII[i]!;
    let hi = h0;
    for (let k = 0; k < SUBSTEPS; k++) {
      const len = Math.max(hi + DEPTH, 0.001);
      const v = (r * r * (d.pCap[i]! - d.rho * G * hi)) / (8 * d.mu * len);
      hi += v * sub;
    }
    return hi;
  });
}

/** 관 안 압력(Pa): 관 아래 끝(정수압 ρgd)과 메니스커스 바로 아래(−pCap) 사이 선형. `yM` 은 바깥 수면 위 높이(m). */
export function tubePressure(d: LiquidDerived, i: number, h: number, yM: number): number {
  const pBot = d.rho * G * DEPTH;
  const pTop = -d.pCap[i]!;
  const f = (yM + DEPTH) / (h + DEPTH);
  return pBot + (pTop - pBot) * f;
}

/** 대야 속 압력(Pa). `depthM` 은 바깥 수면 아래 깊이(m). */
export function basinPressure(d: LiquidDerived, depthM: number): number {
  return d.rho * G * depthM;
}

/** 압력 → 색 값(−1 ~ 1). 액체마다 `pMax` 로 정규화하고 감마 0.6 을 건다 (원본 `pressureColor`). */
export function colorValue(p: number, pMax: number): number {
  const s = Math.max(-1, Math.min(1, p / pMax));
  return Math.sign(s) * Math.pow(Math.abs(s), COLOR_GAMMA);
}

function withFlags(s: Omit<CapillaryActionState, 'waterSettled' | 'mercuryFalling' | 'mercurySettled'>): CapillaryActionState {
  const d = DERIVED[s.applied];
  const settled = s.h.every((h, i) => Math.abs(h - d.hEq[i]!) <= EQ_TOL * Math.abs(d.hEq[i]!));
  const mercury = s.applied === 'mercury';
  return {
    ...s,
    waterSettled: !mercury && settled,
    mercuryFalling: mercury && !settled,
    mercurySettled: mercury && settled,
  };
}

/**
 * 고른 액체로 관을 담근다 — 기둥을 0 에서 시작해 `prerollShow` 화면 초를 미리 적분한다.
 * 처음 열 때는 선언의 `preroll` 이 굴리므로 0, 다시 담글 때는 원본처럼 0.08.
 */
export function dip(key: LiquidKey, prerollShow = 0, held = false): CapillaryActionState {
  return withFlags({
    liquid: key,
    applied: key,
    h: advance(key, [0, 0, 0], prerollShow),
    chipHeld: held,
    chipWasHeld: held,
  });
}

export function step(params: { state: CapillaryActionState; dt: number }): CapillaryActionState {
  const { state, dt } = params;
  // 다른 액체를 골랐거나 칩을 새로 눌렀으면(같은 칸이어도) 다시 담근다.
  const pressed = state.chipHeld && !state.chipWasHeld;
  const base = state.liquid !== state.applied || pressed ? dip(state.liquid, PRE_ROLL, state.chipHeld) : state;
  return withFlags({
    liquid: base.liquid,
    applied: base.applied,
    h: advance(base.applied, base.h, dt),
    chipHeld: state.chipHeld,
    chipWasHeld: state.chipHeld,
  });
}
