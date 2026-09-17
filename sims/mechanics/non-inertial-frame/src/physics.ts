// ========================================================================
// non-inertial-frame — 순수 물리
// ========================================================================
// 세계 상태는 하나다 — 버스가 간 거리 s 와 버스 안 공의 자리. 두 판이 다른 것은
// 무엇에 대해 재느냐(땅이냐 버스냐)뿐이다.
// ========================================================================

import type { TimelineFrame } from '@aperi21/schema';
import { A, BALL_R, BALL_START } from './schema';
import type { NonInertialFrameState } from './state';

export interface Ride {
  /** 버스가 길 위에서 간 거리(m). */
  s: number;
  /** 버스 뒷벽에서 공 중심까지(m). 마찰 없는 바닥이라 땅에 대해 정지 — 뒷벽에 닿으면 붙는다. */
  ballRel: number;
  /** 판 전체의 불투명도. 주기 끝에 흐려졌다가 처음 자리로 다시 나타난다. */
  alpha: number;
}

/** 시간표에서 이번 주기의 버스와 공을 읽는다. */
export function readRide(tl: TimelineFrame): Ride {
  // 출발한 뒤 흐른 시간. 다시 나타나는 단계는 처음 자리에 선 버스다.
  const drive = tl.phase === 'fadeIn' ? 0 : Math.max(0, tl.u - tl.start('slide'));
  const s = 0.5 * A * drive * drive;
  const ballRel = Math.max(BALL_R, BALL_START - s);
  // 흐려질 때 1→0, 다시 나타날 때 0→1.
  const alpha = 1 - tl.at('fadeOut') + tl.at('fadeIn');
  return { s, ballRel, alpha };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: NonInertialFrameState }): NonInertialFrameState {
  return params.state;
}
