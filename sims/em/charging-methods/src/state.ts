/**
 * 쌓는 상태가 없다. 물체 · 전자의 자리가 모두 시간표 진행도의 함수다
 * (S-sim 「상태가 시계뿐인 조각」). 캡션에 끼울 선언값도 없어 비어 있다.
 */
export type ChargingMethodsState = Record<string, never>;

export function initialState(): ChargingMethodsState {
  return {};
}
