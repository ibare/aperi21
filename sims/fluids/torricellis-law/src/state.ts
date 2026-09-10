/**
 * 상태가 없다. 물줄기는 엔진 시계의 함수이고, 표지와 캡션은 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 값의 함수다.
 */
export type TorricellisLawState = Record<string, never>;

export function initialState(): TorricellisLawState {
  return {};
}
