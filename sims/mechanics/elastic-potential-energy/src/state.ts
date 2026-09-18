/**
 * 상태가 없다. 두 공의 자리 · 용수철 길이 · 치수선이 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다 — 튀어 오름은
 * 닫힌 식으로 풀린다(`physics.ts` `displacementAfterRelease`).
 *
 * 누적할 것이 없으므로 `preroll` 도 쓰지 않는다 — 도착한 순간 이미 진행 중인
 * 그림은 `startAt` 이 만든다.
 */
export type ElasticPotentialEnergyState = Record<string, never>;

export function initialState(): ElasticPotentialEnergyState {
  return {};
}
