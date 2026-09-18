/**
 * 상태가 없다. 물체의 자리도, 문지른 거리도, 바닥에 쌓인 열의 분포도 모두
 * 시간표 선언(`schema.timeline`)이 준 시각의 함수다 (S-sim 「상태가 시계뿐인 조각」).
 */
export type EnergyDissipationState = Record<string, never>;

export function initialState(): EnergyDissipationState {
  return {};
}
