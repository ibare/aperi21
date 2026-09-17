/**
 * 상태가 없다. 세 상자 · 손 · 띠가 모두 올린 정도의 함수이고, 올린 정도는 시간표
 * 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 값의 함수다.
 */
export type MechanicalAdvantageState = Record<string, never>;

export function initialState(): MechanicalAdvantageState {
  return {};
}
