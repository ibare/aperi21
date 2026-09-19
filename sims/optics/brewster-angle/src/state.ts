// ========================================================================
// brewster-angle — 상태
// ========================================================================
// 입사각 · 표식 · 지금 점은 모두 시간표 시각의 함수라 쌓는 것이 없다. state 에 두는 것은
// 캡션 `vars` 와 이름표가 쓸 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로
// (장부 G133) 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface BrewsterAngleState {
  /** 정박 입사각(°) 글자. */
  deg0: string;
  deg1: string;
  deg2: string;
  /** 두 줄기 사이 직각(°) 글자. */
  rightDeg: string;
  /** 유리 굴절률 글자. */
  nGlass: string;
}

export function initialState(params: { stage: StageDef }): BrewsterAngleState {
  const c = readConstants(params.stage);
  const [d0, d1, d2] = c.deg;
  return {
    deg0: String(d0),
    deg1: String(d1),
    deg2: String(d2),
    rightDeg: String(c.rightDeg),
    nGlass: String(c.nGlass),
  };
}
