/**
 * 상태가 비어 있다 — 모든 것이 시각의 함수다.
 *
 * 도착 시각은 간격 함수의 누적합이고, 전자마다의 자리는 시드 난수로 미리 뽑아 둔 목록에서 온다
 * (`model.ts`). 시계는 엔진이 시간표 선언에서 `scene` 에 `params.timeline` 으로 준다 (S-sim).
 */
export type DoubleSlitWithElectronsState = Record<string, never>;

export function initialState(): DoubleSlitWithElectronsState {
  return {};
}
