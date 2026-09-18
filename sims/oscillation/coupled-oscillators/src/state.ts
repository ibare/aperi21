/**
 * 쌓는 상태가 없다. 두 추의 자리 · 흔들림 폭 · 에너지 몫이 모두 조각 시계의
 * 함수다 (약결합 선형 진자의 해석해).
 */
export type CoupledOscillatorsState = Record<string, never>;

export function initialState(): CoupledOscillatorsState {
  return {};
}
