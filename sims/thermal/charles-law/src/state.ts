// ========================================================================
// charles-law — 상태
// ========================================================================
// 쌓는 것이 없다. 피스톤 높이 · 찍힌 점 · 이어진 선은 모두 시간표 시각의 함수다.
// state 에 두는 것은 캡션 · 눈금 글자가 끼울 **선언값의 글자** 뿐이다. 캡션 `vars` 가
// state 경로만 가리키므로(장부 G133) 스테이지 상수를 여기서 한 번 글자로 옮긴다.
// 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface CharlesLawState {
  /** 시작 온도 · 끝 온도 · 점 찍는 간격(℃), 섭씨 → 절대온도 간격 — 선언값 그대로의 글자. */
  tStart: string;
  tEnd: string;
  tStep: string;
  kelvinOffset: string;
}

export function initialState(params: { stage: StageDef }): CharlesLawState {
  const c = readConstants(params.stage);
  return {
    tStart: String(c.tStart),
    tEnd: String(c.tEnd),
    tStep: String(c.tStep),
    kelvinOffset: String(c.kelvinOffset),
  };
}
