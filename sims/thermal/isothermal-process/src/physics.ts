// ========================================================================
// isothermal-process — 순수 물리
// ========================================================================
// 부피를 얼마나 늘리는지는 시간표가 정한다(피스톤이 오른 만큼). 온도는 항온조가
// 붙들고 있으므로 압력은 부피에 반비례하고, 기체가 피스톤에 한 일은 지나온 곡선
// 아래 넓이 ∫P dV 다. 온도가 그대로라 내부 에너지도 그대로이므로 들어온 열은 그
// 일과 같다 — 알갱이 하나는 한 일의 1/N 이다.
//
// 그래서 알갱이 i 가 지나가는 때는 코드가 적어 둔 시각이 아니라 **누적 일이 i/N 에서
// (i+1)/N 으로 가는 동안**이다. 압력이 높은 처음에는 같은 부피를 늘려도 일이 많아
// 알갱이가 잦고, 나중에는 드물어진다 — 계산의 결과다.
//
// 분자는 벽 사이를 오가는 닫힌 식이다 — (시드, 시각)이 같으면 같은 자리다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  EXPANSION,
  GRAIN_COUNT,
  GRAPH_P_MAX,
  GRAPH_V_MAX,
  GRAPH_WORLD_PER_PRESSURE,
  GRAPH_WORLD_PER_VOLUME,
  MOLECULE_COUNT,
  MOLECULE_RATE_MAX,
  MOLECULE_RATE_MIN,
  MOLECULE_SEED,
  TEMPERATURE,
  WORLD_PER_VOLUME,
} from './schema';
import type { IsothermalProcessState } from './state';

/** 부피가 이보다 덜 바뀌는 단계는 부피가 그대로인 단계로 적분한다. */
const STEADY_EPS = 1e-9;

export interface IsothermalProcessConstants {
  /** 항온조 · 기체의 온도(K) — 주기 내내 그대로다. */
  t: number;
  /** 끝 부피 ÷ 처음 부피. */
  k: number;
  /** 한 번 부푸는 동안 지나가는 열 알갱이 수. */
  grains: number;
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
  graphVMax: number;
  graphPMax: number;
}

