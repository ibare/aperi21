/**
 * 상태가 시계뿐인 조각이다 (S-sim). 쇳가루의 자리는 시드의 함수이고 각은 자석을 놓은 뒤
 * 흐른 시간의 닫힌 꼴 함수라, 쌓을 것이 없다. 시계는 엔진이 `params.timeline` 으로 준다.
 */
export type MagneticFieldState = Record<string, never>;

export function initialState(): MagneticFieldState {
  return {};
}
