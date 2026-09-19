import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 줄기 · 띠 · 괄호가 모두 스테이지 상수와 시간표 진행도의 함수다.
 *
 * 들고 있는 것은 **화면에 뜨는 수의 문자열**뿐이다 — 스테이지 상수(정박값)를 한 번 적어 둔다
 * (G133 우회, `time-dilation` 선례). 계산한 값을 반올림한 것이 아니다.
 */
export interface PrismState {
  apexText: string;
  gainText: string;
}

export function initialState(params?: { stage?: StageDef }): PrismState {
  const c = readConstants(params?.stage);
  return {
    apexText: String(c.apexDeg),
    gainText: String(c.indexGain),
  };
}
