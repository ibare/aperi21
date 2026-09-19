// ========================================================================
// adiabatic-process — 순수 물리
// ========================================================================
// 부피를 얼마나 늘리는지는 시간표가 정한다(피스톤이 오른 만큼). 열이 드나들지 못하므로
// 기체가 피스톤에 한 일만큼 내부 에너지가 줄어 온도가 내려간다 — 온도 비는
// (V₁/V)^(γ−1), 압력 비는 (V₁/V)^γ 다. 같은 부피에서 온도를 붙든 경우의 압력 비는 V₁/V 라
// 두 점을 나란히 계산해 둔다. 두 곡선의 끝 압력 · 끝 온도는 이 식의 결과이고, 화면에
// 뜨는 글자는 schema 의 정박값이다.
//
// 분자는 벽 사이를 오가는 닫힌 식이다 — (시드, 시각)이 같으면 같은 자리다. 속력은
// √(T/T₁) 를 따라 줄고, 위아래로 한 번 오가는 시간은 기둥 높이도 따른다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  EXPANSION,
  GAMMA,
  GRAPH_P_MAX,
  GRAPH_V_MAX,
  GRAPH_V_MIN,
  GRAPH_WORLD_PER_PRESSURE,
  GRAPH_WORLD_PER_VOLUME,
  MOLECULE_COUNT,
  MOLECULE_RATE_MAX,
  MOLECULE_RATE_MIN,
  MOLECULE_SEED,
  P_ADIA_END_SHOWN,
  P_ISO_END_SHOWN,
  THERMO_T_MAX,
  THERMO_T_MIN,
  T_END_SHOWN,
  T_START,
  WORLD_PER_VOLUME,
} from './schema';
import type { AdiabaticProcessState } from './state';

/** 부피가 이보다 덜 바뀌는 단계는 부피가 그대로인 단계로 적분한다. */
const STEADY_EPS = 1e-9;

export interface AdiabaticProcessConstants {
  /** 비열비. */
  gamma: number;
  /** 처음 온도(K). 압력 · 부피는 처음 값에 대한 비라 처음 값이 곧 1 이다. */
  t0: number;
  /** 끝 부피 ÷ 처음 부피. */
  k: number;
  /** 화면에 띄우는 정박값 — 끝 온도(K), 두 곡선의 끝 압력 비. */
  tEndShown: number;
  pIsoEndShown: number;
  pAdiaEndShown: number;
  /** 온도계 눈금의 아래 · 위 끝(K). */
  thermoTMin: number;
  thermoTMax: number;
  seed: number;
  molecules: number;
  rateMin: number;
  rateMax: number;
  /** 표시 배율 — 부피 비 1 의 기체 기둥 높이(월드). */
  worldPerVolume: number;
  /** 표시 배율 — P–V 그림의 부피 비 1 의 길이 · 압력 비 1 의 높이(월드). */
  graphWorldPerVolume: number;
  graphWorldPerPressure: number;
  /** P–V 그림이 보이는 범위(비). */
  graphVMin: number;
  graphVMax: number;
  graphPMax: number;
}

export function readConstants(stage: StageDef): AdiabaticProcessConstants {
  const c = stage.constants ?? {};
  return {
    gamma: c.gamma ?? GAMMA,
    t0: c.t0 ?? T_START,
    k: c.k ?? EXPANSION,
    tEndShown: c.tEndShown ?? T_END_SHOWN,
    pIsoEndShown: c.pIsoEndShown ?? P_ISO_END_SHOWN,
    pAdiaEndShown: c.pAdiaEndShown ?? P_ADIA_END_SHOWN,
    thermoTMin: c.thermoTMin ?? THERMO_T_MIN,
    thermoTMax: c.thermoTMax ?? THERMO_T_MAX,
    seed: c.seed ?? MOLECULE_SEED,
    molecules: c.molecules ?? MOLECULE_COUNT,
    rateMin: c.rateMin ?? MOLECULE_RATE_MIN,
    rateMax: c.rateMax ?? MOLECULE_RATE_MAX,
    worldPerVolume: c.worldPerVolume ?? WORLD_PER_VOLUME,
    graphWorldPerVolume: c.graphWorldPerVolume ?? GRAPH_WORLD_PER_VOLUME,
    graphWorldPerPressure: c.graphWorldPerPressure ?? GRAPH_WORLD_PER_PRESSURE,
    graphVMin: c.graphVMin ?? GRAPH_V_MIN,
    graphVMax: c.graphVMax ?? GRAPH_V_MAX,
    graphPMax: c.graphPMax ?? GRAPH_P_MAX,
  };
}

