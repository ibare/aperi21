// ========================================================================
// digital-vs-analog-signal — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 잡음은 (시드, 구간 번호, 표본 번호)의 함수이고, 모든 칸의 신호가
// 그 잡음과 스테이지 상수에서 곧바로 나온다. `step` 은 항등이다.
//
// 한 구간과 그 끝의 중계기가 하는 일 (신호는 「1 준위」 = 1 인 상대값):
//
//   도착      r_k(x) = a · s_{k−1}(x) + n_k(x)        약해지고 잡음이 섞인다
//   아날로그  s_k(x) = r_k(x) / a = s_{k−1}(x) + n_k(x)/a
//             → 잡음도 1/a 배로 커져 다음 구간으로 넘어가고, 구간마다 쌓인다
//   디지털    s_k = 비트마다 r_k(비트 가운데) > a · 문턱 ? 1 : 0
//             → 잡음은 판정에서 버려지고 두 준위가 새로 만들어진다
//
// 두 줄은 **같은 잡음**을 받는다. 같은 선로를 지나기 때문이다 — 다른 잡음을 주면
// 「아래 줄이 운이 좋았다」 가 의심으로 남는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  ANALOG_MEAN,
  ATTENUATION,
  BIT_COUNT,
  BITS,
  NOISE,
  RELAYS,
  SEED,
  THRESHOLD,
  TONE1,
  TONE2,
} from './schema';
import type { DigitalVsAnalogSignalState } from './state';

/** 한 칸의 신호를 표본하는 점 수. 상태로 계산하지 않는다. */
export const SAMPLES = 160;
/** 한 칸 폭 안의 잡음 마디 수. 마디 사이는 부드럽게 잇는다 — 표본마다 뛰면 굵은 띠로 뭉친다. */
export const NOISE_KNOTS = 26;

export interface SignalConstants {
  seed: number;
  noise: number;
  attenuation: number;
  threshold: number;
  relays: number;
  /** 아날로그 메시지 — 가운데 값과 두 사인(진폭 · 칸 안 주기 수 · 위상). */
  analog: AnalogMessage;
  /** 디지털 메시지 — 비트 값(`bit0` …). 길이는 `BIT_COUNT`. */
  bits: readonly number[];
}

export interface Tone {
  amp: number;
  cycles: number;
  phase: number;
}

export interface AnalogMessage {
  mean: number;
  tones: readonly Tone[];
}

export function readConstants(stage: StageDef): SignalConstants {
  const c = stage.constants ?? {};
  return {
    seed: c.seed ?? SEED,
    noise: c.noise ?? NOISE,
    attenuation: c.attenuation ?? ATTENUATION,
    threshold: c.threshold ?? THRESHOLD,
    relays: Math.max(0, Math.round(c.relays ?? RELAYS)),
    analog: {
      mean: c.analogMean ?? ANALOG_MEAN,
      tones: [
        {
          amp: c.tone1Amp ?? TONE1.amp,
          cycles: c.tone1Cycles ?? TONE1.cycles,
          phase: c.tone1Phase ?? TONE1.phase,
        },
        {
          amp: c.tone2Amp ?? TONE2.amp,
          cycles: c.tone2Cycles ?? TONE2.cycles,
          phase: c.tone2Phase ?? TONE2.phase,
        },
      ],
    },
    bits: Array.from({ length: BIT_COUNT }, (_, i) => ((c[`bit${i}`] ?? BITS[i] ?? 0) > 0.5 ? 1 : 0)),
  };
}

// ------------------------------------------------------------------------
// 결정적 난수 — 시드를 받는다. Math.random 을 쓰지 않는다 (S-sim).
// ------------------------------------------------------------------------