export function readConstants(stage: StageDef): IsothermalProcessConstants {
  const c = stage.constants ?? {};
  return {
    t: c.t ?? TEMPERATURE,
    k: c.k ?? EXPANSION,
    grains: c.grains ?? GRAIN_COUNT,
    seed: c.seed ?? MOLECULE_SEED,
    molecules: c.molecules ?? MOLECULE_COUNT,
    rateMin: c.rateMin ?? MOLECULE_RATE_MIN,
    rateMax: c.rateMax ?? MOLECULE_RATE_MAX,
    worldPerVolume: c.worldPerVolume ?? WORLD_PER_VOLUME,
    graphWorldPerVolume: c.graphWorldPerVolume ?? GRAPH_WORLD_PER_VOLUME,
    graphWorldPerPressure: c.graphWorldPerPressure ?? GRAPH_WORLD_PER_PRESSURE,
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
function volumeRatioWith(at: Progress, c: IsothermalProcessConstants): number {
  return 1 + (c.k - 1) * (at('expand') - at('reset'));
}

/** 같은 온도에서 부피 비 `v` 일 때의 압력 비(처음 = 1). 온도를 붙들었으므로 부피에 반비례한다. */
export function pressureRatioAt(v: number): number {
  return 1 / v;
}

export interface GasReading {
  /** 처음 값에 대한 부피 비 · 압력 비. */
  vRatio: number;
  pRatio: number;
  /**
   * 이번 부풂에서 기체가 한 일의 몫 0~1 — 곡선 아래 넓이 ∫P dV 를 끝까지의 넓이로 나눈 것.
   * 처음 자리에서 0, 다 부풀면 1. 되돌리는 동안에는 1 로 남는다(옅어지는 것은 scene 이 한다).
   */
  workFraction: number;
}

/** 지금 프레임의 기체. 압력 · 일은 붙든 온도에서 법칙으로 나온다. */
export function readGas(tl: TimelineFrame, c: IsothermalProcessConstants): GasReading {
  const vRatio = volumeRatioWith((id) => tl.at(id), c);
  const vExpanded = 1 + (c.k - 1) * tl.at('expand');
  return {
    vRatio,
    pRatio: pressureRatioAt(vRatio),
    workFraction: Math.log(vExpanded) / Math.log(c.k),
  };
}

// ------------------------------------------------------------------------
// 열 알갱이 — 누적 일의 몫에서 닫힌 식으로
// ------------------------------------------------------------------------

/**
 * 알갱이마다 길 위의 진행 0~1. 알갱이 i 는 누적 일이 i/N 에서 (i+1)/N 으로 가는 동안
 * 항온조 → 기체 → 피스톤 → W 더미를 지난다. 0 이면 아직 항온조에, 1 이면 W 더미에 앉았다.
 * 한 번에 한 알갱이만 길 위에 있다.
 */
export function grainProgress(g: GasReading, c: IsothermalProcessConstants): number[] {
  const out: number[] = [];
  for (let i = 0; i < c.grains; i++) {
    out.push(Math.min(1, Math.max(0, c.grains * g.workFraction - i)));
  }
  return out;
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

export function createMolecules(c: IsothermalProcessConstants): Molecule[] {
  const rand = mulberry32(c.seed);
  const span = c.rateMax - c.rateMin;
  const out: Molecule[] = [];
  for (let i = 0; i < c.molecules; i++) {
    out.push({ x0: rand(), y0: rand(), rx: c.rateMin + span * rand(), ry: c.rateMin + span * rand() });
  }
  return out;
}

/**
 * 시간표의 단계 id. 분자의 세로 위상을 단계마다 더하려고 훑는다.
 * `TimelineFrame` 에는 단계 목록이 없어(장부 G193) id 만 여기 둔다 — 길이 · 순서 · 이징은
 * schema 의 선언이 정하고 여기서는 프레임에게 묻는다. 더하는 것이라 순서는 뜻이 없다.
 */
const PHASE_IDS = ['rest0', 'expand', 'hold', 'reset'] as const;

/**
 * 주기 첫머리부터 흐른 세로 위상(처음 부피의 초로 센 값) — ∫ dt / (V/V₀).
 *
 * 온도가 그대로라 분자의 **속력**은 그대로이고, 위아래로 한 번 오가는 시간만 기둥
 * 높이를 따른다. 그래서 세로 위상은 1/(V/V₀) 의 빠르기로 흐른다 — 부풀면 벽(피스톤)에
 * 덜 자주 닿는다.
 *
 * 단계마다 처음 · 끝 부피를 「그 단계만 진행도를 바꿔 끼워」 얻고, 부피가 단계 안에서
 * 곧게 바뀐다고 보고 1/V 를 닫힌 식으로 적분한다. 부피가 바뀌는 단계는 `linear` 로
 * 선언한다 (schema, 장부 G59).
 */
function phaseSince(tl: TimelineFrame, c: IsothermalProcessConstants, whole: boolean): number {
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
 * 분자 자리와 속도(월드). 상자는 `[left, right] × [bottom, bottom + height]` 이다.
 * 속도는 짧은 자취 획에만 쓴다 — 온도가 그대로라 획 길이도 그대로다.
 */
export function readMolecules(
  molecules: readonly Molecule[],
  tl: TimelineFrame,
  c: IsothermalProcessConstants,
  g: GasReading,
  box: { left: number; right: number; bottom: number; height: number; margin: number },
): MoleculeField {
  const phaseX = tl.cycle * tl.period + tl.u;
  const phaseY = tl.cycle * phaseSince(tl, c, true) + phaseSince(tl, c, false);
  const w = box.right - box.left - 2 * box.margin;
  const h = box.height - 2 * box.margin;
  const positions: [number, number][] = [];
  const velocities: [number, number][] = [];
  for (const m of molecules) {
    const tx = m.x0 + m.rx * phaseX;
    const ty = m.y0 + m.ry * phaseY;
    positions.push([box.left + box.margin + w * fold(tx), box.bottom + box.margin + h * fold(ty)]);
    velocities.push([w * foldSlope(tx) * m.rx, (h * foldSlope(ty) * m.ry) / g.vRatio]);
  }
  return { positions, velocities };
}

/** 쌓는 상태가 없다 — 모든 움직임이 시각의 함수다. */
export function step(params: { state: IsothermalProcessState }): IsothermalProcessState {
  return params.state;
}
