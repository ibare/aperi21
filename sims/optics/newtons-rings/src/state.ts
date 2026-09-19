/**
 * 상태가 없다. 무늬 · 단면은 스테이지 상수의 함수이고, 안내선이 그어지는 정도는 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 캡션에 스테이지 상수의 값을 끼우지 않으므로 캡션 `vars` 용 글자도 두지 않는다 — 화면의 수(과장 배율)는
 * scene 의 `readout` 이 `readConstants` 로 직접 끼운다.
 */
export type NewtonsRingsState = Record<string, never>;

export function initialState(): NewtonsRingsState {
  return {};
}