/** 정수 셋을 섞어 [−1, 1] 의 값 하나를 낸다. 같은 입력은 언제나 같은 값이다. */
function hashUnit(seed: number, hop: number, knot: number): number {
  let h = (seed | 0) ^ Math.imul(hop + 1, 0x9e3779b1) ^ Math.imul(knot + 1, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h ^= h >>> 16;
  return ((h >>> 0) / 0xffffffff) * 2 - 1;
}

/**
 * 구간 `hop` 에서 섞이는 잡음, 칸 안 자리 x(0~1). 크기는 언제나 `amp` 이하다 —
 * 마디 값이 [−1, 1] 이고 사이를 볼록 결합으로 잇기 때문이다.
 */
export function noiseAt(seed: number, hop: number, x: number, amp: number): number {
  const f = Math.min(Math.max(x, 0), 1) * NOISE_KNOTS;
  const j = Math.min(Math.floor(f), NOISE_KNOTS - 1);
  const t = f - j;
  const w = t * t * (3 - 2 * t);
  return amp * ((1 - w) * hashUnit(seed, hop, j) + w * hashUnit(seed, hop, j + 1));
}

// ------------------------------------------------------------------------
// 메시지
// ------------------------------------------------------------------------

/** 아날로그 줄이 보내는 전압 모양, x 는 칸 안 자리(0~1). 0 · 1 준위 사이에 머문다. */
export function analogMessage(m: AnalogMessage, x: number): number {
  let v = m.mean;
  for (const h of m.tones) v += h.amp * Math.sin(2 * Math.PI * h.cycles * x + h.phase);
  return v;
}

/** 디지털 줄이 보내는 준위, x 는 칸 안 자리(0~1). */
export function bitAt(bits: readonly number[], x: number): number {
  const i = Math.min(bits.length - 1, Math.max(0, Math.floor(x * bits.length)));
  return bits[i]!;
}

// ------------------------------------------------------------------------
// 칸마다의 신호
// ------------------------------------------------------------------------

/** 칸 하나에 놓이는 것. 값은 칸 안 자리 0~1 에 대한 신호 세기. */
export interface Station {
  /** 아날로그 — 이 칸에 도착한 신호(약해지고 잡음이 섞인 것, 표본). 출발 칸은 없다. */
  analogArrived?: readonly number[];
  /** 아날로그 — 중계기가 내보낸 신호(표본). */
  analogOut: readonly number[];
  /** 디지털 — 이 칸에 도착한 신호(표본). 출발 칸은 없다. */
  digitalArrived?: readonly number[];
  /** 디지털 — 중계기가 판정해 내보낸 비트. */
  digitalBits: readonly number[];
}

/** 표본 자리 i → 칸 안 x(0~1). */
export const sampleX = (i: number): number => i / (SAMPLES - 1);

/**
 * 출발 칸부터 도착 칸까지 (중계기 수 + 2) 칸의 신호를 모두 낸다.
 * 시각을 받지 않는다 — 화면에 얼마나 그려졌는지는 scene 이 시간표로 정한다.
 */
export function deriveStations(c: SignalConstants): Station[] {
  const a = c.attenuation;
  const cut = a * c.threshold;
  const xs = Array.from({ length: SAMPLES }, (_, i) => sampleX(i));

  let analog = xs.map((x) => analogMessage(c.analog, x));
  let bits: readonly number[] = c.bits;
  const out: Station[] = [{ analogOut: analog, digitalBits: bits }];

  const hops = c.relays + 1;
  for (let k = 1; k <= hops; k++) {
    const noise = xs.map((x) => noiseAt(c.seed, k, x, c.noise));

    const prevAnalog = analog;
    const arrived = xs.map((_, i) => a * prevAnalog[i]! + noise[i]!);
    analog = arrived.map((r) => r / a);

    const prevBits = bits;
    const digitalArrived = xs.map((x, i) => a * bitAt(prevBits, x) + noise[i]!);
    // 비트 가운데 한 점에서 판정한다 — 받는 쪽이 실제로 하는 일이다.
    bits = prevBits.map((_, b) => {
      const xc = (b + 0.5) / prevBits.length;
      const r = a * prevBits[b]! + noiseAt(c.seed, k, xc, c.noise);
      return r > cut ? 1 : 0;
    });

    out.push({ analogArrived: arrived, analogOut: analog, digitalArrived, digitalBits: bits });
  }
  return out;
}

/** 쌓는 상태가 없다. */
export function step(params: { state: DigitalVsAnalogSignalState }): DigitalVsAnalogSignalState {
  return params.state;
}
