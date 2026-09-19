// ========================================================================
// ideal-gas-law — 순수 물리
// ========================================================================
// 세 양 중 무엇을 바꾸는지는 시간표가 정한다. 여기서는 바뀐 두 양에서 남은 하나를
// **법칙으로 계산한다** — 압력은 언제나 P = nRT/V 로 나오고, 압력을 붙든 단계의
// 부피는 V = nRT/P₀ 로 나온다. 막대가 k 배로 서는 것은 그 계산의 결과다.
//
// 분자는 벽 사이를 오가는 닫힌 식이다 — (시드, 시각)이 같으면 같은 자리다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BAR_UNIT,
  GAS_R,
  ISOBARIC_HEAT,
  ISOCHORIC_HEAT,
  MOLECULE_COUNT,
  MOLECULE_RATE_MAX,
  MOLECULE_RATE_MIN,
  MOLECULE_SEED,
  N_MOL,
  PHASE_IDS,
  T_START,
  V_START,
  VOLUME_DIVISOR,
  WORLD_PER_LITER,
  type PhaseId,
} from './schema';
import type { IdealGasLawState } from './state';

/** 리터 → 세제곱미터. 단위 환산이지 조각의 선택이 아니다. */
const M3_PER_LITER = 1e-3;
/** 분자 속력을 단계마다 더할 때 한 단계를 나누는 표본 수. */
const INTEGRAL_SAMPLES = 12;

export interface IdealGasLawConstants {
  n: number;
  R: number;
  /** 처음 절대온도(K) · 처음 부피(L). */
  t0: number;
  v0: number;
  /** 1 단계에서 부피를 나누는 수 · 2 · 3 단계에서 온도를 올리는 배수. */
  volumeDivisor: number;
  isobaricHeat: number;
  isochoricHeat: number;
  seed: number;
  molecules: number;
  rateMin: number;
  rateMax: number;
  /** 표시 배율 — 1 L 의 실린더 길이 · 비 1 의 막대 높이(월드). */
  worldPerLiter: number;
  barUnit: number;
}

export function readConstants(stage: StageDef): IdealGasLawConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    n: c.n ?? N_MOL,
    R: c.R ?? GAS_R,
    t0: c.t0 ?? T_START,
    v0: c.v0 ?? V_START,
    volumeDivisor: c.volumeDivisor ?? VOLUME_DIVISOR,
    isobaricHeat: c.isobaricHeat ?? ISOBARIC_HEAT,
    isochoricHeat: c.isochoricHeat ?? ISOCHORIC_HEAT,
    seed: c.seed ?? MOLECULE_SEED,
    molecules: c.molecules ?? MOLECULE_COUNT,
    rateMin: c.rateMin ?? MOLECULE_RATE_MIN,
    rateMax: c.rateMax ?? MOLECULE_RATE_MAX,
    worldPerLiter: c.worldPerLiter ?? WORLD_PER_LITER,
    barUnit: c.barUnit ?? BAR_UNIT,
  };
}

// ------------------------------------------------------------------------
// 기체 상태 — 시간표의 진행도에서
// ------------------------------------------------------------------------

/** 단계 id → 그 단계의 진행도 0~1. 지금 프레임의 `at` 이거나, 적분할 때 바꿔 끼운 것. */
type Progress = (id: PhaseId) => number;

export interface GasReading {
  /** 절대온도(K) · 부피(L) · 압력(Pa). */
  temperature: number;
  volume: number;
  pressure: number;
  /** 처음 값에 대한 비. 막대 높이가 이것이다. */
  tRatio: number;
  vRatio: number;
  pRatio: number;
}

/**
 * 기체를 읽는다. 단계의 진행도만 보고, 단계 경계 숫자는 보지 않는다.
 *
 * 각 단계가 「얼마나 들어가 있는가」 는 바꾸는 단계의 진행도에서 되돌리는 단계의
 * 진행도를 뺀 것이다 — 전에는 0 − 0, 바꾸는 동안 s − 0, 결과 동안 1 − 0, 되돌리는
 * 동안 1 − s, 뒤에는 1 − 1. 그래서 분기 없이 세 단계가 차례로 들어갔다 나온다.
 */
