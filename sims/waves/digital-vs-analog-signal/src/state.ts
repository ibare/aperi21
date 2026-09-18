/**
 * 쌓는 상태가 없다. 모든 칸의 신호가 스테이지 상수와 시드 결정적 잡음에서 나오고,
 * 칸에 얼마나 그려졌는지는 시간표 진행도가 정한다 (S-sim 「상태가 시계뿐인 조각」).
 */
export type DigitalVsAnalogSignalState = Record<string, never>;

export function initialState(): DigitalVsAnalogSignalState {
  return {};
}
