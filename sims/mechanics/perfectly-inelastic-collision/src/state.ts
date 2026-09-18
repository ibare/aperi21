/**
 * 상태가 없다. 수레의 자리도 칸의 자리도 모두 조각 시계의 함수이고, 시계는 엔진이
 * 시간표 선언(`schema.timeline`)에서 계산해 `scene` 에 넘긴다 (S-sim 「상태가 시계뿐인 조각」).
 * 쌓는 값이 없으므로 `preroll` 도 없다 — 도착한 순간은 `startAt` 이 만든다.
 */
export type PerfectlyInelasticCollisionState = Record<string, never>;

export function initialState(): PerfectlyInelasticCollisionState {
  return {};
}