function readGasWith(at: Progress, c: IdealGasLawConstants): GasReading {
  const pushed = at('compress') - at('releaseT');
  const heatedAtP = at('heatP') - at('releaseP');
  const heatedAtV = at('heatV') - at('releaseV');

  // 바꾸는 쪽 — 온도는 데운 만큼, 부피는 피스톤을 민 만큼.
  const isobaricFactor = 1 + (c.isobaricHeat - 1) * heatedAtP;
  const temperature = c.t0 * (isobaricFactor + (c.isochoricHeat - 1) * heatedAtV);
  const pushedVolume = c.v0 * (1 + (1 / c.volumeDivisor - 1) * pushed);
  // 압력을 붙든 동안 피스톤은 풀려 있어 부피가 nRT/P₀ 로 정해진다. P₀ = nRT₀/V₀ 이므로
  // 그것은 처음 부피에 그 단계에서 오른 온도의 배수를 곱한 것과 같다.
  const volume = pushedVolume * isobaricFactor;

  // 따라가는 쪽 — 압력은 언제나 법칙에서 나온다.
  const pressure = (c.n * c.R * temperature) / (volume * M3_PER_LITER);
  const p0 = (c.n * c.R * c.t0) / (c.v0 * M3_PER_LITER);

  return {
    temperature,
    volume,
    pressure,
    tRatio: temperature / c.t0,
    vRatio: volume / c.v0,
    pRatio: pressure / p0,
  };
}

/** 지금 프레임의 기체. */
export function readGas(tl: TimelineFrame, c: IdealGasLawConstants): GasReading {
  return readGasWith((id) => tl.at(id), c);
}

/** 실린더 안 기체 기둥의 길이(월드). */
export function gasLength(volumeLiters: number, c: IdealGasLawConstants): number {
  return volumeLiters * c.worldPerLiter;
}

// ------------------------------------------------------------------------
// 자물쇠 · 배수 글자 — 어느 단계가 들어가 있는가
// ------------------------------------------------------------------------

export interface StepVisibility {
  /** 자물쇠의 짙기 0~1 — 거는 단계 동안 나타나 되돌리는 단계 동안 사라진다. */
  lock: number;
  /** 배수 글자의 짙기 0~1 — 바꾸기가 끝난 뒤부터 되돌리는 동안 사라진다. */
  result: number;
}

function visibility(tl: TimelineFrame, lockId: PhaseId, changeId: PhaseId, releaseId: PhaseId): StepVisibility {
  const fade = 1 - tl.at(releaseId);
  return {
    lock: tl.at(lockId) * fade,
    result: tl.at(changeId) >= 1 ? fade : 0,
  };
}

export function temperatureStep(tl: TimelineFrame): StepVisibility {
  return visibility(tl, 'lockT', 'compress', 'releaseT');
}
export function pressureStep(tl: TimelineFrame): StepVisibility {
  return visibility(tl, 'lockP', 'heatP', 'releaseP');
}
export function volumeStep(tl: TimelineFrame): StepVisibility {
  return visibility(tl, 'lockV', 'heatV', 'releaseV');
}

/** 데우는 판이 켜져 있는가 — 온도를 올리는 두 단계 동안. */
export function heating(tl: TimelineFrame): boolean {
  return tl.phase === 'heatP' || tl.phase === 'heatV';
}

/** 피스톤을 밀어 넣는 중인가. */
export function pushing(tl: TimelineFrame): boolean {
  return tl.phase === 'compress';
}

// ------------------------------------------------------------------------
// 분자 — 벽 사이를 오가는 닫힌 식
// ------------------------------------------------------------------------

/** 분자 하나. 위상은 0~1(한 번 오가기), 빈도는 처음 상태에서의 회/초. */
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

export function createMolecules(c: IdealGasLawConstants): Molecule[] {
  const rand = mulberry32(c.seed);
  const span = c.rateMax - c.rateMin;
  const out: Molecule[] = [];
  for (let i = 0; i < c.molecules; i++) {
    out.push({ x0: rand(), y0: rand(), rx: c.rateMin + span * rand(), ry: c.rateMin + span * rand() });
  }
  return out;
}

