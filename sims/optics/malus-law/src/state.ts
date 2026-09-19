// ========================================================================
// malus-law — 상태
// ========================================================================
// 판의 각 · 막대 · 지금 점은 모두 시간표 시각의 함수라 쌓는 것이 없다. state 에 두는 것은
// 캡션 `vars` 가 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로
// (장부 G133) 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface MalusLawState {
  /** 정박 각(°) 글자. */
  deg0: string;
  deg1: string;
  deg2: string;
  deg3: string;
  deg4: string;
  /** 정박 세기 몫 글자. */
  int0: string;
  int1: string;
  int2: string;
  int3: string;
  int4: string;
  /** 정박 성분 몫 글자. */
  amp0: string;
  amp1: string;
  amp2: string;
  amp3: string;
  amp4: string;
}

export function initialState(params: { stage: StageDef }): MalusLawState {
  const c = readConstants(params.stage);
  const [d0, d1, d2, d3, d4] = c.deg;
  const [i0, i1, i2, i3, i4] = c.intensity;
  const [a0, a1, a2, a3, a4] = c.component;
  return {
    deg0: String(d0),
    deg1: String(d1),
    deg2: String(d2),
    deg3: String(d3),
    deg4: String(d4),
    int0: String(i0),
    int1: String(i1),
    int2: String(i2),
    int3: String(i3),
    int4: String(i4),
    amp0: String(a0),
    amp1: String(a1),
    amp2: String(a2),
    amp3: String(a3),
    amp4: String(a4),
  };
}
