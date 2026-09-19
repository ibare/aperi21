// ========================================================================
// boyles-law — 순수 물리
// ========================================================================
// 부피를 얼마나 줄이는지는 시간표가 정한다(피스톤을 민 만큼). 압력은 여기서
// **법칙으로 계산한다** — 온도를 묶어 둔 채 P = nRT/V. 압력계가 k 로 서고 점이
// 곡선 위에 놓이는 것은 그 계산의 결과이지 코드가 적어 둔 값이 아니다.
//
// 분자는 벽 사이를 오가는 닫힌 식이다 — (시드, 시각)이 같으면 같은 자리다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  DIVISOR_SECOND,
  DIVISOR_THIRD,
  GAS_R,
  GAUGE_MAX,
  GAUGE_TICK,
  GRAPH_P_MAX,
  GRAPH_V_MAX,
  MOLECULE_COUNT,
  MOLECULE_RATE_MAX,
  MOLECULE_RATE_MIN,
  MOLECULE_SEED,
  N_MOL,
  PHASE_IDS,
  TEMPERATURE,
  V_START,
  WORLD_PER_PRESSURE,
  WORLD_PER_VOLUME,
  type PhaseId,
} from './schema';
import type { BoylesLawState } from './state';

/** 리터 → 세제곱미터. 단위 환산이지 조각의 선택이 아니다. */
const M3_PER_LITER = 1e-3;
/** 부피가 이보다 덜 바뀌는 단계는 부피가 그대로인 단계로 적분한다. */
const STEADY_EPS = 1e-9;

export interface BoylesLawConstants {
  n: number;
  R: number;
  /** 온도(K) — 주기 내내 그대로다. */
  t: number;
  /** 처음 부피(L). */
  v0: number;
  /** 두 번째 · 세 번째 멈춤에서 부피를 나누는 수. */
  k2: number;
  k3: number;
  seed: number;
  molecules: number;
  rateMin: number;
  rateMax: number;
  /** 표시 배율 — 비 1 의 부피 길이 · 압력 높이(월드). */
  worldPerVolume: number;
  worldPerPressure: number;
  /** P–V 그림이 보이는 범위(비). */
  graphVMax: number;
  graphPMax: number;
  /** 압력계 눈금판의 끝값과 눈금 간격(비). */
  gaugeMax: number;
  gaugeTick: number;
}

export function readConstants(stage: StageDef): BoylesLawConstants {
  const c = stage.constants ?? {};
  return {
    n: c.n ?? N_MOL,
    R: c.R ?? GAS_R,
    t: c.t ?? TEMPERATURE,
    v0: c.v0 ?? V_START,
    k2: c.k2 ?? DIVISOR_SECOND,
    k3: c.k3 ?? DIVISOR_THIRD,
    seed: c.seed ?? MOLECULE_SEED,
    molecules: c.molecules ?? MOLECULE_COUNT,
    rateMin: c.rateMin ?? MOLECULE_RATE_MIN,
    rateMax: c.rateMax ?? MOLECULE_RATE_MAX,
    worldPerVolume: c.worldPerVolume ?? WORLD_PER_VOLUME,
    worldPerPressure: c.worldPerPressure ?? WORLD_PER_PRESSURE,
    graphVMax: c.graphVMax ?? GRAPH_V_MAX,
    graphPMax: c.graphPMax ?? GRAPH_P_MAX,
    gaugeMax: c.gaugeMax ?? GAUGE_MAX,
    gaugeTick: c.gaugeTick ?? GAUGE_TICK,
  };
}

// ------------------------------------------------------------------------
// 기체 상태 — 시간표의 진행도에서
// ------------------------------------------------------------------------

/** 단계 id → 그 단계의 진행도 0~1. 지금 프레임의 `at` 이거나, 적분할 때 바꿔 끼운 것. */
type Progress = (id: PhaseId) => number;

/**
 * 부피의 비(처음 = 1). 피스톤을 민 만큼이다.
 *
 * 누르는 두 단계와 놓는 단계의 진행도를 더한다 — 앞 단계는 1, 뒤 단계는 0 이므로
 * 분기 없이 1 → 1/k₂ → 1/k₃ → 1 을 차례로 지난다. 경계 숫자는 여기 없다.
 */
function volumeRatioWith(at: Progress, c: BoylesLawConstants): number {
  const second = 1 / c.k2;
  const third = 1 / c.k3;
  return 1 + (second - 1) * at('press2') + (third - second) * at('press3') + (1 - third) * at('release');
}

export interface GasReading {
  /** 부피(L) · 압력(Pa). */
  volume: number;
  pressure: number;
  /** 처음 값에 대한 비 — P–V 그림과 압력계가 쓰는 값. */
  vRatio: number;
  pRatio: number;
}

/** 지금 프레임의 기체. 압력은 묶어 둔 온도에서 법칙으로 나온다. */
export function readGas(tl: TimelineFrame, c: BoylesLawConstants): GasReading {
  const vRatio = volumeRatioWith((id) => tl.at(id), c);
  const volume = c.v0 * vRatio;
  const pressure = (c.n * c.R * c.t) / (volume * M3_PER_LITER);
  const p0 = (c.n * c.R * c.t) / (c.v0 * M3_PER_LITER);
  return { volume, pressure, vRatio, pRatio: pressure / p0 };
}

