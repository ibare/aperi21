/**
 * 상태가 없다. 원판의 회전 · 과녁 · 공 · 지나간 길이 모두 조각 시계의 해석적 함수이고,
 * 주기 안 단계는 시간표 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 값이다.
 */
export type CoriolisEffectState = Record<string, never>;

export function initialState(): CoriolisEffectState {
  return {};
}