// ------------------------------------------------------------------------
// 기체 상태 — 시간표의 진행도에서
// ------------------------------------------------------------------------

/** 단계 id → 그 단계의 진행도 0~1. 지금 프레임의 `at` 이거나, 적분할 때 바꿔 끼운 것. */
type Progress = (id: string) => number;

/**
 * 부피의 비(처음 = 1). 부푸는 단계에서 1 → k, 되돌리는 단계에서 k → 1.
 * 앞 단계는 1, 뒤 단계는 0 이므로 분기 없이 차례로 지난다. 경계 숫자는 여기 없다.
 */
function volumeRatioWith(at: Progress, c: AdiabaticProcessConstants): number {
  return 1 + (c.k - 1) * (at('expand') - at('reset'));
}

/** 부피 비 `v` 에서 단열 곡선의 압력 비(처음 = 1). */
export function adiabatPressure(v: number, c: AdiabaticProcessConstants): number {
  return Math.pow(v, -c.gamma);
}
/** 부피 비 `v` 에서 온도를 붙든 곡선의 압력 비(처음 = 1). */
export function isothermPressure(v: number): number {
  return 1 / v;
}
/** 부피 비 `v` 에서 단열로 온 기체의 온도 비(처음 = 1). */
export function adiabatTemperature(v: number, c: AdiabaticProcessConstants): number {
  return Math.pow(v, 1 - c.gamma);
}

export interface GasReading {
  /** 처음 값에 대한 부피 비. */
  vRatio: number;
  /** 단열 곡선의 압력 비 · 같은 부피에서 온도를 붙든 곡선의 압력 비. */
  pAdia: number;
  pIso: number;
  /** 지금 온도(K). 온도계 채움 높이에만 쓴다 — 글자로 띄우지 않는다. */
  temperature: number;
  /** 처음 온도에 대한 온도 비. */
  tRatio: number;
}

/** 지금 프레임의 기체. 압력 · 온도는 부피에서 법칙으로 나온다. */
export function readGas(tl: TimelineFrame, c: AdiabaticProcessConstants): GasReading {
  const vRatio = volumeRatioWith((id) => tl.at(id), c);
  const tRatio = adiabatTemperature(vRatio, c);
  return {
    vRatio,
    pAdia: adiabatPressure(vRatio, c),
    pIso: isothermPressure(vRatio),
    temperature: c.t0 * tRatio,
    tRatio,
  };
}

// ------------------------------------------------------------------------
// 분자 — 벽 사이를 오가는 닫힌 식
// ------------------------------------------------------------------------

/** 분자 하나. 처음 자리(0~1)와 처음 상태에서의 오가는 빈도(회/초). */
export interface Molecule {
  x0: number;
  y0: number;
  rx: number;
  ry: number;
}

/** 시드 결정적 난수 (mulberry32). 같은 시드는 같은 줄을 낸다 (S-sim). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createMolecules(c: AdiabaticProcessConstants): Molecule[] {
  const rand = mulberry32(c.seed);
  const span = c.rateMax - c.rateMin;
  const out: Molecule[] = [];
  for (let i = 0; i < c.molecules; i++) {
    out.push({ x0: rand(), y0: rand(), rx: c.rateMin + span * rand(), ry: c.rateMin + span * rand() });
  }
  return out;
}

/**
 * 시간표의 단계 id. 분자 위상을 단계마다 더하려고 훑는다.
 * `TimelineFrame` 에는 단계 목록이 없어(장부 G193) id 만 여기 둔다 — 길이 · 순서 · 이징은
 * schema 의 선언이 정하고 여기서는 프레임에게 묻는다. 더하는 것이라 순서는 뜻이 없다.
 */
const PHASE_IDS = ['rest0', 'expand', 'mark', 'hold', 'reset'] as const;

/**
 * 부피 비가 `va` 에서 `va + dv` 로 곧게 바뀌는 단계(길이 `d`)의 첫머리부터 진행도 `r` 까지
 * v^(−m) 을 시간으로 적분한다.
 */
