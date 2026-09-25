// ========================================================================
// sound-intensity — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 고리의 반지름 · 귀의 자리 · 두 막대의 높이가 모두 시간표 시각과
// 스테이지 상수의 함수다. `step` 은 항등이다.
//
// 거리 d = m · r (m 은 기준 거리 r 의 몇 배인가) 에서
//
//   세기      I(m) / I(r) = 1 / m²                 같은 출력이 넓이 4π d² 에 나뉜다
//   세기 준위 L(m) = L(r) − 20 · log₁₀ m   [dB]    10 · log₁₀(I/I₀) 에 위를 넣은 것
//
// 막대 높이는 이 식으로 계산한다. 화면 글자는 계산값이 아니라 스테이지 정박값이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  INTENSITY_RATIO_2,
  INTENSITY_RATIO_3,
  LEVEL_1,
  LEVEL_2,
  LEVEL_3,
  MULTIPLE_2,
  MULTIPLE_3,
  RADIUS,
  RING_PERIOD,
  SOUND_SPEED,
} from './schema';
import type { SoundIntensityState } from './state';

export interface SoundConstants {
  radius: number;
  multiple2: number;
  multiple3: number;
  intensityRatio2: number;
  intensityRatio3: number;
  level1: number;
  level2: number;
  level3: number;
  ringPeriod: number;
  soundSpeed: number;
}

export function readConstants(stage: StageDef): SoundConstants {
  const c = stage.constants ?? {};
  return {
    radius: c.radius ?? RADIUS,
    multiple2: c.multiple2 ?? MULTIPLE_2,
    multiple3: c.multiple3 ?? MULTIPLE_3,
    intensityRatio2: c.intensityRatio2 ?? INTENSITY_RATIO_2,
    intensityRatio3: c.intensityRatio3 ?? INTENSITY_RATIO_3,
    level1: c.level1 ?? LEVEL_1,
    level2: c.level2 ?? LEVEL_2,
    level3: c.level3 ?? LEVEL_3,
    ringPeriod: c.ringPeriod ?? RING_PERIOD,
    soundSpeed: c.soundSpeed ?? SOUND_SPEED,
  };
}

/** 거리 배수 m 에서의 세기 — r 의 세기를 1 로 둔 비. m < 1 이면 1 로 자른다(음원 곁은 다루지 않는다). */
export function relativeIntensity(m: number): number {
  const k = Math.max(1, m);
  return 1 / (k * k);
}

/** 거리 배수 m 에서의 세기 준위(dB). */
export function levelAt(m: number, level1: number): number {
  return level1 - 20 * Math.log10(Math.max(1, m));
}

/**
 * 지금 귀가 선 거리 배수. 멈춘 자리는 1 · multiple2 · multiple3 이고, 사이는 물러나는
 * 단계의 진행도로 잇는다. `back` 에서 처음 자리로 돌아간다.
 */
export function listenerMultiple(tl: TimelineFrame, c: SoundConstants): number {
  const out = 1 + (c.multiple2 - 1) * tl.at('move2') + (c.multiple3 - c.multiple2) * tl.at('move3');
  return out + (1 - out) * tl.at('back');
}

/**
 * 멈춘 자리 k(0 · 1 · 2)에 막대 쌍이 남아 있는가(0~1 짙기). 첫 자리는 늘 있고, 둘째 ·
 * 셋째는 귀가 도착한 뒤부터 되돌아가는 동안 흐려진다.
 */
export function recordOpacity(tl: TimelineFrame, k: number): number {
  if (k === 0) return 1;
  const arrived = k === 1 ? tl.at('move2') >= 1 : tl.at('move3') >= 1;
  return arrived ? 1 - tl.at('back') : 0;
}

/** 귀가 지금 움직이는 중인가 — 움직이는 동안만 귀 아래에 살아 있는 막대 쌍을 둔다. */
export function isMoving(tl: TimelineFrame): boolean {
  return tl.phase === 'move2' || tl.phase === 'move3';
}

/**
 * 시각 t 에 떠 있는 고리의 반지름들. k 번째 고리는 k · 주기에 음원을 떠나 소리 빠르기로
 * 퍼진다. 음수 k 도 세므로 첫 프레임부터 띠가 차 있다(프리롤이 필요 없다). `maxRadius`
 * 를 넘은 고리는 뺀다.
 */
export function ringRadii(t: number, c: SoundConstants, maxRadius: number): number[] {
  const out: number[] = [];
  const kMax = Math.floor(t / c.ringPeriod);
  const kMin = Math.ceil((t - maxRadius / c.soundSpeed) / c.ringPeriod);
  for (let k = kMax; k >= kMin; k--) {
    const R = (t - k * c.ringPeriod) * c.soundSpeed;
    if (R > 0 && R <= maxRadius) out.push(R);
  }
  return out;
}

/** 쌓는 상태가 없다. */
export function step(params: { state: SoundIntensityState }): SoundIntensityState {
  return params.state;
}
