// ========================================================================
// buoyant-force-as-force — 런타임 상태
// ========================================================================
// 그림은 모두 시각의 함수다 — 손잡이 높이는 `params.timeline` 에서, 평형은 그 높이에서
// 매번 푼다. state 에 남는 것은 **캡션 슬롯이 경로로 읽는 판정**뿐이다.
//
// 캡션은 잠긴 깊이로 문장을 고르는데 `step` 은 `TimelineFrame` 을 받지 못한다. 그래서
// 주기 안 시각 `u` 를 `step` 이 따로 센다 — 시간표와 같은 자리(`START_AT`)에서 출발하고
// 같은 주기에서 되감는다 (NOTES.md 「어휘 부족」).
// ========================================================================

import { deriveFlags } from './physics';
import { START_AT } from './schema';

export interface BuoyantForceAsForceState {
  /** 주기 안 시각(초). 캡션 판정 전용 — 그림은 `timeline` 을 읽는다. */
  readonly u: number;
  /** 물 밖이다(잠긴 깊이 ≤ 여유). */
  readonly out: boolean;
  /** 다 잠겼다(잠긴 깊이 ≥ 물체 세로 − 여유). */
  readonly full: boolean;
}

export function initialState(): BuoyantForceAsForceState {
  return deriveFlags(START_AT);
}
