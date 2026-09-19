// ========================================================================
// joule-heating — 순수 물리
// ========================================================================
// 두 저항이 한 줄로 이어져 있어 같은 전류 I = V / (R₁ + R₂) 가 흐른다. 저항 하나가 1 초에
// 내는 열은 I²R 이고, 두 덩어리의 열용량 C 가 같으므로 온도는 I²R / C 의 빠르기로 곧게
// 오른다 — 저항이 큰 쪽이 그 비만큼 빨리 오른다. 식는 것은 흐름이 멎은 뒤 `cool` 단계
// 하나에 맡긴다(달아오르는 동안의 열 손실은 두지 않는다 — NOTES (b)).
//
// 모든 것이 조각 시계의 닫힌 식이다. 떨림도 (시드, 시각)의 함수라 같은 시각은 언제나
// 같은 화면이다. 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CARRIER_SPACING,
  COLUMN_WORLD_PER_KELVIN,
  FLOW_SPEED_PER_AMP,
  HEAT_CAPACITY,
  JITTER_FREQ_MAX,
  JITTER_FREQ_MIN,
  JITTER_PER_KELVIN,
  JITTER_REST,
  RESISTANCE_LARGE,
  RESISTANCE_SMALL,
  SEED,
  TRAIL_SECONDS,
  VOLTAGE,
} from './schema';
import type { JouleHeatingState } from './state';

export interface JouleHeatingConstants {
  voltage: number;
  resistanceLarge: number;
  resistanceSmall: number;
  heatCapacity: number;
  flowSpeedPerAmp: number;
  carrierSpacing: number;
  trailSeconds: number;
  columnWorldPerKelvin: number;
  jitterRest: number;
  jitterPerKelvin: number;
  jitterFreqMin: number;
  jitterFreqMax: number;
  seed: number;
}

export function readConstants(stage: StageDef): JouleHeatingConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    voltage: c.voltage ?? VOLTAGE,
    resistanceLarge: c.resistanceLarge ?? RESISTANCE_LARGE,
    resistanceSmall: c.resistanceSmall ?? RESISTANCE_SMALL,
    heatCapacity: c.heatCapacity ?? HEAT_CAPACITY,
    flowSpeedPerAmp: c.flowSpeedPerAmp ?? FLOW_SPEED_PER_AMP,
    carrierSpacing: c.carrierSpacing ?? CARRIER_SPACING,
    trailSeconds: c.trailSeconds ?? TRAIL_SECONDS,
    columnWorldPerKelvin: c.columnWorldPerKelvin ?? COLUMN_WORLD_PER_KELVIN,
    jitterRest: c.jitterRest ?? JITTER_REST,
    jitterPerKelvin: c.jitterPerKelvin ?? JITTER_PER_KELVIN,
    jitterFreqMin: c.jitterFreqMin ?? JITTER_FREQ_MIN,
    jitterFreqMax: c.jitterFreqMax ?? JITTER_FREQ_MAX,
    seed: c.seed ?? SEED,
  };
}

/** 직렬 회로의 전류(A) — 두 저항에 같다. */
export function seriesCurrent(c: JouleHeatingConstants): number {
  return c.voltage / (c.resistanceLarge + c.resistanceSmall);
}

/** 저항 하나에서 온도가 오르는 빠르기(K/s) = I²R / C. */
export function heatingRate(current: number, resistance: number, heatCapacity: number): number {
  return (current * current * resistance) / heatCapacity;
}

/** 전류가 흐르는 구간 — `close` 가 끝난 순간부터 `open` 이 시작하는 순간까지(주기 안 시각). */
function onWindow(tl: TimelineFrame): { from: number; to: number } {
  return { from: tl.end('close'), to: tl.start('open') };
}

/** 이번 주기에 전류가 흐른 시간(초). */
function heatedTime(tl: TimelineFrame): number {
  const w = onWindow(tl);
  return Math.max(0, Math.min(tl.u, w.to) - w.from);
}

/** 지금 전류가 흐르는가. */
export function currentOn(tl: TimelineFrame): boolean {
  const w = onWindow(tl);
  return tl.u >= w.from && tl.u < w.to;
}

/**
 * 실온에서 오른 온도(K). 흐르는 동안 `rate` 로 곧게 오르고, `cool` 단계에서 실온으로 돌아간다.
 * 다음 주기의 `rest` 에서는 0 이다.
 */
export function temperatureRise(tl: TimelineFrame, rate: number): number {
  return rate * heatedTime(tl) * (1 - tl.at('cool'));
}

/** 스위치 레버의 들린 각(라디안) — `close` 동안 내려오고 `open` 동안 다시 들린다. */
export function switchAngle(tl: TimelineFrame, openAngle: number): number {
  return openAngle * (1 - tl.at('close') + tl.at('open'));
}

/**
 * 알갱이가 조각 시계 0 부터 흐른 거리(월드)를 고리 둘레로 접은 값. 전류가 흐르는 동안에만
 * `speed` 로 나아가고, 스위치가 열린 동안에는 제자리다.
 */
