/**
 * 상태가 없다. 렌즈 · 두 초점 · 물체 · 상 · 세 광선의 자리가 모두 스테이지 상수와
 * 시간표 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 화면에 수가 하나도 뜨지 않으므로 캡션 `vars` 에 끼울 글자도 없다 — 이 조각이
 * 말하는 것은 값이 아니라 **세 선이 한 점에서 만난다** 는 사실 하나다.
 */
export type ThinLensState = Record<string, never>;

export function initialState(): ThinLensState {
  return {};
}
