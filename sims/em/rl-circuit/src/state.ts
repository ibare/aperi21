/**
 * 상태는 독자가 고른 코일 하나뿐이다. 전류 · 두 전압은 모두 시간표 시각의 함수라 쌓지 않는다
 * (physics.ts). 칩을 누르면 러너가 조각 시계를 주기 첫머리로 되돌린다(`restart`) — 열린
 * 스위치부터 다시 닫아 보인다.
 */
export interface RlCircuitState {
  /** 고른 코일. `small` 은 스테이지 상수 `inductance`, `large` 는 `inductanceLarge`. 칩 줄이 쓴다. */
  coil: 'small' | 'large';
}

export function initialState(): RlCircuitState {
  return { coil: 'small' };
}
