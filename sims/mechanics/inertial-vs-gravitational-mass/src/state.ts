/**
 * 원본처럼 **누적 상태**로 움직인다. 시험 수가 물체 질량을 따라 달라져 시간표 단계로
 * 적을 수 없고, 저울 각은 적분이다 (schema.ts `preroll` 머리말).
 *
 * 나머지(`n` · `released` · 캡션 판정)는 시계와 물체에서 계산해 두는 값이다 — 캡션 슬롯이
 * state 경로로 읽는다.
 */
import { DEFAULT_OBJECT, type ObjectKey } from './schema';
import { derive } from './physics';

export interface InertialVsGravitationalMassState {
  /** 고른 물체. 물체 고르기 칩이 쓴다. */
  obj: ObjectKey;
  /** 지금 시험 중인 물체. `obj` 와 다르면 step 이 추 1 개부터 다시 놓는다. */
  shownObj: ObjectKey;
  /** 칩을 누르고 있는 동안 true. 러너가 `heldPath` 로 적는다. */
  held: boolean;
  /** 시험 시계 (s). 한 바퀴(추 1 개 ~ 맞는 개수)를 넘으면 되감아 읽는다. */
  clock: number;
  /** 지금 시험 번호 (0 부터). 바뀌면 저울·얼음을 처음으로 되돌린다. */
  trial: number;
  /** 저울대 각 (rad, 양수면 물체 쪽이 내려간다) · 각속도. */
  theta: number;
  omega: number;
  /** 얼음 위 물체 · 추의 변위 (월드 px). 물체는 왼쪽(음수), 추는 오른쪽(양수). */
  objX: number;
  wX: number;

  // ---- 시계와 물체에서 계산한 값 ----
  /** 지금 올린 추 개수. */
  n: number;
  /** 받침·용수철을 놓았는가. */
  released: boolean;
  /** 캡션의 추 개수. */
  nText: string;
  /** 놓은 뒤 추가 모자라다 — 물체마다 한 문장이라 셋으로 나눈다. */
  shortStone: boolean;
  shortIron: boolean;
  shortWood: boolean;
  /** 놓은 뒤 추 개수가 물체 질량과 같다. */
  matched: boolean;
}

export function initialState(): InertialVsGravitationalMassState {
  return derive({
    obj: DEFAULT_OBJECT,
    shownObj: DEFAULT_OBJECT,
    held: false,
    clock: 0,
    trial: 0,
    theta: 0,
    omega: 0,
    objX: 0,
    wX: 0,
  });
}
