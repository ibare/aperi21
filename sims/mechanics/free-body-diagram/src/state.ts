import type { ObjectId } from './schema';

/**
 * 누적 상태. 원본 `{ k, pt }` 그대로다 — 지금 떼어 내는 물체의 순서 번호와 그 주기 안
 * 시각. 물체를 누르면 그 물체의 주기 한가운데로 뛰므로 조각 시계의 함수가 아니다.
 */
export interface FreeBodyDiagramState {
  /** 지금 떼어 내는 물체 — `ORDER` 의 번호. */
  k: number;
  /** 그 물체 주기 안 시각(초). */
  pt: number;
  /** 물체 누름. 러너가 true 를 적고, 소비한 걸음에서 `step` 이 지운다. */
  pressed: Record<ObjectId, boolean>;
  /**
   * 캡션 슬롯의 `cases` 가 보는 플래그. 물체 셋 × 떼어 냄/도착/돌려놓음 중 **하나만** 참이다.
   * 문안이 아니라 조건의 결과만 담는다 (C1).
   */
  caption: {
    bookLift: boolean;
    bookFree: boolean;
    bookBack: boolean;
    cupLift: boolean;
    cupFree: boolean;
    cupBack: boolean;
    tableLift: boolean;
    tableFree: boolean;
    tableBack: boolean;
  };
}

export function initialState(): FreeBodyDiagramState {
  return {
    k: 0,
    pt: 0,
    pressed: { book: false, cup: false, table: false },
    caption: {
      bookLift: true,
      bookFree: false,
      bookBack: false,
      cupLift: false,
      cupFree: false,
      cupBack: false,
      tableLift: false,
      tableFree: false,
      tableBack: false,
    },
  };
}
