// ========================================================================
// sound-source-vibration — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 시각의 함수이고, `step` 은 항등이다.
//
//   떨림 크기   A(t)  — 치기 전 0, 치고 나면 A, 쥐는 동안 0 까지 줄고, 그 뒤 0
//   가지 변위   d(t) = A(t) · sin(2π f (t − t_hit))
//   고리        한 번 떨 때마다(t_k = t_hit + k/f) 하나가 나오고 반지름 v·(t − t_k) 로 퍼진다.
//               고리의 짙기는 **나온 순간의 떨림 크기**다 — 떨림이 없으면 고리도 없다.
//
// 단계 경계를 상수로 두지 않는다 — 시간표의 `start(id)` · `end(id)` 로 읽는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { AMPLITUDE, FREQUENCY, RING_MAX_R, SOUND_SPEED } from './schema';
import type { SoundSourceVibrationState } from './state';

export interface SoundSourceConstants {
  /** 떨림 진동수(Hz). */
  frequency: number;
  /** 소리 빠르기(월드/초). */
  soundSpeed: number;
  /** 가지 끝 떨림 폭(월드). */
  amplitude: number;
}

export function readConstants(stage: StageDef): SoundSourceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    frequency: c.frequency ?? FREQUENCY,
    soundSpeed: c.soundSpeed ?? SOUND_SPEED,
    amplitude: c.amplitude ?? AMPLITUDE,
  };
}

/**
 * 주기 안 시각 `te` 의 떨림 크기(월드). 지금 시각이 아니라 **임의의 시각**을 묻는다 —
 * 고리마다 자기가 나온 순간의 떨림을 기억해야 하기 때문이다.
 */
export function envelopeAt(tl: TimelineFrame, te: number, c: SoundSourceConstants): number {
  const hit = tl.start('hit');
  const gripStart = tl.start('grip');
  const gripEnd = tl.end('grip');
  if (te < hit) return 0;
  if (te < gripStart) return c.amplitude;
  if (te < gripEnd) return c.amplitude * (1 - (te - gripStart) / (gripEnd - gripStart));
  return 0;
}

/** 지금 가지 끝이 바깥으로 벌어진 거리(월드). 음이면 안으로 오므라든 것이다. */
export function prongDisplacement(tl: TimelineFrame, c: SoundSourceConstants): number {
  const env = envelopeAt(tl, tl.u, c);
  if (env <= 0) return 0;
  return env * Math.sin(2 * Math.PI * c.frequency * (tl.u - tl.start('hit')));
}

export interface Ring {
  /** 몇 번째 떨림에서 나온 고리인가. id 로 쓴다. */
  index: number;
  /** 지금 반지름(월드). */
  radius: number;
  /** 나온 순간의 떨림 크기 ÷ 떨림 폭 — 0~1. */
  strength: number;
}

/** 지금 화면에 있는 고리들. 떨림이 없던 순간에는 고리가 나오지 않는다. */
export function rings(tl: TimelineFrame, c: SoundSourceConstants): Ring[] {
  const out: Ring[] = [];
  const hit = tl.start('hit');
  const last = Math.min(tl.u, tl.end('grip'));
  const period = 1 / c.frequency;
  for (let k = 0; hit + k * period <= last; k++) {
    const te = hit + k * period;
    const env = envelopeAt(tl, te, c);
    if (env <= 0) continue;
    const radius = c.soundSpeed * (tl.u - te);
    if (radius > RING_MAX_R) continue;
    out.push({ index: k, radius, strength: env / c.amplitude });
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 자리가 시각의 함수다. */
export function step(params: { state: SoundSourceVibrationState }): SoundSourceVibrationState {
  return params.state;
}
