import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 줄기 · 호 · 하늘 물방울이 모두 시간표 진행도의 함수다.
 *
 * 들고 있는 것은 **화면에 뜨는 수의 문자열**뿐이다 — 스테이지 상수(각 정박값 42 · 40, 과장 배율)를 한 번 적어 둔다.
 * 캡션 `vars` 가 state 경로만 가리키므로 여기에 둔다 (G133 우회, `time-dilation` 선례).
 * 계산한 몰림 각(42.4° · 40.7°)을 반올림한 것이 아니다.
 */
export interface RainbowState {
  redDegText: string;
  violetDegText: string;
  gainText: string;
}

export function initialState(params?: { stage?: StageDef }): RainbowState {
  const c = readConstants(params?.stage);
  return {
    redDegText: String(c.redDeg),
    violetDegText: String(c.violetDeg),
    gainText: String(c.spreadGain),
  };
}
