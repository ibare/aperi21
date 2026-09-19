// ========================================================================
// temperature-and-resistance — 순수 물리
// ========================================================================
// 온도 T 는 시간표에서 읽는다: x = at('heat') − at('cool') (0 = 차가움, 1 = 데운 뒤),
// T = T₀ + (T₁ − T₀)·x.
//
// - 금속 — R(T) = R₀(1 + α(T − T₀)). 나르개 수가 그대로라 전류 비 = 전자 빠르기 비 =
//   1 / (1 + α(T − T₀)). 전자가 흐른 거리는 빠르기의 시간 적분이고, 데움 · 식힘 단계에서
//   온도가 시각에 선형이라 적분이 로그의 닫힌 식이다 — 같은 시각은 언제나 같은 자리이고
//   주기가 바뀌어도 전자가 튀지 않는다.
// - 반도체 — 나르개 쌍 수 n(x) = n₀ (n₁/n₀)^x (온도에 대해 지수로 는다). 쌍 k 는 x 가 문턱
//   x_k 를 넘는 순간 격자의 한 자리(시드로 고름)에서 e⁻ · h⁺ 로 갈라져 반대로 흐른다.
//   빠르기는 온도에 따라 바꾸지 않으므로 전류 비 = 쌍 수 비.
// - 격자 떨림 · 전자 흔들림 — (시드, 조각 시계)의 사인 함수. `step` 에 난수를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ATOM_PITCH,
  CARRIER_SPACING,
  METAL_SPEED,
  METAL_TEMP_COEFF,
  METER_UNIT,
  PAIRS_COLD,
  PAIRS_HOT,
  SEED,
  SEMI_SPEED,
  TEMP_COLD,
  TEMP_HOT,
  TRAIL_SECONDS,
  VIB_AMP_COLD,
  VIB_AMP_HOT,
  VIB_FREQ_MAX,
  VIB_FREQ_MIN,
  VOLTAGE,
  WOBBLE_RATIO,
} from './schema';
import type { TemperatureAndResistanceState } from './state';

export interface TemperatureAndResistanceConstants {
  voltage: number;
  tempCold: number;
  tempHot: number;
  metalTempCoeff: number;
  pairsCold: number;
  pairsHot: number;
  metalSpeed: number;
  semiSpeed: number;
  carrierSpacing: number;
  atomPitch: number;
  vibAmpCold: number;
  vibAmpHot: number;
  vibFreqMin: number;
  vibFreqMax: number;
  wobbleRatio: number;
  meterUnit: number;
  trailSeconds: number;
  seed: number;
}

export function readConstants(stage: StageDef): TemperatureAndResistanceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    voltage: c.voltage ?? VOLTAGE,
    tempCold: c.tempCold ?? TEMP_COLD,
    tempHot: c.tempHot ?? TEMP_HOT,
    metalTempCoeff: c.metalTempCoeff ?? METAL_TEMP_COEFF,
    pairsCold: c.pairsCold ?? PAIRS_COLD,
    pairsHot: c.pairsHot ?? PAIRS_HOT,
    metalSpeed: c.metalSpeed ?? METAL_SPEED,
    semiSpeed: c.semiSpeed ?? SEMI_SPEED,
    carrierSpacing: c.carrierSpacing ?? CARRIER_SPACING,
    atomPitch: c.atomPitch ?? ATOM_PITCH,
    vibAmpCold: c.vibAmpCold ?? VIB_AMP_COLD,
    vibAmpHot: c.vibAmpHot ?? VIB_AMP_HOT,
    vibFreqMin: c.vibFreqMin ?? VIB_FREQ_MIN,
    vibFreqMax: c.vibFreqMax ?? VIB_FREQ_MAX,
    wobbleRatio: c.wobbleRatio ?? WOBBLE_RATIO,
    meterUnit: c.meterUnit ?? METER_UNIT,
    trailSeconds: c.trailSeconds ?? TRAIL_SECONDS,
    seed: c.seed ?? SEED,
  };
}

// ------------------------------------------------------------------------
// 시드 결정적 난수 — 이 sim 안에만 둔다 (S-sim · C3)
// ------------------------------------------------------------------------

