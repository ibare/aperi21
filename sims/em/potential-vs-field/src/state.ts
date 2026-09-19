/**
 * 상태가 없다. 탐침의 자리 · 읽어 남긴 화살표 · 접선이 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 캡션에 스테이지 상수의 값을 끼우지 않으므로(수 없는 문장) 글자를 옮겨 둘 것도 없다.
 * 도착한 순간 이미 진행 중인 그림은 `startAt` 이 만든다.
 */
export type PotentialVsFieldState = Record<string, never>;

export function initialState(): PotentialVsFieldState {
  return {};
}
