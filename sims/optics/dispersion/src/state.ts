import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 줄기 · 곡선 · 점이 모두 시간표 진행도의 함수다.
 *
 * 들고 있는 것은 **화면에 뜨는 수의 문자열**뿐이다 — 스테이지 상수(정박값)를 한 번 적어 둔다.
 * 캡션 `vars` 가 state 경로만 가리키므로 여기에 둔다 (G133 우회, `time-dilation` 선례).
 * 굴절률은 선언한 자릿수로 적는다 — `String(1.53)` 이 `"1.53"` 이 되어 끝자리 0 을 잃기 때문이다.
 * 계산한 값을 반올림한 것이 아니다.
 */
export interface DispersionState {
  incidentText: string;
  gainText: string;
  nmRedText: string;
  nmBlueText: string;
  nmVioletText: string;
  nRedText: string;
  nBlueText: string;
  nVioletText: string;
}

export function initialState(params?: { stage?: StageDef }): DispersionState {
  const c = readConstants(params?.stage);
  const idx = (v: number): string => v.toFixed(c.indexDigits);
  return {
    incidentText: String(c.incidentDeg),
    gainText: String(c.spreadGain),
    nmRedText: String(c.nmRed),
    nmBlueText: String(c.nmBlue),
    nmVioletText: String(c.nmViolet),
    nRedText: idx(c.nRed),
    nBlueText: idx(c.nBlue),
    nVioletText: idx(c.nViolet),
  };
}
