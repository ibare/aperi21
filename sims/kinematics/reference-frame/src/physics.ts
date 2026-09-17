// ========================================================================
// reference-frame — 순수 물리
// ========================================================================
// 사건은 하나다 — 기차 안에서 놓은 공. 판마다 다른 것은 가로 위치를 무엇에 대해
// 재느냐뿐이다. 세로는 두 판이 같다.
// ========================================================================

import type { TimelineFrame } from '@aperi21/schema';
import { FALL, G, GROUND_HAND_AT_RELEASE, HAND_Y, V } from './schema';
import type { ReferenceFrameState } from './state';

export interface Drop {
  /** 주기 안 시각(초). */
  u: number;
  /** 놓은 뒤 흐른 시간(초). 놓기 전 0, 착지 후 낙하 시간에 멈춘다. */
  s: number;
  /** 공의 원본 y(아래로 +). */
  y: number;
  /** 손의 공 · 바닥의 공 · 자취가 함께 따르는 알파. */
  alpha: number;
  /** 놓았는가. */
  released: boolean;
}

/** 놓은 뒤 s 초에 공의 원본 y. */
export function ballY(s: number): number {
  return HAND_Y + 0.5 * G * s * s;
}

/** 시간표에서 이번 주기의 낙하를 읽는다. */
export function readDrop(tl: TimelineFrame): Drop {
  const s = tl.at('fall') * FALL;
  // 손에 쥔 공은 주기 초반에 나타나고, 바닥의 공과 자취는 주기 끝에 사라진다.
  const alpha = tl.at('appear') * (1 - tl.at('fade'));
  return { u: tl.u, s, y: ballY(s), alpha, released: tl.u >= tl.start('fall') };
}

/** 땅 판에서 손(=공)의 가로 위치. 기차와 함께 V 로 간다. */
export function groundHandX(tl: TimelineFrame): number {
  return GROUND_HAND_AT_RELEASE + V * (tl.u - tl.start('fall'));
}

/** 땅 판에서 놓은 뒤 s 초에 공이 있던 가로 위치 — 땅에 고정된 자취. */
export function groundTraceX(s: number): number {
  return GROUND_HAND_AT_RELEASE + V * s;
}

/** 쌓는 상태가 없다. */
export function step(params: { state: ReferenceFrameState }): ReferenceFrameState {
  return params.state;
}