/**
 * 곡선 위 점들 — 같은 온도에서 부피 비 `vRatio` 일 때의 압력 비. 그림의 곡선을
 * 표본할 때 쓴다. 지금 점과 같은 계산(P = nRT/V)이라 점은 곡선을 벗어나지 않는다.
 */
export function pressureRatioAt(vRatio: number, c: BoylesLawConstants): number {
  const p = (c.n * c.R * c.t) / (c.v0 * vRatio * M3_PER_LITER);
  const p0 = (c.n * c.R * c.t) / (c.v0 * M3_PER_LITER);
  return p / p0;
}

// ------------------------------------------------------------------------
// 멈춘 자리 — 직사각형이 남아 있는가
// ------------------------------------------------------------------------

/**
 * 멈춘 세 자리의 직사각형이 남는 짙기 0~1.
 * 처음 자리는 주기 첫머리부터, 둘째 · 셋째는 누르기가 끝난 뒤부터 있고, 놓는 동안 옅어진다.
 */
export function pinnedVisibility(tl: TimelineFrame): { first: number; second: number; third: number } {
  const fade = 1 - tl.at('release');
  return {
    first: fade,
    second: tl.at('press2') >= 1 ? fade : 0,
    third: tl.at('press3') >= 1 ? fade : 0,
  };
}

/** 피스톤을 밀어 넣는 중인가. */
export function pushing(tl: TimelineFrame): boolean {
  return tl.phase === 'press2' || tl.phase === 'press3';
}

// ------------------------------------------------------------------------
// 분자 — 벽 사이를 오가는 닫힌 식
// ------------------------------------------------------------------------

/** 분자 하나. 처음 자리(0~1)와 처음 부피에서의 오가는 빈도(회/초). */
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

export function createMolecules(c: BoylesLawConstants): Molecule[] {
  const rand = mulberry32(c.seed);
  const span = c.rateMax - c.rateMin;
  const out: Molecule[] = [];
  for (let i = 0; i < c.molecules; i++) {
    out.push({ x0: rand(), y0: rand(), rx: c.rateMin + span * rand(), ry: c.rateMin + span * rand() });
  }
  return out;
}

/**
 * 주기 첫머리부터 흐른 가로 위상(처음 부피의 초로 센 값) — ∫ dt / (V/V₀).
 *
 * 온도가 그대로라 분자의 **속력**은 그대로이고, 가로로 한 번 오가는 시간만 기둥 길이를
 * 따른다. 그래서 가로 위상은 1/(V/V₀) 의 빠르기로 흐른다 — 좁아지면 벽에 더 자주 닿는다.
 *
 * 단계마다 처음 · 끝 부피를 「그 단계만 진행도를 바꿔 끼워」 얻고(앞 단계 1, 뒤 단계 0),
 * 부피가 단계 안에서 곧게 바뀐다고 보고 1/V 를 닫힌 식으로 적분한다. 진행도를 시간에
 * 비례한다고 보므로 부피가 바뀌는 단계는 `linear` 로 선언한다 (schema, 장부 G59).
 */
function phaseSince(tl: TimelineFrame, c: BoylesLawConstants, whole: boolean): number {
  let total = 0;
  for (const id of PHASE_IDS) {
    const reached = whole ? 1 : tl.at(id);
    if (reached <= 0) continue;
    const startOf = tl.start(id);
    const before: Progress = (q) => (q === id ? 0 : tl.end(q) <= startOf ? 1 : 0);
    const after: Progress = (q) => (q === id ? 1 : tl.end(q) <= startOf ? 1 : 0);
    const va = volumeRatioWith(before, c);
    const vb = volumeRatioWith(after, c);
    const d = tl.duration(id);
    const dv = vb - va;
    total += Math.abs(dv) < STEADY_EPS ? (d * reached) / va : (d / dv) * Math.log((va + dv * reached) / va);
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
 * 분자 자리와 속도(월드). 상자는 `[left, left + length] × [bottom, top]` 이다.
 * 속도는 짧은 자취 획에만 쓴다 — 온도가 그대로라 획 길이도 그대로다.
 */
export function readMolecules(
  molecules: readonly Molecule[],
  tl: TimelineFrame,
  c: BoylesLawConstants,
  g: GasReading,
  box: { left: number; bottom: number; top: number; length: number; margin: number },
): MoleculeField {
  const phaseX = tl.cycle * phaseSince(tl, c, true) + phaseSince(tl, c, false);
  const phaseY = tl.cycle * tl.period + tl.u;
  const w = box.length - 2 * box.margin;
  const h = box.top - box.bottom - 2 * box.margin;
  const positions: [number, number][] = [];
  const velocities: [number, number][] = [];
  for (const m of molecules) {
    const tx = m.x0 + m.rx * phaseX;
    const ty = m.y0 + m.ry * phaseY;
    positions.push([box.left + box.margin + w * fold(tx), box.bottom + box.margin + h * fold(ty)]);
    velocities.push([(w * foldSlope(tx) * m.rx) / g.vRatio, h * foldSlope(ty) * m.ry]);
  }
  return { positions, velocities };
}

/** 쌓는 상태가 없다 — 모든 움직임이 시각의 함수다. */
export function step(params: { state: BoylesLawState }): BoylesLawState {
  return params.state;
}