/**
 * 위상이 흐르는 빠르기 — 처음 상태를 1 로.
 *
 * 분자 속력은 √T 를 따르고, 가로로 한 번 오가는 데 걸리는 시간은 기둥 길이(= 부피)를
 * 따른다. 그래서 가로 위상은 √(T/T₀) ÷ (V/V₀), 세로 위상은 높이가 그대로라 √(T/T₀) 로 흐른다.
 * 이렇게 두면 부피를 줄여도 분자의 **속력**은 그대로이고 벽에 닿는 **횟수**만 는다.
 */
function phaseRates(g: GasReading): { x: number; y: number } {
  const s = Math.sqrt(g.tRatio);
  return { x: s / g.vRatio, y: s };
}

/**
 * 주기 첫머리부터 흐른 위상(처음 상태의 초로 센 값).
 *
 * 단계마다 「그 단계가 지난 만큼」 빠르기를 더한다. 단계 안의 빠르기는 그 단계만
 * 진행도를 바꿔 끼우고(앞 단계 1, 뒤 단계 0) 기체를 다시 읽어 얻는다 — 단계 경계
 * 숫자도 이징도 여기서 세지 않고 프레임에게 묻는다. 진행도를 시간에 비례한다고 보고
 * 더하므로 바꾸는 단계는 `linear` 로 선언한다 (schema).
 */
function phaseSince(tl: TimelineFrame, c: IdealGasLawConstants, whole: boolean): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (const id of PHASE_IDS) {
    const reached = whole ? 1 : tl.at(id);
    if (reached <= 0) continue;
    const startOf = tl.start(id);
    let sx = 0;
    let sy = 0;
    for (let k = 0; k < INTEGRAL_SAMPLES; k++) {
      const sigma = (reached * (k + 0.5)) / INTEGRAL_SAMPLES;
      const at: Progress = (q) => (q === id ? sigma : tl.end(q) <= startOf ? 1 : 0);
      const r = phaseRates(readGasWith(at, c));
      sx += r.x;
      sy += r.y;
    }
    const span = (tl.duration(id) * reached) / INTEGRAL_SAMPLES;
    x += sx * span;
    y += sy * span;
  }
  return { x, y };
}

/** 한 번 오가기(위상 0~1)를 0 → 1 → 0 자리로 접는다. */
function fold(theta: number): number {
  const f = theta - Math.floor(theta);
  return 1 - Math.abs(1 - 2 * f);
}
/** 접은 자리의 기울기 부호 — 가는 중이면 +, 돌아오는 중이면 −. */
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
 * 속도는 자취 획에만 쓴다 — 획 길이가 곧 속력이라 온도를 올리면 길어진다.
 */
export function readMolecules(
  molecules: readonly Molecule[],
  tl: TimelineFrame,
  c: IdealGasLawConstants,
  g: GasReading,
  box: { left: number; bottom: number; top: number; length: number; margin: number },
): MoleculeField {
  const now = phaseSince(tl, c, false);
  const period = phaseSince(tl, c, true);
  const phaseX = tl.cycle * period.x + now.x;
  const phaseY = tl.cycle * period.y + now.y;
  const rate = phaseRates(g);
  const w = box.length - 2 * box.margin;
  const h = box.top - box.bottom - 2 * box.margin;

  const positions: [number, number][] = [];
  const velocities: [number, number][] = [];
  for (const m of molecules) {
    const tx = m.x0 + m.rx * phaseX;
    const ty = m.y0 + m.ry * phaseY;
    positions.push([box.left + box.margin + w * fold(tx), box.bottom + box.margin + h * fold(ty)]);
    velocities.push([w * foldSlope(tx) * m.rx * rate.x, h * foldSlope(ty) * m.ry * rate.y]);
  }
  return { positions, velocities };
}

/** 쌓는 상태가 없다 — 모든 움직임이 시각의 함수다. */
export function step(params: { state: IdealGasLawState }): IdealGasLawState {
  return params.state;
}
