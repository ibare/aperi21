import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 섬유 모양 · 광선 · 부채가 모두 시간표 진행도의 함수다.
 *
 * 들고 있는 것은 **화면에 뜨는 수의 문자열**뿐이다 — 스테이지 상수(정박값)를 그대로 적어 둔다.
 * 캡션 `vars` 가 state 경로만 가리키므로 여기에 둔다 (G133 우회, `time-dilation` 선례).
 * 계산한 각을 반올림한 것이 아니다.
 */
export interface OpticalFiberState {
  criticalText: string;
  coreIndexText: string;
  cladIndexText: string;
}

export function initialState(params?: { stage?: StageDef }): OpticalFiberState {
  const c = readConstants(params?.stage);
  return {
    criticalText: String(c.criticalDeg),
    coreIndexText: String(c.nCore),
    cladIndexText: String(c.nClad),
  };
}