export function flowDistance(tl: TimelineFrame, speed: number, loopLength: number): number {
  const w = onWindow(tl);
  const perCycle = speed * (w.to - w.from);
  const wrapped = ((tl.cycle * perCycle) % loopLength) + speed * heatedTime(tl);
  return ((wrapped % loopLength) + loopLength) % loopLength;
}

// ------------------------------------------------------------------------
// 원자 떨림 — (시드, 시각)의 함수
// ------------------------------------------------------------------------

/** 시드 결정적 난수(mulberry32). `Math.random` 을 쓰지 않는다 (S-sim). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 원자 하나의 떨림 모양 — 가로 · 세로 진동수(Hz)와 위상. */
export interface JitterVoice {
  fx: number;
  fy: number;
  px: number;
  py: number;
}

/** 원자 `count` 개의 떨림 모양. 덩어리마다 다른 시드 줄(`stream`)을 쓴다. */
export function jitterVoices(
  seed: number,
  stream: number,
  count: number,
  freqMin: number,
  freqMax: number,
): JitterVoice[] {
  const r = rng(seed * 7919 + stream * 104729);
  const out: JitterVoice[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      fx: freqMin + (freqMax - freqMin) * r(),
      fy: freqMin + (freqMax - freqMin) * r(),
      px: 2 * Math.PI * r(),
      py: 2 * Math.PI * r(),
    });
  }
  return out;
}

/** 시각 t 에서 원자 하나가 제자리에서 벗어난 거리(월드). 폭은 `amplitude`. */
export function jitterOffset(v: JitterVoice, t: number, amplitude: number): Vec2 {
  return [
    amplitude * Math.sin(2 * Math.PI * v.fx * t + v.px),
    amplitude * Math.sin(2 * Math.PI * v.fy * t + v.py),
  ];
}

// ------------------------------------------------------------------------
// 닫힌 폴리라인 위의 자리 — 알갱이와 길을 따르는 꼬리
// ------------------------------------------------------------------------

/** 닫힌 폴리라인의 누적 호길이. 마지막 값이 둘레다(끝점 → 첫 점 변 포함). */
export function cumulativeLengths(path: readonly Vec2[]): number[] {
  const out = [0];
  for (let i = 0; i < path.length; i++) {
    const a = path[i]!;
    const b = path[(i + 1) % path.length]!;
    out.push(out[i]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  return out;
}

/** 닫힌 폴리라인에서 호길이 s 의 자리. */
export function pointAt(path: readonly Vec2[], lengths: readonly number[], s: number): Vec2 {
  const total = lengths[lengths.length - 1]!;
  const t = ((s % total) + total) % total;
  let i = 0;
  while (i < path.length - 1 && lengths[i + 1]! <= t) i++;
  const a = path[i]!;
  const b = path[(i + 1) % path.length]!;
  const seg = lengths[i + 1]! - lengths[i]!;
  const f = seg > 0 ? (t - lengths[i]!) / seg : 0;
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

/** 닫힌 폴리라인에서 호길이 구간 [a, b] 의 조각(0 ≤ a < b ≤ 둘레). 모서리를 그대로 따라간다. */
export function subPath(path: readonly Vec2[], lengths: readonly number[], a: number, b: number): Vec2[] {
  const pts: Vec2[] = [pointAt(path, lengths, a)];
  for (let i = 1; i < lengths.length - 1; i++) {
    const s = lengths[i]!;
    if (s > a && s < b) pts.push(path[i]!);
  }
  const total = lengths[lengths.length - 1]!;
  pts.push(b >= total ? path[0]! : pointAt(path, lengths, b));
  return pts;
}

/**
 * 호길이 구간 [from, to](둘레를 넘나들 수 있다)를 둘레 안의 구간들로 펴고, 가려진 구간
 * `hidden`(둘레 안, 넘나들지 않음)을 뺀다. 꼬리가 전지 판 위에 그어지지 않게.
 */
export function visibleArcs(
  from: number,
  to: number,
  total: number,
  hidden: readonly [number, number],
): [number, number][] {
  const a = ((from % total) + total) % total;
  const len = to - from;
  const spans: [number, number][] = a + len <= total ? [[a, a + len]] : [[a, total], [0, a + len - total]];
  const out: [number, number][] = [];
  for (const [s0, s1] of spans) {
    if (s0 < hidden[0]) out.push([s0, Math.min(s1, hidden[0])]);
    if (s1 > hidden[1]) out.push([Math.max(s0, hidden[1]), s1]);
  }
  return out.filter(([s0, s1]) => s1 - s0 > 1e-6);
}

/** 고리 위 알갱이 수 — 둘레를 선언 간격에 가장 가깝게 나눠 떨어지게 한다. */
export function carrierCount(loopLength: number, spacing: number): number {
  return Math.max(1, Math.round(loopLength / spacing));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: JouleHeatingState }): JouleHeatingState {
  return params.state;
}
