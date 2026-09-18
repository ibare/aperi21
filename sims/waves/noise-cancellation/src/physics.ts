// ========================================================================
// noise-cancellation — 순수 물리
// ========================================================================
// 바깥 소음은 시드가 고른 사인 몇 개의 합이다. 모두 같은 속력 v 로 오른쪽(귀 쪽)으로
// 흐르므로 모양을 바꾸지 않고 미끄러진다.
//
//   n(x, t)  = Σ aᵢ · sin(kᵢ(x − v·t) + φᵢ)
//   s(x, t)  = g · f · n(x, t − τ)          f: +1 → −1 (뒤집기), g: 스피커 크기, τ: 지연
//   귀(x, t) = n(x, t) + s(x, t)
//
// f = −1, g = 1, τ = 0 이면 합은 0 이다. τ 가 0 이 아니면 n(t) − n(t − τ) 가 남는다 —
// 짧은 파장(빠른 출렁임)일수록 같은 지연에 더 크게 어긋나 많이 남는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  LAG_DELAY,
  NOISE_PARTIALS,
  NOISE_PEAK,
  NOISE_SEED,
  SOUND_SPEED,
  WAVELENGTH_MAX,
  WAVELENGTH_MIN,
} from './schema';
import type { NoiseCancellationState } from './state';

export interface NoiseCancellationConstants {
  seed: number;
  partials: number;
  /** 성분 진폭의 합(칸). */
  noisePeak: number;
  wavelengthMin: number;
  wavelengthMax: number;
  /** 소리가 흐르는 속력(칸/초). */
  speed: number;
  /** 늦어졌을 때의 지연(초). */
  lagDelay: number;
}

export function readConstants(stage: StageDef): NoiseCancellationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    seed: c.seed ?? NOISE_SEED,
    partials: c.partials ?? NOISE_PARTIALS,
    noisePeak: c.noisePeak ?? NOISE_PEAK,
    wavelengthMin: c.wavelengthMin ?? WAVELENGTH_MIN,
    wavelengthMax: c.wavelengthMax ?? WAVELENGTH_MAX,
    speed: c.speed ?? SOUND_SPEED,
    lagDelay: c.lagDelay ?? LAG_DELAY,
  };
}

/** 시드 결정적 난수(mulberry32). 같은 시드는 언제나 같은 수열이다. `Math.random` 을 쓰지 않는다. */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** 소음 성분 하나 — 진폭 · 파수 · 처음 위상. */
export interface NoisePartial {
  amp: number;
  k: number;
  phase: number;
}

/** 시드에서 소음 성분들을 뽑는다. 진폭은 합이 `noisePeak` 가 되도록 맞춘다. */
export function noisePartials(c: NoiseCancellationConstants): NoisePartial[] {
  const rand = seededRandom(c.seed);
  const n = Math.max(1, Math.round(c.partials));
  const raw: NoisePartial[] = [];
  for (let i = 0; i < n; i++) {
    const lambda = c.wavelengthMin + (c.wavelengthMax - c.wavelengthMin) * rand();
    raw.push({ amp: rand(), k: (2 * Math.PI) / lambda, phase: 2 * Math.PI * rand() });
  }
  const total = raw.reduce((s, p) => s + p.amp, 0);
  return raw.map((p) => ({ ...p, amp: (p.amp / total) * c.noisePeak }));
}

/** 시각 t 에 자리 x 의 소음 변위. */
export function noiseAt(x: number, t: number, parts: readonly NoisePartial[], speed: number): number {
  let y = 0;
  for (const p of parts) y += p.amp * Math.sin(p.k * (x - speed * t) + p.phase);
  return y;
}

/** 지금 스피커의 상태 — 선언된 단계 진행도에서만 나온다 (경계 상수 없음). */
export interface SpeakerState {
  /** 뒤집힌 정도. +1(그대로 복사) → −1(위아래 뒤집힘). */
  flip: number;
  /** 스피커 크기 0~1. 0 이면 귀에 보태지는 것이 없다. */
  gain: number;
  /** 지금 지연(초). */
  delay: number;
  /** 스피커가 꺼져 있는 동안 복사본을 옅게 보이는 정도 0~1. 주기 처음과 끝에서 0. */
  preview: number;
}

export function speakerState(tl: TimelineFrame, c: NoiseCancellationConstants): SpeakerState {
  return {
    flip: 1 - 2 * tl.at('flip'),
    gain: tl.at('play') - tl.at('off'),
    delay: c.lagDelay * tl.at('lag'),
    preview: tl.at('noise') * (1 - tl.at('off')),
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: NoiseCancellationState }): NoiseCancellationState {
  return params.state;
}
