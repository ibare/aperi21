// ========================================================================
// reflection-of-waves — 순수 물리
// ========================================================================
// 끝이 있는 줄 위의 펄스를 **거울상**으로 푼다. 끝 x = L 너머에 거울에 비친 펄스가
// 반대로 달려온다고 두면, 두 펄스의 합이 끝의 조건을 그대로 만족한다.
//
//   고정단:  y(x) = f(x − s) − f(2L − x − s)    → y(L) = 0     (끝이 움직이지 않는다)
//   자유단:  y(x) = f(x − s) + f(2L − x − s)    → y'(L) = 0    (끝에서 줄이 수평 — 고리가 미끄러진다)
//
// s 는 펼친 좌표 위의 펄스 중심이다. s 가 L 을 넘으면 거울상이 줄 안으로 들어와
// 되돌아오는 펄스가 된다 — 고정단에서는 부호가 뒤집힌 채로, 자유단에서는 그대로.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { HIT_REACH, PULSE_AMPLITUDE, PULSE_ENTRY, PULSE_WIDTH, STRING_LENGTH } from './schema';
import type { ReflectionOfWavesState } from './state';

export interface ReflectionConstants {
  /** 줄 길이(월드). 반사하는 끝이 x = L. */
  stringLength: number;
  /** 펄스 높이(월드). */
  amplitude: number;
  /** 펄스 폭(월드). */
  pulseWidth: number;
  /** 펄스가 줄 밖에서 들어오는 거리(월드). */
  entry: number;
  /** `hit` 단계 구간의 반너비(월드). */
  hitReach: number;
}

export function readConstants(stage: StageDef): ReflectionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    stringLength: c.stringLength ?? STRING_LENGTH,
    amplitude: c.amplitude ?? PULSE_AMPLITUDE,
    pulseWidth: c.pulseWidth ?? PULSE_WIDTH,
    entry: c.entry ?? PULSE_ENTRY,
    hitReach: c.hitReach ?? HIT_REACH,
  };
}

/** 끝의 종류. 반사된 펄스의 부호가 여기서 갈린다. */
export type EndKind = 'fixed' | 'free';

/**
 * 펼친 좌표 위의 펄스 중심 s. 단계마다 진행도를 제 구간에 잇는다 — 진행도는 앞 단계에서
 * 1, 뒤 단계에서 0 이라 합이 곧 지금 자리다. 단계 경계는 선언이 정한다.
 */
export function pulseCenter(tl: TimelineFrame, c: ReflectionConstants): number {
  const leg = c.stringLength - c.hitReach + c.entry;
  return (
    -c.entry +
    leg * tl.at('approach') +
    2 * c.hitReach * tl.at('hit') +
    leg * tl.at('return')
  );
}

/** 가우스 꼴 펄스 하나. d 는 펄스 중심에서의 거리. */
function pulse(d: number, c: ReflectionConstants): number {
  const q = d / c.pulseWidth;
  return c.amplitude * Math.exp(-q * q);
}

/** 줄 위 x 의 변위. 들어가는 펄스 + 끝 너머 거울상(고정단은 뒤집힌 채). */
export function displacement(x: number, s: number, end: EndKind, c: ReflectionConstants): number {
  const sign = end === 'fixed' ? -1 : 1;
  return pulse(x - s, c) + sign * pulse(2 * c.stringLength - x - s, c);
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ReflectionOfWavesState }): ReflectionOfWavesState {
  return params.state;
}
