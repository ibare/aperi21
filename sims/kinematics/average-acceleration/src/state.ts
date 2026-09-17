/**
 * 상태가 없다. 두 차의 속도·위치는 해석식이고, 연출은 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 값의 함수다.
 */
export type AverageAccelerationState = Record<string, never>;

export function initialState(): AverageAccelerationState {
  return {};
}
