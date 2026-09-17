/**
 * 상태가 없다. 줄 · 마디 · 시간 자취 무늬는 모두 조각 시계의 함수이고, 시계는 엔진이
 * 시간표 선언(`schema.timeline`)에서 `scene` 에 `params.timeline` 으로 준다 (S-sim).
 * 무늬의 과거 행도 쌓지 않고 시각 t' 로 다시 계산한다 — `?t=` 로 연 화면이 같아야 한다.
 */
export type StandingWaveState = Record<string, never>;

export function initialState(): StandingWaveState {
  return {};
}
