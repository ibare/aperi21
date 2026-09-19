/**
 * 상태가 시계뿐인 조각이다 (S-sim). 자석의 자리는 시간표 `sweep` 진행도의 함수이고,
 * 물건의 자리는 자석 자리의 함수라 쌓을 것이 없다. 시계는 엔진이 `params.timeline` 으로 준다.
 * 캡션에 끼울 선언값도 없어 비어 있다.
 */
export type MagnetAttractionState = Record<string, never>;

export function initialState(): MagnetAttractionState {
  return {};
}
