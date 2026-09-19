// ========================================================================
// chromatic-aberration — 상태
// ========================================================================
// 쌓는 상태가 없다. 줄기 · 초점 · 스크린 · 원판이 모두 시간표 진행도의 함수다.
//
// 들고 있는 것은 **화면에 뜨는 수의 문자열**뿐이다 — 과장 배율(스테이지 상수)을 한 번 적어
// 둔다. 이름표 `vars` 로 끼운다 (G133 우회, `time-dilation` · `dispersion` 선례).
// 계산한 값을 반올림한 것이 아니다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface ChromaticAberrationState {
  gainText: string;
}

export function initialState(params?: { stage?: StageDef }): ChromaticAberrationState {
  const c = readConstants(params?.stage);
  return { gainText: String(c.focusGain) };
}
