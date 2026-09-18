/**
 * 쌓는 상태가 없다. 파면 · 음원 · 관찰자 · 눈금이 모두 시간표 시각의 함수다
 * (S-sim 「상태가 시계뿐인 조각」).
 */
export type DopplerSourceVsObserverState = Record<string, never>;

export function initialState(): DopplerSourceVsObserverState {
  return {};
}
