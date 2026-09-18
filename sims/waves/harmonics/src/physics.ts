// ========================================================================
// harmonics — 순수 물리
// ========================================================================
// 진동자(x = 0)가 작은 폭으로 줄을 흔들고, x = L 은 묶여 있다. 진동수 f 에서의
// 정상 응답은
//
//   y(x, t) = R(f) · sin(k(L − x)) · cos φ(t),   k = 2πf / v
//   R(f)    = a / √(sin²(kL) + γ²)
//
// 이다. 묶인 끝에서 언제나 y(L) = 0 이다. kL = nπ — 반파장 n 개가 줄 길이에 딱 맞을 때 —
// sin(kL) = 0 이 되어 R 이 a / γ 까지 치솟는다. 그 밖에서는 R ≈ a 로 진동자만큼만 흔들린다.
// γ 는 감쇠를 현상으로 넣은 것이다. 진동수를 천천히 바꾸므로 매 순간 정상 응답에 있다고 본다
// (준정적). a 는 봉우리 높이가 `peakAmplitude` 가 되도록 a = peakAmplitude · γ 로 둔다.
//
// 점선 틀은 그 진동수가 요구하는 모양을 진동자에서 출발시킨 것이다 — ± P · sin(kx).
// 오른쪽 끝 높이 P · sin(kL) 이 0 이면 틀이 매듭에 닿고, 그때 줄의 흔들림 모양과 겹친다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  DAMPING,
  HARMONIC_COUNT,
  PEAK_AMPLITUDE,
  STRING_LENGTH,
  SWEEP_FROM,
  SWEEP_TO,
  WAVE_SPEED,
} from './schema';
import type { HarmonicsState } from './state';

export interface HarmonicsConstants {
  /** 줄 길이(월드). */
  stringLength: number;
  /** 파속(월드/초). */
  waveSpeed: number;
  /** 보일 배음 수 — 시간표의 `hold-n` 단계 수와 같다. */
  harmonicCount: number;
  /** 반파장이 맞았을 때 배의 높이(월드). */
  peakAmplitude: number;
  /** 감쇠(무차원). */
  damping: number;
  /** 훑기 시작 · 끝 진동수(f₁ 단위). */
  sweepFrom: number;
  sweepTo: number;
}

export function readConstants(stage: StageDef): HarmonicsConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    stringLength: c.stringLength ?? STRING_LENGTH,
    waveSpeed: c.waveSpeed ?? WAVE_SPEED,
    harmonicCount: c.harmonicCount ?? HARMONIC_COUNT,
    peakAmplitude: c.peakAmplitude ?? PEAK_AMPLITUDE,
    damping: c.damping ?? DAMPING,
    sweepFrom: c.sweepFrom ?? SWEEP_FROM,
    sweepTo: c.sweepTo ?? SWEEP_TO,
  };
}

/** 기본 진동수 f₁ = v / 2L (Hz). */
export function fundamental(c: HarmonicsConstants): number {
  return c.waveSpeed / (2 * c.stringLength);
}

/** 한 단계 동안 구동 진동수(f₁ 단위)가 가는 구간. */
interface Leg {
  id: string;
  from: number;
  to: number;
}

/**
 * 시간표 단계와 진동수 구간의 짝. 머무는 단계(`hold-n`)는 반파장이 맞는 n 에 선다.
 * 단계 이름과 순서는 선언(`schema.timeline`)이 정하고, 여기는 각 단계가 진동수를
 * 어디서 어디로 옮기는지만 안다.
 */
function legs(c: HarmonicsConstants): Leg[] {
  const out: Leg[] = [{ id: 'rise', from: c.sweepFrom, to: 1 }, { id: 'hold-1', from: 1, to: 1 }];
  for (let n = 2; n <= c.harmonicCount; n++) {
    out.push({ id: `sweep-${n}`, from: n - 1, to: n });
    out.push({ id: `hold-${n}`, from: n, to: n });
  }
  out.push({ id: 'tail', from: c.harmonicCount, to: c.sweepTo });
  out.push({ id: 'rest', from: c.sweepTo, to: c.sweepTo });
  return out;
}

/** 지금 구동 진동수(f₁ 단위). 진행도는 앞 단계에서 1, 뒤 단계에서 0 이라 합이 곧 지금 값이다. */
export function driveRatio(tl: TimelineFrame, c: HarmonicsConstants): number {
  let r = c.sweepFrom;
  for (const leg of legs(c)) r += (leg.to - leg.from) * tl.at(leg.id);
  return r;
}

/**
 * 진동 위상 φ = 2π ∫ f dt (주기 시작부터). 단계마다 진동수가 선형으로 가므로
 * 흐른 몫 p 에 대해 ∫ = D · f₁ · (p · from + (to − from) · p² / 2) 이다.
 */
export function drivePhase(tl: TimelineFrame, c: HarmonicsConstants): number {
  const f1 = fundamental(c);
  let cycles = 0;
  for (const leg of legs(c)) {
    const p = tl.at(leg.id);
    cycles += tl.duration(leg.id) * f1 * (p * leg.from + ((leg.to - leg.from) * p * p) / 2);
  }
  return 2 * Math.PI * cycles;
}

/** 파수 k (라디안/월드). 진동수는 f₁ 단위로 받는다. */
function waveNumber(ratio: number, c: HarmonicsConstants): number {
  return (2 * Math.PI * ratio * fundamental(c)) / c.waveSpeed;
}

/** 줄의 흔들림 크기 R(f) — 배의 높이(월드). 반파장이 맞으면 `peakAmplitude`. */
export function response(ratio: number, c: HarmonicsConstants): number {
  const s = Math.sin(waveNumber(ratio, c) * c.stringLength);
  const drive = c.peakAmplitude * c.damping;
  return drive / Math.sqrt(s * s + c.damping * c.damping);
}

/** 줄 위 x 의 변위(평형에서). */
export function displacement(x: number, ratio: number, phase: number, c: HarmonicsConstants): number {
  const k = waveNumber(ratio, c);
  return response(ratio, c) * Math.sin(k * (c.stringLength - x)) * Math.cos(phase);
}

/** 점선 틀 — 이 진동수가 요구하는 모양을 진동자(x = 0)에서 출발시킨 높이. */
export function template(x: number, ratio: number, c: HarmonicsConstants): number {
  return c.peakAmplitude * Math.sin(waveNumber(ratio, c) * x);
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: HarmonicsState }): HarmonicsState {
  return params.state;
}
