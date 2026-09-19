/**
 * 상태가 시계뿐인 조각이다 (S-sim). 자기력선은 (스테이지 상수, 틈)의 함수이고 틈과 점의
 * 자리는 시간표 진행도의 함수라 쌓을 것이 없다. 캡션에 끼울 값도 없다. 시계는 엔진이
 * `params.timeline` 으로 준다.
 */
export type MagneticFieldLinesState = Record<string, never>;

export function initialState(): MagneticFieldLinesState {
  return {};
}
