// ========================================================================
// string-vibration — 순수 물리
// ========================================================================
// 손가락이 x_f 를 누르면 x_f ~ L(줄받침) 부분만 흔들린다. 그 길이 ℓ = L − x_f 가 양끝이
// 묶인 줄이 되어 기본 모양(반파장 하나)으로 흔들린다 —
//
//   y(x, t) = A · sin(π (x − x_f) / ℓ) · cos φ(t),   f = v / 2ℓ
//
// 너트 ~ 손가락 부분은 눌려 있어 흔들리지 않는다. 손가락이 미끄러지는 동안 ℓ 이 바뀌므로
// 위상은 진동수를 시간으로 적분한 φ = 2π ∫ f dt 다. 미끄러지는 단계는 ℓ 이 진행도 p 에
// 선형이라(ℓ = a + (b − a) p) 적분이 닫힌 꼴이다 —
//
//   ∫₀ᵖ D · v / (2 (a + (b − a) s)) ds = D v / (2 (b − a)) · ln((a + (b − a) p) / a)
//
// 주기가 돌아오면 φ = 0 에서 다시 튕긴다(cos 0 = 1 — 가장 높은 자리에서 놓는다). 그 직전
// `mute` 단계가 흔들림을 0 으로 잦아들게 해 이음매가 보이지 않는다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  AMPLITUDE,
  SCOPE_CYCLES,
  STOP1_DEN,
  STOP1_NUM,
  STOP2_DEN,
  STOP2_NUM,
  STRING_LENGTH,
  WAVE_SPEED,
} from './schema';
import type { StringVibrationState } from './state';

export interface StringVibrationConstants {
  /** 줄 전체 길이(너트 ~ 줄받침, 월드). */
  stringLength: number;
  /** 파속(월드/초). */
  waveSpeed: number;
  /** 배의 높이(월드). */
  amplitude: number;
  /** 누르는 자리 둘 — 흔들리는 길이가 전체의 num / den. */
  stop1Num: number;
  stop1Den: number;
  stop2Num: number;
  stop2Den: number;
  /** 파형창에 담기는 시간 — 누르지 않은 줄의 흔들림 횟수로. */
  scopeCycles: number;
}

export function readConstants(stage: StageDef): StringVibrationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    stringLength: c.stringLength ?? STRING_LENGTH,
    waveSpeed: c.waveSpeed ?? WAVE_SPEED,
    amplitude: c.amplitude ?? AMPLITUDE,
    stop1Num: c.stop1Num ?? STOP1_NUM,
    stop1Den: c.stop1Den ?? STOP1_DEN,
    stop2Num: c.stop2Num ?? STOP2_NUM,
    stop2Den: c.stop2Den ?? STOP2_DEN,
    scopeCycles: c.scopeCycles ?? SCOPE_CYCLES,
  };
}

/** 흔들리는 길이 ℓ 의 진동수 f = v / 2ℓ (Hz). */
export function frequency(length: number, c: StringVibrationConstants): number {
  return c.waveSpeed / (2 * length);
}

/** 한 단계 동안 흔들리는 길이(전체 대비 몫)가 가는 구간. */
interface Leg {
  id: string;
  from: number;
  to: number;
}

/**
 * 시간표 단계와 길이 구간의 짝. 단계 이름과 순서는 선언(`schema.timeline`)이 정하고,
 * 여기는 각 단계가 흔들리는 길이를 어디서 어디로 옮기는지만 안다.
 */
function legs(c: StringVibrationConstants): Leg[] {
  const s1 = c.stop1Num / c.stop1Den;
  const s2 = c.stop2Num / c.stop2Den;
  return [
    { id: 'open', from: 1, to: 1 },
    { id: 'slide-1', from: 1, to: s1 },
    { id: 'stop-1', from: s1, to: s1 },
    { id: 'slide-2', from: s1, to: s2 },
    { id: 'stop-2', from: s2, to: s2 },
    { id: 'release', from: s2, to: 1 },
    { id: 'mute', from: 1, to: 1 },
  ];
}

/** 지금 흔들리는 길이 ℓ(월드). 진행도는 앞 단계에서 1, 뒤 단계에서 0 이라 합이 곧 지금 값이다. */
export function vibratingLength(tl: TimelineFrame, c: StringVibrationConstants): number {
  let share = 1;
  for (const leg of legs(c)) share += (leg.to - leg.from) * tl.at(leg.id);
  return share * c.stringLength;
}

/** 진동 위상 φ = 2π ∫ f dt (주기 시작부터). 단계마다 길이가 선형으로 가므로 닫힌 꼴로 더한다. */
export function vibrationPhase(tl: TimelineFrame, c: StringVibrationConstants): number {
  let cycles = 0;
  for (const leg of legs(c)) {
    const p = tl.at(leg.id);
    if (p <= 0) continue;
    const d = tl.duration(leg.id);
    const a = leg.from * c.stringLength;
    const b = leg.to * c.stringLength;
    if (a === b) {
      cycles += d * p * frequency(a, c);
    } else {
      cycles += ((d * c.waveSpeed) / (2 * (b - a))) * Math.log((a + (b - a) * p) / a);
    }
  }
  return 2 * Math.PI * cycles;
}

/** 흔들림 크기의 몫 — `mute` 단계에서 1 → 0 으로 잦아든다. */
export function envelope(tl: TimelineFrame): number {
  return 1 - tl.at('mute');
}

/** 누르지 않은 줄의 위상 — 파형창 점선. 같은 주기 시작에서 함께 튕긴다. */
export function openPhase(tl: TimelineFrame, c: StringVibrationConstants): number {
  return 2 * Math.PI * frequency(c.stringLength, c) * tl.u;
}

/** 줄 위 x 의 변위(평형에서). 손가락 왼쪽은 눌려 있어 0 이다. */
export function displacement(
  x: number,
  length: number,
  phase: number,
  env: number,
  c: StringVibrationConstants,
): number {
  const xf = c.stringLength - length;
  if (x <= xf) return 0;
  return env * c.amplitude * Math.sin((Math.PI * (x - xf)) / length) * Math.cos(phase);
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: StringVibrationState }): StringVibrationState {
  return params.state;
}
