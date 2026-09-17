/**
 * 추의 자리와 자취는 주기 안 시각(`params.timeline.u`)의 닫힌 식이라 state 에 없다.
 *
 * state 에 남는 것은 조절기 값과, 캡션 슬롯이 경로로 읽는 것들이다. 캡션은 **실제 착지**로
 * 문장을 골라야 하는데 `step` 은 `TimelineFrame` 을 받지 못한다. 그래서 주기 안 시각 `tau` 를
 * `step` 이 따로 적분한다 — 시간표와 같은 시각(`startAt`)에서 출발하고, 같은 주기에서 되감고,
 * 조절기를 잡는 동안(`held`)에는 러너의 `restart` 와 맞춰 0 에 둔다 (NOTES.md 「어휘 부족」).
 */
import { DIFF_DEFAULT, LEAD } from './schema';
import { derive } from './physics';

export interface AtwoodMachineState {
  /** 오른쪽 기계의 두 추 차이 (kg). 조절기가 쓴다. */
  diff: number;
  /** 조절기를 잡고 있는 동안 true. 러너가 `heldPath` 로 적는다. */
  held: boolean;
  /** 주기 안 시각 (s). 캡션 판정 전용 — 그림은 `timeline.u` 를 읽는다. */
  tau: number;
  /** 차이가 0 — 오른쪽 추가 움직이지 않는다. */
  still: boolean;
  /** 차이가 왼쪽 기계와 같다. */
  equal: boolean;
  /** 두 무거운 추가 모두 바닥에 닿았다. */
  bothLanded: boolean;
  /** 오른쪽만 닿았다. */
  rightOnlyLanded: boolean;
  /** 왼쪽만 닿았다 (오른쪽이 움직이는 경우). */
  leftOnlyLanded: boolean;
  /** 캡션의 배수 (소수 첫째 자리). */
  ratioText: string;
  /** 캡션의 도착 시각 (소수 둘째 자리). 오른쪽이 닿지 않으면 빈 문자열. */
  tLeftText: string;
  tRightText: string;
}

export function initialState(): AtwoodMachineState {
  return derive(DIFF_DEFAULT, LEAD, false);
}
