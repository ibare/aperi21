/**
 * 상태가 없다.
 *
 * 원본은 재료 상태(남은 변형률)와 지나온 점 목록을 매 프레임 쌓았다. 그러나 한
 * 바퀴 안에서 당김은 늘 한 방향이고 놓기는 힘을 곧게 줄이는 것이라, 쌓인 값은
 * **시각의 닫힌 함수**다 — 당긴 만큼이 곧 남은 변형률을 정하고, 자취는 탄성 직선 ·
 * 뼈대곡선 · 하중 제거 직선의 이음이다. 그래서 같은 시각은 언제나 같은 화면이고,
 * 계산은 `physics.ts` 가 시간표 값에서 한다.
 */
export type StressStrainCurveState = Record<string, never>;

export function initialState(): StressStrainCurveState {
  return {};
}
