// ========================================================================
// muon-decay-evidence — 순수 물리
// ========================================================================
// 지상 틀에서 잰다. 월드 세로 단위는 km.
//
//   반감기 동안 가는 거리   시간이 그대로면   ℓ₀ = β · c · t½         (≈ 0.44 km)
//                           실제(시간 지연)   ℓ  = γ · ℓ₀              (≈ 2.2 km)
//   뮤온 i 의 제 수명       τᵢ = nᵢ · t½     nᵢ = −log₂ uᵢ  (반감기 수)
//   뮤온 i 가 붕괴하는 거리  dᵢ = nᵢ · ℓ       (기둥마다 ℓ₀ 또는 ℓ)
//
// 두 기둥은 **같은 뮤온**(같은 uᵢ · 자리)이다 — 다른 것은 반감기 동안 가는 거리뿐이다.
// 모든 것이 (시드, 주기 번호, 떨어진 거리)의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  BETA,
  CLASSICAL_HALF_M,
  DILATED_HALF_KM,
  GAMMA_SHOWN,
  HALF_LIFE_US,
  HEIGHT_KM,
  LIGHT_KM_PER_US,
  MUON_COUNT,
  SEED,
  START_BAND_KM,
  STRATUM_FLOOR,
} from './schema';
import type { MuonDecayEvidenceState } from './state';

export interface MuonConstants {
  beta: number;
  halfLifeUs: number;
  lightKmPerUs: number;
  heightKm: number;
  startBandKm: number;
  muonCount: number;
  seed: number;
  stratumFloor: number;
  /** 화면에 띄우는 정박값(선언값). */
  gammaShown: number;
  classicalHalfM: number;
  dilatedHalfKm: number;
}

export function readConstants(stage: StageDef): MuonConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    beta: c.beta ?? BETA,
    halfLifeUs: c.halfLifeUs ?? HALF_LIFE_US,
    lightKmPerUs: c.lightKmPerUs ?? LIGHT_KM_PER_US,
    heightKm: c.heightKm ?? HEIGHT_KM,
    startBandKm: c.startBandKm ?? START_BAND_KM,
    muonCount: Math.max(1, Math.round(c.muonCount ?? MUON_COUNT)),
    seed: c.seed ?? SEED,
    stratumFloor: c.stratumFloor ?? STRATUM_FLOOR,
    gammaShown: c.gammaShown ?? GAMMA_SHOWN,
    classicalHalfM: c.classicalHalfM ?? CLASSICAL_HALF_M,
    dilatedHalfKm: c.dilatedHalfKm ?? DILATED_HALF_KM,
  };
}

/** 로런츠 인자. 화면에 띄우지 않는다 — 띄우는 γ 는 선언값 `gammaShown` 이다. */
export function lorentzGamma(beta: number): number {
  return 1 / Math.sqrt(1 - beta * beta);
}

/** 반감기 동안 가는 거리(km). `dilated` 면 지상에서 본 실제(γ 배). */
export function halfDistanceKm(c: MuonConstants, dilated: boolean): number {
  const classical = c.beta * c.lightKmPerUs * c.halfLifeUs;
  return dilated ? lorentzGamma(c.beta) * classical : classical;
}

/** 한 주기의 뮤온 떼. 두 기둥이 함께 쓴다. */
export interface MuonDraw {
  /** 기둥 안 가로 자리 0~1. */
  x: readonly number[];
  /** 출발 높이(km). [높이, 높이 + 떼 두께]. */
  y0: readonly number[];
  /** 제 수명(반감기 수). */
  halvings: readonly number[];
}

/** 시드 난수(mulberry32). 상태를 닫아 둔 생성기를 돌려준다. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 주기 `cycle` 의 뮤온 떼를 뽑는다. 순수 함수 — 시드와 주기 번호만으로 정해진다.
 * 수명은 층화해 뽑는다(`stratumFloor` 참고) — 뮤온 i 의 균등 난수는 [i + floor, i + 1)/N.
 */
export function drawMuons(c: MuonConstants, cycle: number): MuonDraw {
  // 주기마다 다른 흐름 — 씨앗에 주기 번호를 섞는다.
  const rand = mulberry32((c.seed * 0x9e3779b1 + cycle * 0x85ebca6b) >>> 0);
  const n = c.muonCount;
  const x: number[] = [];
  const y0: number[] = [];
  const halvings: number[] = [];
  for (let i = 0; i < n; i++) {
    x.push(rand());
    y0.push(c.heightKm + c.startBandKm * rand());
    const u = (i + c.stratumFloor + (1 - c.stratumFloor) * rand()) / n;
    halvings.push(-Math.log2(u));
  }
  return { x, y0, halvings };
}

/** 한 기둥의 한 순간. */
export interface ColumnFrame {
  /** 아직 날아오는 뮤온의 자리(기둥 안 0~1 가로, km 세로). */
  alive: Vec2[];
  /** 붕괴한 자리와 붕괴한 뒤 떨어진 거리(km) — 섬광의 나이로 바꾼다. */
  decayed: { pos: Vec2; since: number }[];
  /** 지표에 닿은 뮤온 — 가로 자리와 닿은 뒤 떨어진 거리(km). */
  landed: { x: number; since: number }[];
}

/**
 * 떼가 `fall` km 떨어졌을 때 한 기둥의 모습. `halfKm` 은 그 기둥에서 반감기 동안 가는 거리.
 * 뮤온 i 는 제 출발 높이에서 `nᵢ · halfKm` 을 가면 붕괴하고, 그 전에 지표(0)에 닿으면 남는다.
 *
 * `clock` 은 출발부터 흐른 시간을 같은 빠르기의 거리(km)로 잰 값이다 — 떼가 다 내려온 뒤에도
 * 자라서, 붕괴 · 닿음 뒤 흐른 양(`since`)이 멈추지 않는다. 내려오는 동안은 `fall` 과 같다.
 */
export function columnFrame(draw: MuonDraw, halfKm: number, fall: number, clock: number): ColumnFrame {
  const alive: Vec2[] = [];
  const decayed: { pos: Vec2; since: number }[] = [];
  const landed: { x: number; since: number }[] = [];
  for (let i = 0; i < draw.x.length; i++) {
    const x = draw.x[i]!;
    const y0 = draw.y0[i]!;
    const d = draw.halvings[i]! * halfKm;
    if (d < y0) {
      if (fall < d) alive.push([x, y0 - fall]);
      else decayed.push({ pos: [x, y0 - d], since: clock - d });
    } else if (fall < y0) {
      alive.push([x, y0 - fall]);
    } else {
      landed.push({ x, since: clock - y0 });
    }
  }
  return { alive, decayed, landed };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: MuonDecayEvidenceState }): MuonDecayEvidenceState {
  return params.state;
}