/** (시드, 갈래, 번호) → [0, 1). 같은 인자는 언제나 같은 값이다. */
export function hash01(seed: number, stream: number, index: number): number {
  let h = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(stream | 0, 0x85ebca6b) ^ Math.imul(index | 0, 0xc2b2ae35)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

/** 난수 갈래 — 같은 번호라도 쓰임이 다르면 다른 값을 뽑는다. */
const STREAM = {
  atomFreqX: 1,
  atomFreqY: 2,
  atomPhaseX: 3,
  atomPhaseY: 4,
  wobbleFreq: 5,
  wobblePhase: 6,
  pairSite: 7,
  pairLane: 8,
} as const;

// ------------------------------------------------------------------------
// 온도
// ------------------------------------------------------------------------

/** 데워진 정도 0(차가움) ~ 1(데운 뒤). */
export function heatLevel(tl: TimelineFrame): number {
  return tl.at('heat') - tl.at('cool');
}

/** 지금 온도(°C). */
export function temperatureOf(c: TemperatureAndResistanceConstants, x: number): number {
  return c.tempCold + (c.tempHot - c.tempCold) * x;
}

/** 격자 떨림 폭(월드, 표시값). */
export function vibAmplitude(c: TemperatureAndResistanceConstants, x: number): number {
  return c.vibAmpCold + (c.vibAmpHot - c.vibAmpCold) * x;
}

/**
 * 원자 · 전자 하나의 제자리 떨림 — (시드, 번호, 시각)의 사인. 폭은 곱하지 않은 단위 떨림이다.
 * `stream` 갈래로 원자(x · y 두 축)와 전자(y 한 축)를 가른다.
 */
function unitWave(
  c: TemperatureAndResistanceConstants,
  freqStream: number,
  phaseStream: number,
  index: number,
  t: number,
): number {
  const f = c.vibFreqMin + (c.vibFreqMax - c.vibFreqMin) * hash01(c.seed, freqStream, index);
  const phase = 2 * Math.PI * hash01(c.seed, phaseStream, index);
  return Math.sin(2 * Math.PI * f * t + phase);
}

/** 격자 원자 `index` 의 떨림 변위(월드). */
export function atomOffset(
  c: TemperatureAndResistanceConstants,
  index: number,
  amp: number,
  t: number,
): readonly [number, number] {
  return [
    amp * unitWave(c, STREAM.atomFreqX, STREAM.atomPhaseX, index, t),
    amp * unitWave(c, STREAM.atomFreqY, STREAM.atomPhaseY, index, t),
  ];
}

/** 금속 전자 `index` 가 떨리는 격자에 부딪혀 위아래로 흔들리는 변위(월드). */
export function electronWobble(
  c: TemperatureAndResistanceConstants,
  index: number,
  amp: number,
  t: number,
): number {
  return amp * c.wobbleRatio * unitWave(c, STREAM.wobbleFreq, STREAM.wobblePhase, index, t);
}

// ------------------------------------------------------------------------
// 금속 — 나르개 수 그대로, 빠르기 = 1 / (1 + αΔT)
// ------------------------------------------------------------------------

/** 데운 뒤의 αΔT. */
function metalK(c: TemperatureAndResistanceConstants): number {
  return c.metalTempCoeff * (c.tempHot - c.tempCold);
}

/** 금속의 저항 비 R(T)/R(T₀) = 1 + α(T − T₀). */
export function metalResistanceRatio(c: TemperatureAndResistanceConstants, x: number): number {
  return 1 + c.metalTempCoeff * (temperatureOf(c, x) - c.tempCold);
}

/** 금속의 전류 비 I(T)/I(T₀) — 같은 전압이라 저항 비의 역수. */
export function metalCurrentRatio(c: TemperatureAndResistanceConstants, x: number): number {
  return 1 / metalResistanceRatio(c, x);
}

/** 온도가 0 → 1 로 선형으로 오르는 단계 D 초 중 진행도 p 까지, 빠르기 비 1/(1 + k·x) 의 적분(초). */
function rampUp(k: number, span: number, p: number): number {
  return k > 0 ? (span / k) * Math.log(1 + k * p) : span * p;
}

/** 온도가 1 → 0 으로 선형으로 내리는 단계 D 초 중 진행도 p 까지의 같은 적분(초). */
function rampDown(k: number, span: number, p: number): number {
  return k > 0 ? (span / k) * (Math.log(1 + k) - Math.log(1 + k * (1 - p))) : span * p;
}

/** 한 주기 안 시각 0 → 지금까지 빠르기 비의 적분(초) — 「차가울 때 빠르기로 환산한 흐른 시간」. */
function metalEffectiveTime(c: TemperatureAndResistanceConstants, tl: TimelineFrame, whole: boolean): number {
  const k = metalK(c);
  const at = (id: string): number => (whole ? 1 : tl.at(id));
  return (
    tl.duration('cold') * at('cold') +
    rampUp(k, tl.duration('heat'), at('heat')) +
    (tl.duration('hot') * at('hot')) / (1 + k) +
    rampDown(k, tl.duration('cool'), at('cool'))
  );
}

/** 금속 전자가 조각 시계 0 부터 흐른 거리(월드). 주기마다 한 주기 적분을 더하므로 주기 경계에서 끊기지 않는다. */
export function metalTravel(c: TemperatureAndResistanceConstants, tl: TimelineFrame): number {
  return c.metalSpeed * (tl.cycle * metalEffectiveTime(c, tl, true) + metalEffectiveTime(c, tl, false));
}

/** 지금 금속 전자 빠르기(월드/초) — 꼬리 길이에 쓴다. */
export function metalSpeedNow(c: TemperatureAndResistanceConstants, x: number): number {
  return c.metalSpeed * metalCurrentRatio(c, x);
}

/** 막대 안 전자 간격(월드). 막대 길이를 선언 간격에 가장 가깝게 나눠 떨어지게 한다. */
export function pitchOf(spacing: number, length: number): number {
  return length / Math.max(1, Math.round(length / spacing));
}

/** 금속 레인 하나의 전자 자리 — 입구에서 잰 막대 안 거리 목록. 레인마다 반 칸 엇갈린다. */
export function metalLaneOffsets(
  c: TemperatureAndResistanceConstants,
  length: number,
  travel: number,
  lane: number,
): number[] {
  const pitch = pitchOf(c.carrierSpacing, length);
  const n = Math.round(length / pitch);
  const head = travel + (lane % 2) * (pitch / 2);
  const out: number[] = [];
  for (let k = 0; k < n; k++) out.push(wrap(head + k * pitch, length));
  return out;
}

// ------------------------------------------------------------------------
// 반도체 — 나르개 쌍 수가 는다
// ------------------------------------------------------------------------

/** 데워진 정도 x 에서 있는 쌍 수(정수). n₀ (n₁/n₀)^x 의 내림. */
export function pairCount(c: TemperatureAndResistanceConstants, x: number): number {
  const n0 = Math.max(1, Math.round(c.pairsCold));
  const n1 = Math.max(n0, Math.round(c.pairsHot));
  if (x >= 1) return n1;
  if (x <= 0) return n0;
  return Math.min(n1, Math.floor(n0 * Math.pow(n1 / n0, x) + 1e-9));
}

/** 반도체의 전류 비 I(T)/I(T₀) — 빠르기가 같으므로 쌍 수 비. */
export function semiCurrentRatio(c: TemperatureAndResistanceConstants, x: number): number {
  return pairCount(c, x) / Math.max(1, Math.round(c.pairsCold));
}

/** 쌍 k(k ≥ n₀)가 생기는 데워진 정도 x_k — n(x) 가 k + 1 에 닿는 x. */
export function pairThreshold(c: TemperatureAndResistanceConstants, k: number): number {
  const n0 = Math.max(1, Math.round(c.pairsCold));
  const n1 = Math.max(n0, Math.round(c.pairsHot));
  if (k < n0) return 0;
  if (n1 === n0) return 1;
  return Math.log((k + 1) / n0) / Math.log(n1 / n0);
}

/** 쌍 하나 — 생긴 자리(입구에서 잰 거리), 레인(0 · 1), 생긴 뒤 흐른 시간(초). */
export interface CarrierPair {
  index: number;
  site: number;
  lane: number;
  age: number;
}

/**
 * 지금 있는 쌍 목록. 처음부터 있던 쌍(k < n₀)은 조각 시계 전체를 나이로 쓴다. 데우며 생긴 쌍은
 * 이번 주기에서 x 가 문턱을 넘은 시각부터 나이를 센다 — 데움 단계가 선형이라 그 시각은
 * `start('heat') + x_k · duration('heat')`. 식힘에서 x 가 문턱 밑으로 내려가면 사라진다(재결합).
 */
export function pairsNow(
  c: TemperatureAndResistanceConstants,
  length: number,
  tl: TimelineFrame,
  x: number,
): CarrierPair[] {
  const n0 = Math.max(1, Math.round(c.pairsCold));
  const n = pairCount(c, x);
  const out: CarrierPair[] = [];
  for (let k = 0; k < n; k++) {
    const site = length * hash01(c.seed, STREAM.pairSite, k);
    const lane = hash01(c.seed, STREAM.pairLane, k) < 0.5 ? 0 : 1;
    const born = tl.start('heat') + pairThreshold(c, k) * tl.duration('heat');
    const age = k < n0 ? tl.t : Math.max(0, tl.u - born);
    out.push({ index: k, site, lane, age });
  }
  return out;
}

/** 막대 안 거리를 [0, length) 로 감는다. */
export function wrap(s: number, length: number): number {
  return ((s % length) + length) % length;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: TemperatureAndResistanceState }): TemperatureAndResistanceState {
  return params.state;
}
