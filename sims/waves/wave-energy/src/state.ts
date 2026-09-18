/**
 * 쌓는 상태가 없다. 두 줄의 물결 · 끝 고리의 속도 · 막대에 쌓인 에너지는 모두 조각
 * 시계의 함수다 — 막대도 `fill` 단계 시작부터 받은 일률을 식으로 적분해 얻는다.
 * 시계는 엔진이 시간표 선언에서 `scene` 에 `params.timeline` 으로 준다 (S-sim).
 */
export type WaveEnergyState = Record<string, never>;

export function initialState(): WaveEnergyState {
  return {};
}
