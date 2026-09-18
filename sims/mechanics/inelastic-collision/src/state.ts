/**
 * 쌓는 상태가 없다. 공의 자리 · 궤적 · 꼭짓점이 모두 시간표 진행도의 함수다
 * (S-sim 「상태가 시계뿐인 조각」). 조작기도 없어 고를 값도 없다.
 */
export type InelasticCollisionState = Record<string, never>;

export function initialState(): InelasticCollisionState {
  return {};
}