function integratePower(va: number, dv: number, d: number, r: number, m: number): number {
  if (Math.abs(dv) < STEADY_EPS) return d * r * Math.pow(va, -m);
  const vb = va + dv * r;
  const e = 1 - m;
  if (Math.abs(e) < STEADY_EPS) return (d / dv) * Math.log(vb / va);
  return ((d / dv) * (Math.pow(vb, e) - Math.pow(va, e))) / e;
}

/**
 * 주기 첫머리부터 흐른 위상(처음 상태의 초로 센 값) — ∫ v^(−m) dt.
 *
 * 가로 위상은 속력만 따른다: 속력 ∝ √(T/T₁) = v^(−(γ−1)/2).
 * 세로 위상은 기둥 높이도 따른다: 한 번 오가는 시간 ∝ 높이/속력 → v^(−(γ−1)/2 − 1).
 *
 * 단계마다 처음 · 끝 부피를 「그 단계만 진행도를 바꿔 끼워」 얻고, 부피가 단계 안에서
 * 곧게 바뀐다고 보고 닫힌 식으로 적분한다. 부피가 바뀌는 단계는 `linear` 로 선언한다
 * (schema, 장부 G59).
 */
function phaseSince(tl: TimelineFrame, c: AdiabaticProcessConstants, m: number, whole: boolean): number {
  let total = 0;
  for (const id of PHASE_IDS) {
    const reached = whole ? 1 : tl.at(id);
    if (reached <= 0) continue;
    const startOf = tl.start(id);
    const before: Progress = (q) => (q === id ? 0 : tl.end(q) <= startOf ? 1 : 0);
    const after: Progress = (q) => (q === id ? 1 : tl.end(q) <= startOf ? 1 : 0);
    const va = volumeRatioWith(before, c);
    const vb = volumeRatioWith(after, c);
    total += integratePower(va, vb - va, tl.duration(id), reached, m);
  }
  return total;
}

/** 한 번 오가기(위상 0~1)를 0 → 1 → 0 자리로 접는다. */
function fold(theta: number): number {
  const f = theta - Math.floor(theta);
  return 1 - Math.abs(1 - 2 * f);
}
/** 접은 자리의 기울기 — 가는 중이면 +2, 돌아오는 중이면 −2. */
function foldSlope(theta: number): number {
  const f = theta - Math.floor(theta);
  return f < 0.5 ? 2 : -2;
}

export interface MoleculeField {
  positions: [number, number][];
  velocities: [number, number][];
}

/**
 * 분자 자리와 속도(월드). 상자는 `[left, right] × [bottom, bottom + height]` 이다.
 * 속도는 짧은 자취 획에만 쓴다 — 식을수록 획이 짧아진다.
 */
export function readMolecules(
  molecules: readonly Molecule[],
  tl: TimelineFrame,
  c: AdiabaticProcessConstants,
  g: GasReading,
  box: { left: number; right: number; bottom: number; height: number; margin: number },
): MoleculeField {
  const mx = (c.gamma - 1) / 2;
  const my = mx + 1;
  const phaseX = tl.cycle * phaseSince(tl, c, mx, true) + phaseSince(tl, c, mx, false);
  const phaseY = tl.cycle * phaseSince(tl, c, my, true) + phaseSince(tl, c, my, false);
  const speed = Math.sqrt(g.tRatio);
  const w = box.right - box.left - 2 * box.margin;
  const h = box.height - 2 * box.margin;
  const positions: [number, number][] = [];
  const velocities: [number, number][] = [];
  for (const m of molecules) {
    const tx = m.x0 + m.rx * phaseX;
    const ty = m.y0 + m.ry * phaseY;
    positions.push([box.left + box.margin + w * fold(tx), box.bottom + box.margin + h * fold(ty)]);
    velocities.push([w * foldSlope(tx) * m.rx * speed, (h * foldSlope(ty) * m.ry * speed) / g.vRatio]);
  }
  return { positions, velocities };
}

/** 쌓는 상태가 없다 — 모든 움직임이 시각의 함수다. */
export function step(params: { state: AdiabaticProcessState }): AdiabaticProcessState {
  return params.state;
}
