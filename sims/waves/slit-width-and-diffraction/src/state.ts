/**
 * 쌓는 상태가 없다. 두 수조의 물결 · 앞머리 · 가라앉음이 모두 조각 시계의 함수라, 시계는 엔진이
 * 시간표 선언에서 `scene` 에 `params.timeline` 으로 준다 (S-sim 「상태가 시계뿐인 조각」).
 */
export type SlitWidthAndDiffractionState = Record<string, never>;

export function initialState(): SlitWidthAndDiffractionState {
  return {};
}
