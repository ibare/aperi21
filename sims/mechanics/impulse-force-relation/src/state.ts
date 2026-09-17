/**
 * 공 · 화살표 · 곡선은 주기 안 시각(`params.timeline.u`)의 닫힌 식이라 state 에 없다.
 *
 * state 에 남는 것은 조절기 값과, 캡션 슬롯이 경로로 읽는 것들이다. 캡션은 방석 쪽이 **실제로
 * 멈췄는지**로 문장을 골라야 하는데 그 시각(1 + 조절기 값)은 시간표 단계로 나뉘지 않고, `step` 은
 * `TimelineFrame` 을 받지 못한다. 그래서 주기 안 시각 `u` 를 `step` 이 따로 적분한다 — 시간표와
 * 같은 0 에서 출발하고, 같은 주기에서 되감고, 조절기를 잡는 동안(`held`)에는 러너의 `restart` 와
 * 맞춰 0 에 둔다 (NOTES.md 「어휘 부족」).
 */
import { T_SOFT_DEFAULT } from './schema';
import { derive } from './physics';

export interface ImpulseForceRelationState {
  /** 방석에서 멈추는 데 걸리는 시간 (초). 조절기가 쓴다. */
  tSoft: number;
  /** 조절기를 잡고 있는 동안 true. 러너가 `heldPath` 로 적는다. */
  held: boolean;
  /** 주기 안 시각 (초). 캡션 판정 전용 — 그림은 `timeline.u` 를 읽는다. */
  u: number;
  /** 아직 닿지 않았다. */
  approaching: boolean;
  /** 둘 다 닿아 멈추는 중이고, 방석 시간이 벽과 같다. */
  sameShort: boolean;
  /** 둘 다 닿아 멈추는 중이고, 방석이 더 오래 걸린다. */
  hardHit: boolean;
  /** 벽 쪽은 멈췄고 방석 쪽은 아직 멈추는 중이다. */
  softStopping: boolean;
  /** 둘 다 멈췄고, 방석 시간이 벽과 같았다. */
  sameDone: boolean;
}

export function initialState(): ImpulseForceRelationState {
  return derive(T_SOFT_DEFAULT, 0, false);
}
