/**
 * 쌓는 상태가 없다. 줄기 모양은 스테이지 상수의 함수이고, 진행은 시간표 진행도의 함수다.
 * 캡션 · 이름표에 수를 끼우지 않으므로 글자도 들고 있지 않다.
 */
export type MirageState = Record<string, never>;

export function initialState(): MirageState {
  return {};
}
